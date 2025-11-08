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
pnpm install
pnpm run build
pnpm run migration:run
pnpm run seed
pnpm start:dev
```

Or use Docker:
```bash
docker-compose up -d
```

API docs available at `http://localhost:3000/docs`

## Development

```bash
# Linting
pnpm lint
pnpm format

# Testing
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# Database
pnpm migration:generate
pnpm migration:run
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

## License

MIT
