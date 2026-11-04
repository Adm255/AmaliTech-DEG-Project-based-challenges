#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
  echo "Usage: $0 ghcr.io/owner/image:<40-character-git-sha>" >&2
  exit 2
}

[[ $# -eq 1 ]] || usage
image_ref=$1

if [[ ! $image_ref =~ ^[^[:space:]]+:[0-9a-fA-F]{40}$ ]]; then
  echo "Deployment requires an image tag containing a 40-character Git commit SHA." >&2
  exit 2
fi

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
project_dir=$(cd -- "$script_dir/.." && pwd)
upstream_file="$script_dir/nginx/active-upstream.conf"
compose_file="$project_dir/docker-compose.vm.yml"
proxy_service=deployready-vm-proxy
network_name=deployready-vm
attempts=${HEALTH_ATTEMPTS:-30}
delay=${HEALTH_DELAY_SECONDS:-2}
release_id=${image_ref##*:}
candidate="deployready-candidate-${release_id:0:12}-$(date +%s)"

if ! [[ $attempts =~ ^[1-9][0-9]*$ && $delay =~ ^[0-9]+$ ]]; then
  echo "HEALTH_ATTEMPTS must be positive and HEALTH_DELAY_SECONDS must be zero or greater." >&2
  exit 2
fi

export DEPLOY_IMAGE=$image_ref
compose=(docker compose --project-name deployready-vm --file "$compose_file")

if [[ ! -f $upstream_file ]]; then
  echo "Missing upstream configuration: $upstream_file" >&2
  exit 1
fi

previous_backend=$(sed -nE 's/^[[:space:]]*set[[:space:]]+\$backend[[:space:]]+([^;]+);.*$/\1/p' "$upstream_file" | tail -n 1)
previous_container=${previous_backend%:3000}
previous_available=false
if [[ -n $previous_backend && $previous_container != deployready-unconfigured ]]; then
  previous_status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' "$previous_container" 2>/dev/null || true)
  if [[ $previous_status == healthy ]]; then
    previous_available=true
  fi
fi

write_backend() {
  local container_name=$1
  local temporary_file="${upstream_file}.tmp"
  printf 'set $backend %s:3000;\n' "$container_name" > "$temporary_file"
  mv -f -- "$temporary_file" "$upstream_file"
}

reload_proxy() {
  docker exec "$proxy_service" nginx -t -c /etc/nginx/deploy/nginx.conf >/dev/null
  docker exec "$proxy_service" nginx -s reload -c /etc/nginx/deploy/nginx.conf
}

rollback() {
  local reason=$1
  echo "Deployment verification failed: $reason" >&2
  if [[ $previous_available == true ]]; then
    echo "Restoring previous healthy release: $previous_container" >&2
    write_backend "$previous_container"
    if ! reload_proxy; then
      echo "ERROR: could not reload the reverse proxy with the previous release." >&2
    fi
  else
    echo "No previous healthy release was available to restore." >&2
  fi
  docker rm -f "$candidate" >/dev/null 2>&1 || true
  exit 1
}

"${compose[@]}" up --detach proxy
docker pull "$image_ref"
docker network inspect "$network_name" >/dev/null

echo "Starting candidate $candidate from $image_ref"
"${compose[@]}" run --detach --no-deps --name "$candidate" app

healthy=false
for ((attempt = 1; attempt <= attempts; attempt++)); do
  status=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' "$candidate" 2>/dev/null || true)
  case "$status" in
    healthy)
      healthy=true
      break
      ;;
    unhealthy|missing)
      echo "Candidate health check failed on attempt $attempt/$attempts (state: $status)." >&2
      break
      ;;
    *)
      echo "Waiting for candidate health: attempt $attempt/$attempts (state: $status)."
      ;;
  esac
  if (( attempt < attempts )); then
    sleep "$delay"
  fi
done

if [[ $healthy != true ]]; then
  docker logs --tail 50 "$candidate" >&2 || true
  docker rm -f "$candidate" >/dev/null 2>&1 || true
  echo "Candidate never became healthy; the active backend was not changed." >&2
  exit 1
fi

write_backend "$candidate"
if ! reload_proxy; then
  rollback "reverse proxy rejected the candidate configuration"
fi

response_file=$(mktemp)
if http_status=$(curl --silent --show-error --max-time 10 \
  --output "$response_file" --write-out '%{http_code}' \
  http://127.0.0.1/health); then
  curl_status=0
else
  curl_status=$?
fi

if [[ $curl_status -ne 0 || $http_status != 200 ]]; then
  rm -f -- "$response_file"
  rollback "proxy health request failed (curl exit $curl_status, HTTP ${http_status:-000})"
fi

if ! grep -Eq '^[[:space:]]*\{[[:space:]]*"status"[[:space:]]*:[[:space:]]*"ok"[[:space:]]*\}[[:space:]]*$' "$response_file"; then
  echo "Unexpected health response body:" >&2
  head -c 4096 "$response_file" >&2 || true
  rm -f -- "$response_file"
  rollback "health response was not JSON with status ok"
fi
rm -f -- "$response_file"

echo "Deployment healthy: $image_ref is serving through the port 80 reverse proxy."
if [[ $previous_available == true ]]; then
  echo "Previous release retained for rollback: $previous_container"
fi
