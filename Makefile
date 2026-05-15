.PHONY: test test-watch up down down-volumes integration types types-clean clean install

test:
	npx vitest --reporter=verbose --run

test-watch:
	npx vitest

up:
	docker compose up -d

down:
	docker compose down

down-volumes:
	docker compose down -v

integration:
	SUBSTRATE_INTEGRATION=1 npx vitest --reporter=verbose --run

types:
	npx tsc --declaration --allowJs --emitDeclarationOnly --skipLibCheck \
		--target es2020 --module nodenext --moduleResolution nodenext \
		--strict false --esModuleInterop true --outDir ./types src/index.js src/client.js

types-clean:
	rm -rf types

clean:
	rm -rf node_modules

install:
	npm install
