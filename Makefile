.PHONY: install lint test build start docker-up docker-down migrate seed

install:
	corepack enable
	pnpm install

lint:
	pnpm lint

test:
	pnpm test:cov

build:
	pnpm build

start:
	pnpm start:dev

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

migrate:
	pnpm migrate

seed:
	pnpm seed
