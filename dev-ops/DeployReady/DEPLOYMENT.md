# DeployReady deployment guide

## Architecture and local run

The Express API is built from the root `Dockerfile`. Docker Compose loads `PORT` from a local `.env` file, maps host port 3000 to that container port, and runs the image as the unprivileged `node` user. Start it from this directory:

```sh
cp .env.example .env
docker compose up --build
```

Check `http://localhost:3000/health`. Compose logs are available with `docker compose logs -f app`; stop the local service with `Ctrl+C`.

## CI/CD and deployment target

The GitHub Actions workflow runs the existing Jest suite, builds and pushes a commit-tagged image to GitHub Container Registry (GHCR), deploys it to a Linux VM over SSH, checks `/health`, and attempts to restore the previously running image if the health check fails. The workflow uses `docker run` directly on the VM; it does not use `docker-compose.yml`, which is for local Compose runs. Cloud deployment still requires a configured Linux VM with Docker, a firewall allowing inbound TCP 80 and SSH (TCP 22) restricted to your administrative IP and the chosen GitHub Actions runner access method, and the GitHub repository secrets listed below. This repository change does not provision the VM or configure cloud resources. For stronger network restrictions, use a self-hosted runner inside the permitted network or a VPN/bastion design.

Add these GitHub repository Actions secrets before enabling deployments:

| Secret | Purpose |
| --- | --- |
| `SSH_HOST` | VM public IP address or DNS name |
| `SSH_USER` | VM deployment account with permission to run Docker |
| `SSH_PRIVATE_KEY` | Private key matching the account's authorized key |
| `SSH_KNOWN_HOSTS` | Pre-verified SSH host key line for the VM |
| `GHCR_USERNAME` | GitHub account or service account that can read the package |
| `GHCR_READ_TOKEN` | Fine-scoped token with read access to the GHCR package |

The workflow uses the built-in `GITHUB_TOKEN` for publishing. Never commit actual `.env` files, private keys, registry tokens, or other credentials. Protect the `main` branch and require the workflow checks before merging.

The VM must have Docker installed, port 80 available, and allow the deployment user to execute Docker commands. The remote container is named `kora-api`, publishes port 80 to the app on port 3000, and uses Docker's `unless-stopped` restart policy. The workflow stores the prior image reference in `/tmp/kora-api.previous-image` during deploy; on failed health verification it attempts to start that image again. The first deployment has no prior image to restore.

## VM operations

On the VM, check the container with `docker ps --filter name=kora-api`, inspect its health state with `docker inspect --format '{{.State.Health.Status}}' kora-api`, and review recent application output with `docker logs --tail 100 kora-api` (or follow it with `docker logs -f kora-api`). Docker captures the app's stdout and stderr; configure the VM's Docker logging driver or a log collector such as CloudWatch Agent, Google Cloud Ops Agent, or Azure Monitor Agent to retain and search logs centrally.

## Observability and release checks

- **Health signal:** Docker polls `/health` every 30 seconds and records container health. The deployment workflow retries the public `/health` endpoint up to 12 times, with each request allowed up to 5 seconds and a 5-second pause between attempts. This gives a maximum wait of approximately two minutes; the workflow marks the release failed if the endpoint never responds. Configure an external uptime monitor to alert on non-200 responses; the exact monitor and notification channel depend on the selected cloud/provider account.
- **Logs:** The app's startup message and runtime output go to stdout/stderr, available through `docker logs`. Forward these logs to the cloud logging service for retention and searching.
- **Crash or failed release:** A container restart or `unhealthy` state can be seen with `docker ps` and `docker inspect`; investigate with `docker logs`. A failed GitHub Actions health step is visible in the Actions run. Its rollback step attempts to start the saved previous image, and the failed run remains visible for follow-up.
- **Rising errors or resource use:** Review HTTP error responses in access logs if a proxy is configured, and inspect `/metrics` for process uptime and memory usage. Set dashboard thresholds and alerts in the chosen cloud monitoring service; this sample API does not expose request counters or structured request logs.

## Cloud setup record

This repository change does not create cloud resources or deploy the service. Record the selected provider, VM size/region, Docker installation method, firewall rules, and IAM/service-account scope here after you set them up. Keep SSH limited to trusted source IPs where the runner architecture permits, and grant the pipeline only the package and VM access it needs.
