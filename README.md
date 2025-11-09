# Movie Platform – Backend

NestJS service providing auth, movie management, file uploads, and operational tooling for the platform.

## Features

- JWT access + refresh tokens with guards, refresh endpoint, and password hashing via bcrypt
- Role-ready architecture using Nest guards/interceptors and scoped decorators
- Movie CRUD with poster uploads to S3 (multipart + signed URLs) and metadata validation
- Background-safe file handling with streaming uploads and cleanup hooks
- TypeORM + PostgreSQL persistence with migrations, seeds, and soft-delete support
- Health checks, Prometheus metrics, structured logging, correlation IDs, and request timing
- Swagger docs, DTO validation (class-validator), and consistent API envelopes with error mapping
- Configuration module supporting per-environment overrides and schema validation
- Rate limiting, CORS configuration, and helmet-style security defaults baked in

## Setup

1. `cd /Users/kamran/Work/NLabs/movie-be`
2. `cp config/env.example .env`
3. Update `.env` with PostgreSQL connection, JWT secrets, and AWS credentials (LocalStack works for local dev)
4. `npm install`
5. `npm run migrate && npm run seed`
6. `npm run start:dev`

Services exposed locally:

- REST API: `http://localhost:3025/v1`
- Swagger UI: `http://localhost:3025/docs`
- Health endpoint: `http://localhost:3025/health`

## Scripts

```bash
npm run lint
npm run format
npm run test:unit
npm run test:integration
npm run test:e2e
npm run migrate
npm run migration:generate src/migrations/<name>
```

## Deployment

- **Docker**: `docker-compose up -d` brings up API, Postgres, and S3-compatible storage.
- **Elastic Beanstalk**: GitHub Actions workflow builds, tests, uploads an artifact to S3, and promotes a new EB application version.
- **CI/CD**: Pipeline runs linting, unit/integration/e2e tests, build, and deployment on every push to `main`; status badges and logs available in GitHub Actions.
- Ensure environment variables used in `.env` are configured in each environment (JWT secrets, AWS creds, database URL, etc.).
