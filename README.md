# ExtremeXP Visualization Page

*Frontend dashboard for exploring, monitoring, and explaining AI pipelines*

This repository contains the ExtremeXP Visualization UI, a web-based dashboard for interactive exploration, monitoring, and explainability of complex AI pipelines.

The frontend is designed to work with the ExtremeXP Visualization API and renders analytics and explainability results produced by the backend services.

## Prerequisites

- **Docker**
- **Docker Compose**
- A running **Visualization API** (default: `http://localhost:8080`)

## Environment Configuration (Required)

Before starting the frontend, you must create a `.env` file.

1. Copy the example file:

```bash
cp .env.example .env
```

(Windows users may need to copy the file manually.)

2. Edit `.env` and fill in the required values, including:
- Proxy service configuration
- Access control service configuration
- Keycloak / OIDC settings

## Run with Docker Compose

From the root of this repository, run:

```bash
docker compose up --build
```

This command will:
- Build the frontend Docker image
- Start the frontend container

## Access the UI

Once the container is running, open your browser at:

```
http://localhost:5173
```

## Backend Requirement

The frontend **does not run standalone**.  
It expects the Visualization API to be available at:

```
http://localhost:8080
```

Make sure the backend is running before starting the frontend.

## Technology Stack

- React
- Redux Toolkit
- Axios
- Vega / Vega-Lite
- Material UI (MUI)

## Related Repositories

- Visualization API:
  https://github.com/extremexp-HORIZON/vis-api

- Explainability Module:
  https://github.com/extremexp-HORIZON/extremexp-explainability-module

## License
Not available

Feel free to reach out with any questions, issues, or suggestions!