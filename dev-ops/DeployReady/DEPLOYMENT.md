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
4. Runs the application tests.
5. Builds the Docker image.
6. Publishes the image to GitHub Container Registry.

The workflow uses GitHub Actions permissions and the built-in `GITHUB_TOKEN` to publish the image.

The current workflow does not deploy directly to Render. Render uses the published GHCR image for the web service deployment.

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

## 7. Observability

### Health monitoring

The application exposes:

```text
GET /health
```

The endpoint returns the application health status.

Check the public endpoint to verify that the service is responding.

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

## 8. Security

- Do not commit `.env` files or credentials.
- Do not commit private keys or registry tokens.
- Use GitHub Actions secrets for sensitive configuration.
- Keep the Docker image running as a non-root user.
- Use the least privilege required for registry access.
- Do not expose secrets in application logs.