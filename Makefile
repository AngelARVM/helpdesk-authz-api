.PHONY: prepare
prepare:
	@cp .example.env .env && chmod +x .docker/entrypoint.sh && echo "Prepared ✅"

.PHONY: build
build:
	@docker compose build server

.PHONY: up
up: ## run the docker image
	@docker compose up

.PHONY: first-run
first-run: prepare build up

.PHONY: seed
seed: 
	@docker compose exec server npm run seed

.PHONY: sh
sh: ## open a shell in local environment
	@docker compose exec server /bin/bash

.PHONY: psql
psql:
	@docker compose exec -ti postgres psql -h localhost -U postgres