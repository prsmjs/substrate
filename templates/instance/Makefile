.PHONY: up down down-volumes logs server new-app help

up: ## Start postgres and redis
	docker compose up -d

down: ## Stop services
	docker compose down

down-volumes: ## Stop services and nuke data
	docker compose down -v

logs: ## Tail service logs
	docker compose logs -f

server: ## Run the substrate server with reload
	npx nodemon server.js

new-app: ## Add a new app: make new-app NAME=foo
	npx substrate new $(NAME)

help: ## Show help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-20s\033[0m %s\n", $$1, $$2}'
