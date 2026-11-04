#!/usr/bin/env bash
set -Eeuo pipefail

test_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
project_dir=$(cd -- "$test_dir/../.." && pwd)
source_script="$project_dir/deploy/deploy-release.sh"
tmp_dir=$(mktemp -d)
trap 'rm -rf -- "$tmp_dir"' EXIT

fixture="$tmp_dir/project"
mock_bin="$tmp_dir/bin"
mkdir -p "$fixture/deploy/nginx" "$mock_bin"
cp "$source_script" "$fixture/deploy/deploy-release.sh"
release_script="$fixture/deploy/deploy-release.sh"
cp "$project_dir/docker-compose.vm.yml" "$fixture/docker-compose.vm.yml"
cp "$project_dir/deploy/nginx/nginx.conf" "$fixture/deploy/nginx/nginx.conf"
cp "$project_dir/deploy/nginx/active-upstream.conf" "$fixture/deploy/nginx/active-upstream.conf"

cat > "$mock_bin/docker" <<'MOCK_DOCKER'
#!/usr/bin/env bash
set -euo pipefail
printf 'docker %s\n' "$*" >> "$VM_TEST_DOCKER_LOG"
case "$1" in
  inspect)
    if [[ -n ${VM_TEST_OLD_BACKEND:-} && $* == *"$VM_TEST_OLD_BACKEND"* ]]; then
      echo "${VM_TEST_PREVIOUS_STATUS:-healthy}"
    else
      echo healthy
    fi
    ;;
  compose|pull|network|exec|logs|rm)
    ;;
  *)
    echo "Unexpected docker command: $*" >&2
    exit 90
    ;;
esac
MOCK_DOCKER

cat > "$mock_bin/curl" <<'MOCK_CURL'
#!/usr/bin/env bash
set -euo pipefail
output_file=
while (($#)); do
  case "$1" in
    --output)
      output_file=$2
      shift 2
      ;;
    --write-out)
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done
[[ -n $output_file ]]
if [[ -n ${VM_TEST_BODY:-} ]]; then
  printf '%s' "$VM_TEST_BODY" > "$output_file"
else
  printf '%s' '{"status":"ok"}' > "$output_file"
fi
printf '%s' "${VM_TEST_HTTP_STATUS:-200}"
MOCK_CURL

chmod +x "$mock_bin/docker" "$mock_bin/curl"
export PATH="$mock_bin:$PATH"
export VM_TEST_DOCKER_LOG="$tmp_dir/docker.log"
image_base=ghcr.io/adm255/deployready-app
sha=0123456789abcdef0123456789abcdef01234567
old_backend=deployready-previous-release
export VM_TEST_OLD_BACKEND=$old_backend

expect_rejected() {
  local output_file="$tmp_dir/rejected.txt"
  if bash "$release_script" "$@" > "$output_file" 2>&1; then
    echo "Expected invalid deployment arguments to be rejected: $*" >&2
    exit 1
  fi
}

: > "$VM_TEST_DOCKER_LOG"
expect_rejected
expect_rejected "$image_base:latest"
expect_rejected "$image_base:0123456"
expect_rejected "ghcr.io/other/image:$sha"
expect_rejected "$image_base:0123456789ABCDEF0123456789ABCDEF01234567"
if [[ -s $VM_TEST_DOCKER_LOG ]]; then
  echo "Docker was called before invalid image references were rejected." >&2
  exit 1
fi

upstream_file="$fixture/deploy/nginx/active-upstream.conf"
printf 'set $backend %s:3000;\n' "$old_backend" > "$upstream_file"
VM_TEST_HTTP_STATUS=200 bash "$release_script" "$image_base:$sha" > "$tmp_dir/success.txt"
grep -Fq 'Deployment healthy:' "$tmp_dir/success.txt"
if ! grep -Fq 'deployready-candidate-' "$upstream_file"; then
  echo "Successful deployment did not update the active backend:" >&2
  cat "$upstream_file" >&2
  cat "$tmp_dir/success.txt" >&2
  cat "$VM_TEST_DOCKER_LOG" >&2
  exit 1
fi
grep -Fq "${sha:0:12}" "$upstream_file"
if grep -Fq 'docker rm -f' "$VM_TEST_DOCKER_LOG"; then
  echo "Successful deployment unexpectedly removed a container." >&2
  exit 1
fi

: > "$VM_TEST_DOCKER_LOG"
printf 'set $backend %s:3000;\n' "$old_backend" > "$upstream_file"
if VM_TEST_HTTP_STATUS=503 bash "$release_script" "$image_base:$sha" > "$tmp_dir/failure.txt" 2>&1; then
  echo "Expected failed post-switch health verification to fail the deployment." >&2
  exit 1
fi
grep -Fq "$old_backend:3000" "$upstream_file"
grep -Fq "Restoring previous healthy release: $old_backend" "$tmp_dir/failure.txt"
grep -Fq 'docker rm -f deployready-candidate-' "$VM_TEST_DOCKER_LOG"

: > "$VM_TEST_DOCKER_LOG"
printf 'set $backend deployready-unconfigured:3000;\n' > "$upstream_file"
if VM_TEST_PREVIOUS_STATUS=missing VM_TEST_HTTP_STATUS=503 \
  bash "$release_script" "$image_base:$sha" > "$tmp_dir/first-release-failure.txt" 2>&1; then
  echo "Expected failed first deployment health verification to fail." >&2
  exit 1
fi
grep -Fq 'set $backend deployready-unconfigured:3000;' "$upstream_file"
grep -Fq 'No previous healthy release was available' "$tmp_dir/first-release-failure.txt"
grep -Fq 'docker rm -f deployready-candidate-' "$VM_TEST_DOCKER_LOG"

echo "VM release-script tests passed (invalid tags rejected; healthy deploy switches; failed health restores prior backend; first-release failure resets route)."
