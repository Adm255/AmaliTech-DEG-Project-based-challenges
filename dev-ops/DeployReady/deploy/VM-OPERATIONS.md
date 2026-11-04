# Provider-neutral VM operations

This is a preparation guide. It does not provision a VM, configure a cloud firewall, create a deployment identity, or configure a monitoring service. Keep the existing Render deployment until a provider-specific VM deployment has been verified.

## Required network policy

Configure the provider firewall/security group with:

| Port | Protocol | Source |
| --- | --- | --- |
| 80 | TCP | `0.0.0.0/0` (public HTTP) |
| 22 | TCP | `SSH_ALLOWED_CIDR` (replace with the operator's confirmed public IPv4 `/32`) |

`SSH_ALLOWED_CIDR` is a deployment-time placeholder, not a value to commit or an active firewall rule. Do not create the rule until the actual public IP has been confirmed. Never use `0.0.0.0/0` for SSH. Provider support for IPv6 should be decided explicitly; this policy does not open SSH over IPv6.

The Compose file publishes only the reverse proxy on port 80. The application has no host-published port and is reachable only on the Docker network. Cloud firewall rules still need to be configured separately.

## Deployment prerequisites

The eventual VM needs Docker Engine, the Docker Compose plugin, Bash, `curl`, and `grep`. The deployment identity needs permission to start the selected VM-side command mechanism and read the target GHCR package. It must not have broad account administration permissions. Prefer GitHub OIDC with the provider's narrowly scoped managed remote-command service; avoid exposing SSH to GitHub-hosted runner address ranges.

The current GitHub Actions Docker job publishes both `ghcr.io/adm255/deployready-app:latest` and `ghcr.io/adm255/deployready-app:<full-commit-sha>`. Render continues to use `latest`; use the exact triggering commit SHA for the VM. The release script rejects other repositories, mutable tags, and malformed SHA tags. If the GHCR package is private, authenticate Docker using a read-only package credential supplied from an approved secret store. Do not put credentials in this repository, command-line arguments, or logs.

## Release and rollback behavior

`deploy-release.sh` starts a candidate container on the private Docker network without publishing its application port. It waits for the Dockerfile health check, switches the Nginx backend only after the candidate is healthy, then requires the public-facing proxy to return HTTP 200 with JSON `{"status":"ok"}`. If the post-switch check fails and a previous backend is present and healthy, the script restores that backend and exits nonzero. With no previous healthy release, it resets the route to the unconfigured backend. If Nginx cannot reload a restored route, the candidate is retained so the proxy cannot be left pointing at a removed container. A successful switch retains the previous container.

`deploy/tests/test-deploy-release.sh` checks these paths using mocked Docker and HTTP commands. The test does not validate actual image startup, Docker Compose behavior, Nginx reloads, a public firewall, or a real VM deployment.

The script requires a Linux VM with Docker and Compose and has not been exercised in this environment because Docker is unavailable here. It is not yet wired into GitHub Actions or a cloud command service. Do not treat rollback as verified until candidate failure, post-switch failure, and restoration have been tested on a disposable VM.

Run it on the VM after authenticating Docker to GHCR:

```bash
bash ./deploy/deploy-release.sh "ghcr.io/adm255/deployready-app:${GIT_COMMIT_SHA}"
```

Set `GIT_COMMIT_SHA` to the full commit SHA from the workflow run that published the image. The script retains the active and last-known-good containers but does not yet prune older release containers; add and test a retention policy before repeated long-term deployments. The workflow does not yet invoke this VM script.

## Monitoring and alerts to configure

After choosing a provider, configure:

- An external uptime check against `http://<VM-public-IP>/health`, alerting after repeated failures.
- Collection and retention of Nginx access/error logs and container stdout/stderr.
- An alert when HTTP 5xx counts or rates exceed an agreed threshold over a short evaluation window.
- A notification destination and a documented response procedure for an outage, container crash, failed release, or rising 5xx rate.

Nginx logs the request path without query parameters and includes the HTTP status, making 5xx trends reviewable. This file describes the required monitoring; it does not create an uptime check or an alert.

## Provider-specific items still required

Select a provider and region, then provision the VM and firewall, install Docker, configure least-privilege identity/OIDC, provide GHCR read access if needed, connect the workflow to a provider-managed deployment mechanism, configure monitoring and alert delivery, and test a VM release plus rollback. Update `README.md` and `DEPLOYMENT.md` only after those steps are complete and verified.
