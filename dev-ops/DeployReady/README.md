# DeployReady: DevOps Challenge

## Project Overview

DeployReady is a containerized Node.js API built for the AmaliTech DEG DevOps challenge.

The project demonstrates Docker containerization, automated testing, container image publishing, cloud deployment, and basic observability.

- **Application:** Kora Analytics API
- **Cloud platform:** Render
- **Container registry:** GitHub Container Registry (GHCR)
- **CI/CD:** GitHub Actions

## Architecture

```text
Developer
    |
    v
GitHub Repository (main)
    |
    v
GitHub Actions
    |
    v
  Test
    |
    v
Docker Build/Push (GHCR)
    |
    v
Render Deploy (main, after Docker succeeds)
    |
    v
  Live API
  |-- GET /health
  |-- GET /metrics
  `-- POST /data
```

## Application Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Returns application health status |
| GET | `/metrics` | Returns uptime and memory usage |
| POST | `/data` | Accepts and echoes JSON data |

## Technology Stack

- Node.js
- Docker
- Docker Compose
- GitHub Actions
- GitHub Container Registry
- Render

## Local Setup

### Prerequisites

- Git
- Docker
- Docker Compose

### Configure Environment

Create a local environment file:

```bash
cp .env.example .env
```

The default application port is `3000`.

### Build and Run

```bash
docker compose up --build
```

The application will be available at:

[http://localhost:3000](http://localhost:3000)

### Verify the Application

Check the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"ok"}
```

Check metrics:

```bash
curl http://localhost:3000/metrics
```

Test the data endpoint:

```bash
curl -X POST -H 'Content-Type: application/json' --data '{"message":"DeployReady test"}' http://localhost:3000/data
```

Stop the application:

```bash
docker compose down
```

## Docker Implementation

The application is packaged using a Dockerfile.

The container:

- Uses Node.js 20 Alpine.
- Installs production dependencies.
- Accepts the `PORT` environment variable.
- Runs as the non-root `node` user.
- Exposes port `3000`.
- Includes a Docker health check.

Docker Compose builds the application and maps the host port to the container port.

## CI/CD Pipeline

The GitHub Actions workflow is located at:

`.github/workflows/deploy.yml`

The test job runs for pushes and pull requests targeting `main`. On pushes to `main`, the workflow also builds and publishes the image, then deploys it to Render after the Docker job succeeds.

### Pipeline stages

1. Checkout the repository.
2. Install Node.js dependencies.
3. Run application tests.
4. Build the Docker image.
5. Authenticate with GitHub Container Registry.
6. Publish the image to GHCR.
7. Trigger a Render deployment after the Docker job succeeds on pushes to `main`.

### Container Image

```text
ghcr.io/adm255/deployready-app:latest
```

The workflow uses the repository-provided GitHub token for registry authentication and the `RENDER_DEPLOY_HOOK_URL` GitHub Actions secret to trigger Render.

Render deployment runs automatically after a successful Docker image publish on pushes to `main`. **Post-deployment health verification and automatic rollback are not implemented.**

## Cloud Deployment

The application is deployed as a Render Web Service using the container image published to GHCR.

- **Provider:** Render
- **Service:** deployready-app-latest
- **Region:** Ohio
- **Public URL:** [https://deployready-app-latest.onrender.com](https://deployready-app-latest.onrender.com)

### Deployment Verification

The following deployed endpoint checks have succeeded:

- `GET` [https://deployready-app-latest.onrender.com/health](https://deployready-app-latest.onrender.com/health) returns `{"status":"ok"}`.
- `GET` [https://deployready-app-latest.onrender.com/metrics](https://deployready-app-latest.onrender.com/metrics) returns uptime, memory usage, and the Node.js version.
- `POST` [https://deployready-app-latest.onrender.com/data](https://deployready-app-latest.onrender.com/data) accepts JSON and echoes the submitted JSON.

These checks were performed successfully against the live Render service. They are manual verification results; the workflow does not run a post-deployment health check or automatically roll back a release.

### Deployment Decision

Render was selected because the Google Cloud billing account was unavailable for provisioning a virtual machine.

Render provides a managed container deployment without requiring manual VM administration.

However, this deployment does not fulfill the original challenge's virtual machine, SSH restriction, firewall configuration, or least-privilege cloud IAM requirements.

The free service may spin down when idle.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment details.

## Observability

The application provides a health endpoint and a metrics endpoint.

### Application Logs

Review application logs through the Render service dashboard.

Logs can help identify:

- Application startup failures.
- Runtime errors.
- Container restarts.
- Deployment failures.

### Health Endpoint

The `/health` endpoint provides a basic application health signal.

Check the endpoint to verify that the service responds successfully.

### Metrics

The `/metrics` endpoint provides application uptime and memory usage.

These signals can help identify abnormal memory usage or unexpected application behavior.

### Current Limitation

The project currently documents basic health and logging practices.

Automated external alerting and a dedicated monitoring alarm have not been configured.

## Security

The project follows these security practices:

- The Docker container runs as a non-root user.
- Environment configuration is separated from application source.
- `.env.example` contains the expected configuration.
- Real environment secrets are not intended to be committed.
- GitHub Actions uses repository secrets for registry authentication.
- The deployment guide documents the current platform limitations.

## Project Structure

```text
DeployReady/
|-- .github/
|   `-- workflows/
|       `-- deploy.yml
|-- app/
|   |-- package.json
|   `-- application source
|-- .dockerignore
|-- .env.example
|-- .gitignore
|-- Dockerfile
|-- docker-compose.yml
|-- DEPLOYMENT.md
`-- README.md
```

## Remaining Challenge Requirements

The following original requirements remain incomplete:

- Provision a cloud virtual machine.
- Configure the VM firewall, including HTTP port 80 and SSH port 22 restricted to the user's IP.
- Configure least-privilege cloud IAM for deployment.
- Implement post-deployment health verification in the CI/CD workflow.
- Implement automatic rollback to the previous image when health verification fails.
- Configure an automated monitoring alert.

Render provides a managed container service, not the challenge's VM, SSH restriction, firewall, or cloud IAM setup. These items remain incomplete. Post-deployment health verification, automatic rollback, and monitoring alerts also remain incomplete.

## Submission

Repository: [AmaliTech-DEG-Project-based-challenges](https://github.com/Adm255/AmaliTech-DEG-Project-based-challenges)

The project demonstrates containerization, automated testing, image publishing, and a working public cloud deployment.

Further deployment details are available in [DEPLOYMENT.md](./DEPLOYMENT.md).
