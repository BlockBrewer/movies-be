# Movie Backend

A production-ready NestJS backend for managing movies with authentication, file uploads, and monitoring.

## Features

- JWT-based authentication with role-based access control
- Movie management with S3 poster uploads
- RESTful API with Swagger documentation
- PostgreSQL database with TypeORM
- Prometheus metrics and health checks
- Request logging and correlation IDs
- Docker & Kubernetes deployment ready

## Quick Start

1. Copy environment variables:
```bash
cp config/env.example .env
```

2. Configure your database and AWS credentials in `.env`

3. Install dependencies and run:
```bash
npm install
npm run build
npm run migrate
npm run seed
npm run start:dev
```

Or use Docker:
```bash
docker-compose up -d
```

API docs available at `http://localhost:3025/docs`

## Development

```bash
# Linting
npm run lint
npm run format

# Testing
npm run test:unit
npm run test:integration
npm run test:e2e

# Database
npm run migration:generate
npm run migrate
```

## Project Structure

```
src/
├── core/           # Configuration, logging, filters, interceptors
├── modules/        # Feature modules (auth, users, movies, etc.)
├── shared/         # Shared utilities and constants
└── main.ts         # Application entry point

db/
├── migrations/     # TypeORM migrations
└── seeds/          # Database seed files
```

## Tech Stack

- **Framework**: NestJS 10
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with bcrypt
- **Storage**: AWS S3 for file uploads
- **Monitoring**: Prometheus + Grafana
- **Validation**: class-validator
- **Testing**: Jest

## Environment Variables

See `config/env.example` for all required configuration. Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `AWS_*` - S3 credentials and bucket info

## CI/CD (Elastic Beanstalk)

GitHub Actions automatically builds, tests, and deploys the service to AWS Elastic Beanstalk when changes land on `main`.

### Prerequisites

- Elastic Beanstalk application and environment already provisioned (Node.js platform).
- S3 bucket for application bundles (often created automatically by Elastic Beanstalk).
- AWS IAM user or role with `elasticbeanstalk:*`, `s3:*`, and `iam:PassRole` permissions limited to the target resources.

### GitHub Secrets

Configure the following repository secrets before enabling the workflow:

- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` – credentials that can manage the target Elastic Beanstalk environment.
- `AWS_REGION` – e.g. `ap-southeast-1`.
- `EB_APP_NAME` – Elastic Beanstalk application name.
- `EB_ENV_NAME` – Elastic Beanstalk environment name.
- `EB_S3_BUCKET` – S3 bucket that stores application bundles (for example `elasticbeanstalk-ap-southeast-1-123456789012`).

### Deployment Flow

1. Push or merge to `main` (or trigger `Deploy to Elastic Beanstalk` manually from the Actions tab).
2. The workflow installs dependencies with `npm`, runs lint and tests, and builds the production bundle.
3. A ZIP artifact (without `node_modules`) is uploaded to the configured S3 bucket.
4. The workflow creates a new Elastic Beanstalk application version using the commit SHA as the version label and swaps the environment to that version.

Monitor deployment progress from the Elastic Beanstalk console or the Actions run logs. If a deployment fails, review the EB event logs for more details.

## License

MIT
