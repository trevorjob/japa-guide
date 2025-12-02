# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project status & key docs

- This repo currently contains a **high-level backend specification** for a Django + DRF project called **Japaguide**.
- The main design document is `plan.md`. Treat it as the **source of truth** for architecture, features, and technology choices until actual code and Docker files are added.
- `README.md` currently only contains the project title; important usage details are in `plan.md` under sections like **High-level architecture**, **Database schema**, **API design**, **Background jobs**, **Docker Setup**, and **Quickstart (README)**.

When there is any ambiguity between existing code and `plan.md`, prefer the real code but keep it aligned with the intent in `plan.md`.

## Development environment & commands

The intended stack (from `plan.md`) is:

- Django 4.x + Django REST Framework
- PostgreSQL as the primary DB
- Redis for Celery broker, caching, and session storage
- Celery workers + beat for background jobs
- OpenAI (LLM) + Cloudinary (media)
- Docker + `docker-compose` for local and production-like environments

### Starting the stack (Docker)

Once the `Dockerfile`, `docker-compose.yml`, and `requirements.txt` from `plan.md` are created in this repo, the expected dev flow is:

- Build and start the services in the background:
  - `docker-compose up -d`

- Run initial migrations inside the `web` service:
  - `docker-compose exec web python manage.py migrate`

- Create a Django superuser:
  - `docker-compose exec web python manage.py createsuperuser`

- Import core seed data:
  - `docker-compose exec web python manage.py import_countries seed_data/countries.json`
  - `docker-compose exec web python manage.py import_visa_types seed_data/visa_germany.json --country=DEU`
  - `docker-compose exec web python manage.py seed_prompts`

- Useful URLs (once the stack is running as per `plan.md`):
  - API: `http://localhost:8000/api/v1/`
  - Admin: `http://localhost:8000/admin/`

### Celery workers (background jobs)

Celery is used for async work like AI enrichment, session cleanup, and (later) document/PDF generation.

Outside Docker (directly on the host, once the Django project exists):

- Start a worker:
  - `celery -A japaguide worker -l info`
- Start a beat scheduler:
  - `celery -A japaguide beat -l info`

Inside Docker, the `celery` and `celery-beat` services defined in `docker-compose.yml` should run these commands.

### Management commands

Planned management commands (from `plan.md`):

- Data import / seeding:
  - `python manage.py import_countries seed_data/countries.json`
  - `python manage.py import_visa_types seed_data/visa_germany.json --country=DEU`
  - `python manage.py seed_prompts`

- Cleanup for anonymous sessions:
  - `python manage.py cleanup_expired_sessions`

Run these either directly (if developing without Docker) or via `docker-compose exec web ...`.

### Testing and linting

`plan.md` does not yet specify test or lint tooling (e.g. pytest, coverage, black, flake8). Once the Django project and tooling files (`pyproject.toml`, `requirements-dev.txt`, or similar) are added, update this section with the canonical commands, such as:

- How to run the full test suite
- How to run a single test or test module
- How to run linters/formatters

Until that exists, inspect the project’s settings and any test/lint configuration files in the future codebase before assuming conventions.

### Environment configuration

`plan.md` defines the expected environment variables (typically via `.env` and `env_file` in `docker-compose.yml`). Key variables include database/Redis URLs, OpenAI and Cloudinary credentials, and session settings (e.g. 30-day expiry). When implementing or modifying settings:

- Ensure Django `settings.py` reads from these environment variables as described in `plan.md`.
- Keep `DEBUG` turned off in production-like configurations.

## High-level architecture

Japaguide is designed as a **Django monolith with modular apps**, exposed through a DRF API under `/api/v1/...`. The core themes are:

- Anonymous-first usage (all major features work without authentication)
- Rich domain modeling for countries, visas, and migration roadmaps
- AI-enhanced but **deterministic-first** flows (AI is an enrichment layer, not a hard dependency)
- Async background processing for AI and housekeeping tasks

### Project & app layout (intended)

From `plan.md`, the Django project is expected to look like:

- `japaguide/` – project settings, URLs, WSGI/ASGI setup
- Apps:
  - `core` – shared settings, utilities, base models, and cross-cutting concerns.
  - `countries` – country profiles, cost-of-living and migration difficulty metadata.
  - `visas` – visa types and multi-step visa processes.
  - `roadmaps` – generated migration roadmaps and step-level tracking.
  - `users` – user model (extending `AbstractUser`) and structured `UserProfile`.
  - `ai` – prompt templates, AI request logging, and the AI service abstraction.
  - `docs` (Phase 2) – document templates and generated documents.
  - `maps` (Phase 2) – geospatial points of interest and map overlays.
  - `stories` (Phase 2) – user-generated "japa" stories.
  - `admin_tools` – importers, batch management, and admin-side utilities.

When creating these apps, align responsibilities with the above boundaries and avoid leaking concerns across apps.

### Domain & data model

Key model groups (Phase 1) described in `plan.md`:

- **Countries & visas**
  - `countries.Country` stores country-level metadata (region, currency, population, cost indices, and flexible `metadata` JSON).
  - `visas.VisaType` and `visas.VisaStep` represent visa programs and their ordered steps, including per-step costs, timelines, tips, and pitfalls.

- **Users & profiles**
  - `users.User` extends `AbstractUser`, but registration is optional; many flows work without logged-in users.
  - `users.UserProfile` holds structured data used for personalization (education, field of study, experience, budget, dependents, skills, languages, climate preference, etc.).

- **Roadmaps & progress tracking**
  - `roadmaps.Roadmap` links an anonymous session or authenticated user to a plan for moving to a country, optionally tied to a specific visa type.
  - `roadmaps.RoadmapStep` models individual steps in a roadmap (order, description, cost/time estimates) with fields for AI enrichment.
  - `roadmaps.RoadmapStepStatus` tracks completion, blockers, notes, and timestamps per step.

- **AI prompts & logs**
  - `ai.PromptTemplate` stores reusable, parameterized prompt templates with metadata like mode (roadmap enrichment, cost calculator, comparison) and AI "tone".
  - `ai.AIRequest` logs AI calls, capturing session/user, template, model, token usage, cost, and arbitrary metadata.

Phase 2 adds `docs.DocumentTemplate` / `docs.GeneratedDocument`, `maps.GeoPoint`, and `stories.Story` for expanded functionality.

### Anonymous-first session strategy

A central architectural constraint is that **all core features must work for anonymous users**:

- Use **Redis-backed Django sessions** for anonymous users; roadmaps, AI requests, and other session-scoped entities store a `session_id` string.
- On each request, views should ensure a session exists for anonymous users and then branch behavior on `request.user` vs. `session_id`.
- When a user later signs up or logs in, a dedicated flow migrates all relevant session-scoped records (e.g. `Roadmap`, `AIRequest`) to that user and clears the `session_id`.
- Sessions are intended to expire after ~30 days, with background cleanup of orphaned anonymous data.

When implementing or changing views and models, preserve this pattern: **do not require authentication for roadmap generation, cost estimates, or AI chat.**

### API design (DRF)

`plan.md` specifies a DRF API under `/api/v1/...` with these main areas:

- **Auth (optional)** – JWT (SimpleJWT) is used for users who do choose to register (`/auth/register/`, `/auth/login/`, `/auth/refresh/`, `/auth/me/`, `/auth/claim-session/`).
- **Countries & visas** – list and detail endpoints for countries and visa types, including filters and summaries.
- **Roadmaps** – generate, list, retrieve, and update roadmaps; step-level completion/blocking; generation must work for both anonymous and authenticated users.
- **Cost calculator** – an enhanced estimation endpoint taking structured inputs and returning totals, breakdowns, hidden costs, and savings plans.
- **AI assistant** – chat, comparison, and other AI-backed features that build on `PromptTemplate` and the personality system.
- **Timeline planner** – generates timelines/milestones based on roadmaps and dates.
- **Session utilities** – endpoints for explicitly saving sessions, extending expiry, and emailing session links.
- **Admin tools** – protected endpoints for imports, AI prompt management, and analytics.

Permissions are designed so that most endpoints use `AllowAny` but apply **session-or-user-aware throttling** (e.g. a `SessionOrUserRateThrottle` that keys on either user ID or session ID).

### AI integration & personality system

AI usage is structured around an `AIService` abstraction (e.g. `ai/services.py`) and DB-backed prompt templates:

- OpenAI’s `gpt-4o-mini` is the default model for cost and speed.
- Prompt templates are Jinja2-based and are parameterized with profile, country, visa, steps, tone, etc.
- Personality/tone is a first-class concept (e.g. `helpful`, `uncle_japa`, `bestie`, `strict_officer`, `hype_man`, `therapist`), affecting both the intro and detailed tone instructions.
- Responses should be cached in Redis using a hash of the rendered prompt, and all calls logged in `AIRequest`.
- For roadmap generation, AI runs as an **async enrichment step**: deterministic steps are generated immediately, and AI adds extra context in the background.

When modifying or adding AI features, follow this pattern:

- Keep a deterministic base implementation that does not depend on AI.
- Use templates + `AIService` instead of hardcoding prompts in views.
- Respect the rate limiting and cost-control guidelines from `plan.md`.

### Background jobs & caching

Celery + Redis are used for:

- Roadmap AI enrichment (`enrich_roadmap_with_ai` task).
- Cleaning up expired anonymous sessions and associated data.
- Future tasks like PDF generation and document generation.

Caching strategy:

- Use Redis for both Celery and selective caching.
- Cache only read-heavy, relatively static data (country lists, visa lists, AI responses) with short TTLs (~1 hour).
- Avoid caching user- or session-specific roadmap data.

### Admin & data flows

Admin and data management patterns from `plan.md`:

- Use Django admin with inlines (e.g. `VisaStep` inline in `VisaType`) and simple analytics.
- Rely on management commands to import seed data for countries, visas, and prompts.
- Track usage analytics (anonymous vs registered, popular countries, AI usage/costs) via admin dashboards and logs.

## Guidance for future Warp agents

- Treat `plan.md` as a *specification*; when writing or editing code, continuously check that new models, views, serializers, Celery tasks, and settings align with the described architecture.
- Preserve the **anonymous-first** design: any new core feature should work without authentication, keyed by session where necessary.
- For AI-related work, keep deterministic fallbacks and avoid creating hard dependencies on external services for basic functionality.
- When the actual Django project, Docker files, and requirements are added, update this `WARP.md` with the concrete test/lint commands and any deviations from the original plan.
