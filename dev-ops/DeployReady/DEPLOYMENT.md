# DeployReady Deployment Guide

## 1. Architecture

DeployReady is a Node.js Express API packaged as a Docker image.

- Application: Node.js and Express
- Container registry: GitHub Container Registry (GHCR)
- Docker image: `ghcr.io/adm255/deployready-app:latest`
- CI/CD: GitHub Actions
- Cloud deployment: Render Web Service
- Render region: Ohio, US
- Render service: `deployready-app-latest`
- Public URL: https://deployready-app-latest.onrender.com

## 2. Local Docker Deployment

Create the environment file:

```bash
cp .env.example .env
```

Build and start the application:

```bash
docker compose up --build
```

Check the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"ok"}
```

View application logs:

```bash
docker compose logs -f app
```

Stop the application with `Ctrl+C`.

## 3. Docker Image

The application image is published to GHCR.

The workflow publishes both `ghcr.io/adm255/deployready-app:latest` (used by Render) and `ghcr.io/adm255/deployready-app:<full-commit-sha>` (reserved for immutable VM releases). The VM release script requires the full SHA tag matching the commit that triggered the workflow.

Pull the image:

```bash
docker pull ghcr.io/adm255/deployready-app:latest
```

Run the published image locally:

```bash
docker run -d --name deployready-test -p 3001:3000 ghcr.io/adm255/deployready-app:latest
```

Verify the health endpoint:

```bash
curl http://localhost:3001/health
```

Remove the temporary test container:

```bash
docker rm -f deployready-test
```

## 4. CI/CD

The GitHub Actions workflow runs on pushes to the `main` branch.

The workflow:

1. Checks out the repository.
2. Sets up Node.js 20.
3. Installs dependencies.
4. Runs the application tests and focused VM release-script checks.
5. Builds the Docker image.
6. Publishes the image to GitHub Container Registry.
7. Triggers the Render deploy hook after a successful image publish.
8. Retries the Render `/health` endpoint and requires HTTP 200 with JSON status `ok`.

The workflow uses GitHub Actions permissions and the built-in `GITHUB_TOKEN` to publish the image.

It tags the image as both `ghcr.io/adm255/deployready-app:latest` for Render and `ghcr.io/adm255/deployready-app:<full-commit-sha>` for an eventual VM release. The SHA tag is immutable and is the only image reference accepted by `deploy/deploy-release.sh`.

The workflow triggers Render using its deploy hook after publishing the GHCR image. It then probes the public health endpoint. The hook request only triggers deployment; the workflow does not wait for Render to finish or verify which image is serving, so the probe may reach the previous healthy release. The workflow does not roll back a failed deployment.

### Verification status

- **Implemented and tested:** GitHub Actions run #8 passed the then-current application test, image build/push, Render deployment, and health probe. The live Render API endpoints were checked successfully.
- **Implemented, mocked only:** Current local changes add full-SHA image publishing and a VM release script with candidate health checks and restoration of the previous healthy backend. The focused script test mocks Docker and HTTP; no VM, real Docker deployment, or rollback has been verified. The current workflow changes still need a successful GitHub Actions run.
- **Not implemented:** The GitHub Actions workflow does not invoke the VM script. No VM, firewall, SSH restriction, or cloud IAM has been provisioned/configured. Continuous monitoring and alerts are not configured. Render rollout identity verification and rollback are not implemented.

## 5. Cloud Deployment

DeployReady is deployed as a Render Web Service using the published Docker image.

- Provider: Render
- Project: DeployReady
- Environment: Production
- Region: Ohio, US
- Compute plan: Free
- Image: `ghcr.io/adm255/deployready-app:latest`
- Public URL: https://deployready-app-latest.onrender.com

Render provides the runtime `PORT` environment variable to the application.

## 6. Public Health Check

The public health endpoint is:

```text
https://deployready-app-latest.onrender.com/health
```

Verify it with:

```bash
curl https://deployready-app-latest.onrender.com/health
```

Expected response:

```json
{"status":"ok"}
```

The public health endpoint was tested and returned:

```json
{"status":"ok"}
```

The GitHub Actions workflow also checks this endpoint after triggering the Render hook. This check confirms that the endpoint responds, but does not conclusively verify the new release because the workflow does not wait for Render's rollout to finish.

## 7. Observability

### Health monitoring

The application exposes:

```text
GET /health
```

The endpoint returns the application health status.

Check the public endpoint to verify that the service is responding.

The workflow performs a bounded health probe after deployment is triggered. It is not continuous uptime monitoring and it does not alert on outages or rising HTTP 5xx rates.

### Application logs

Application logs can be reviewed in the Render dashboard:

1. Open the Render dashboard.
2. Select the DeployReady Web Service.
3. Open the Logs section.
4. Review startup messages and runtime errors.

### Failed deployment or application crash

Review the service deployment status and logs in Render.

Investigate startup errors, application crashes, and failed deployments using the Render Events and Logs sections.

### Metrics

The application exposes:

```text
GET /metrics
```

The metrics endpoint reports application uptime and memory usage.

The application does not currently expose an HTTP 5xx rate metric. Review Render logs for runtime errors; automated error-rate monitoring and alert delivery are not configured.

## 8. Original VM requirements not yet completed

The current deployment is on Render and does not provide the original challenge's VM setup. No cloud VM has been provisioned, Docker has not been installed on a VM, and this project has no configured VM firewall or cloud deployment identity. Consequently, there is no VM public IP whose `GET /health` endpoint can be verified. The required VM deployment documentation points (provider and reason, VM setup, Docker installation/image pull, container status, and logs) cannot be truthfully completed until a provider is selected and the VM is deployed.

For that VM, the required network policy is public TCP port 80 and TCP port 22 restricted to the operator's confirmed public IP `/32`. The provider firewall and least-privilege identity remain to be configured. Provider-neutral preparation is documented in [`deploy/VM-OPERATIONS.md`](./deploy/VM-OPERATIONS.md); those files do not provision or verify infrastructure.

## 9. Security

- Do not commit `.env` files or credentials.
- Do not commit private keys or registry tokens.
- Use GitHub Actions secrets for sensitive configuration.
- Keep the Docker image running as a non-root user.
- Use the least privilege required for registry access.
- Do not expose secrets in application logs.
