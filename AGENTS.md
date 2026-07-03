# Repository Guidelines

## Project Structure & Module Organization

EcoCampus is a monorepo with two main applications:

- `backend/`: Java 21 Spring Boot service. Source lives in `src/main/java/com/falconsvsvabro/ecocampus`, resources in `src/main/resources`, and tests in `src/test/java`.
- `frontend/`: React + TypeScript + Vite Web/H5 app. Source lives in `src/`, with route metadata in `src/app/routeCatalog.ts`, API clients in `src/api/`, reusable UI in `src/components/`, and feature modules in `src/features/`.
- `docs/`: RBAC, API contract, and frontend stack decisions.
- `assets/process/` and `process.html`: presentation/demo assets. `process-standalone.html` is generated and ignored.

## Build, Test, and Development Commands

Backend:

```bash
cd backend
./mvnw test
./mvnw spring-boot:run
```

`./mvnw test` runs the Spring Boot test suite. `spring-boot:run` starts the API on `http://localhost:8080`; check `/api/v1/health` and `/swagger-ui.html`.

Frontend:

```bash
cd frontend
pnpm install
pnpm lint
pnpm build
pnpm dev
```

`pnpm lint` runs Oxlint. `pnpm build` runs TypeScript project checks and builds Vite output. `pnpm dev` starts the local app, usually on `http://127.0.0.1:5173/`.

## Coding Style & Naming Conventions

Use the existing package and folder boundaries. Java classes use `PascalCase`; packages stay lowercase under `com.falconsvsvabro.ecocampus`. TypeScript uses `PascalCase` for React components, `camelCase` for functions, and `*.api.ts` for API modules. Keep route/API changes aligned with `docs/api-contract.md` and `docs/frontend-stack.md`.

## Testing Guidelines

Backend tests use JUnit through Spring Boot Test. Place tests under matching package paths in `backend/src/test/java` and name them `*Tests` or `*Test`. Frontend changes must pass `pnpm lint` and `pnpm build`; add component or route tests when real business UI is introduced.

## Commit & Pull Request Guidelines

Recent history uses concise messages such as `feat: add process presentation page`, `chore: initial project setup`, and short docs summaries. Prefer `type: summary` with `feat`, `fix`, `docs`, `chore`, or `test`.

PRs should include: scope summary, linked issue or task, test results, screenshots for UI changes, and notes for config or migration changes.

## Security & Configuration Tips

Do not commit secrets, local `.env` files, real database credentials, or generated bundles. Use `backend/src/main/resources/application-local.example.yml` as the template for local configuration.
