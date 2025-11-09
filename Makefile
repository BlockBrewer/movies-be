.PHONY: install lint test build start docker-up docker-down migrate seed eb-logs

install:
	npm install

lint:
	npm run lint

test:
	npm run test:cov

build:
	npm run build

start:
	npm run start:dev

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down

migrate:
	npm run migrate

seed:
	npm run seed

eb-logs:
	./scripts/fetch-eb-logs.sh
