# DeployReady — DevOps Challenge

## Project Overview

DeployReady is a containerized Node.js API built for the AmaliTech DEG DevOps challenge.

The project demonstrates Docker containerization, automated testing, container image publishing, cloud deployment, and basic observability.

**Application:** Kora Analytics API
**Cloud platform:** Render
**Container registry:** GitHub Container Registry (GHCR)
**CI/CD:** GitHub Actions

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
   +--> Run application tests
   |
   +--> Build Docker image
   |
   +--> Publish image to GHCR
              |
              v
       Render Web Service
              |
              v
       DeployReady Node.js API
              |
              +--> /health
              +--> /metrics
              +--> /data
```

## Application Endpoints

| Method | Endpoint | Description |
|---|---|---|
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

http://localhost:3000

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
curl -X POST http://localhost:3000/data \
  -H "Content-Type: application/json" \
  -d '{"message":"DeployReady test"}'
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

The pipeline runs on pushes to the `main` branch.

### Pipeline stages

1. Checkout the repository.
2. Install Node.js dependencies.
3. Run application tests.
4. Build the Docker image.
5. Authenticate with GitHub Container Registry.
6. Publish the image to GHCR.

### Container Image

```text
ghcr.io/adm255/deployready-app:latest
```

The workflow uses GitHub Actions secrets and the repository-provided GitHub token for registry authentication.

**Current pipeline limitation:** The workflow tests and publishes the image but does not automatically deploy to Render, perform a post-deployment health check, or roll back a failed release.

## Cloud Deployment

The application is deployed as a Render Web Service using the container image published to GHCR.

**Provider:** Render
**Service:** deployready-app-latest
**Region:** Ohio
**Public URL:** https://deployready-app-latest.onrender.com

### Health Verification

The deployed health endpoint is:

https://deployready-app-latest.onrender.com/health

Expected response:

```json
{"status":"ok"}
```

The public health endpoint was verified successfully.

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

### Health Monitoring

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
├── .github/
│   └── workflows/
│       └── deploy.yml
├── app/
│   ├── package.json
│   └── application source
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── DEPLOYMENT.md
└── README.md
```

## Remaining Challenge Requirements

The following original requirements remain incomplete:

- Provision a cloud virtual machine.
- Configure HTTP port 80 and restrict SSH port 22 to the user's IP.
- Configure least-privilege cloud IAM for deployment.
- Implement automatic deployment from GitHub Actions.
- Verify application health after deployment.
- Implement automatic rollback to the previous image when health verification fails.
- Configure an automated monitoring alert.

These requirements are documented as outstanding rather than represented as completed.

## Submission

Repository:

https://github.com/Adm255/AmaliTech-DEG-Project-based-challenges

The project demonstrates containerization, automated testing, image publishing, and a working public cloud deployment.

Further deployment details are available in [DEPLOYMENT.md](./DEPLOYMENT.md).
