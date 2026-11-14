# 01-MILESTONE — Core Booking Platform (as built)

> **Provenance:** No spec file existed for this milestone. This document was written by reading the code on branch `chore/add-ship-feature-command` (HEAD `625e9ba`, 2026-11-14). It records what is *actually implemented*, including known gaps, so later milestones can be specified against a true baseline. Milestone 0 is the original Flask app, preserved in `backend/app_flask_legacy.py`.

## 1. Overview

**Rajmahal Residency** is a full-stack hotel room booking app: a FastAPI backend in `backend/` and a React 19 + Vite single-page frontend in `frontend/`. Milestone 1 delivers the core booking flow (browse rooms → register or sign in → reserve → view and cancel reservations) and a rule-based AI assistant API that works without any LLM.

**Design principle (from `ai_orchestrator.py`):** if AI or the LLM is down, core booking and hotel operations never fail.

| Layer | Technology | Status |
| :--- | :--- | :--- |
| Frontend | React 19, Vite 8, TanStack React Query 5 (provider only), lucide-react, plain CSS | Working |
| Backend | FastAPI, Uvicorn, SQLAlchemy 2, Pydantic 2 / pydantic-settings (v2.0.0) | Working |
| Database | SQLite (`backend/hotel.db`) by default; PostgreSQL 16 + pgvector via Docker | Working (pgvector unused) |
| AI | Deterministic rule-based fallback only | Partial |
| Cache / queue | Redis 7 provisioned in Docker Compose | Not used by code |
| Tests | pytest + FastAPI `TestClient` (5 tests) | Working |
| Infra | Dockerfiles + `docker-compose.yml` | Provisioned |

---

## 2. Commands

### 2.1 Backend (`cd backend`)

| Purpose | Command | Notes |
| :--- | :--- | :--- |
| Create venv | `python -m venv .venv` | Python 3.11+ |
| Activate (Windows) | `.venv\Scripts\activate` | macOS/Linux: `source .venv/bin/activate` |
| Install deps | `pip install -r requirements.txt` | fastapi, uvicorn[standard], pydantic, pydantic-settings, SQLAlchemy, psycopg2-binary, python-dotenv, requests, pytest |
| Configure env | `cp .env.example .env` | Optional. **Caution:** the example sets `DATABASE_URL` to PostgreSQL. Comment it out to use SQLite. |
| Seed database | `python seed_data.py` | Creates tables, 25 rooms, and the demo user. Idempotent. |
| Re-seed rooms | `python seed_data.py --force` | Deletes all rooms and recreates them. Existing bookings are not cleared, so they can point at recreated rooms. |
| Run server | `python app.py` | `http://127.0.0.1:5000` with auto-reload. Same as `python main.py`. |
| Run with uvicorn | `uvicorn main:app --host 127.0.0.1 --port 5000 --reload` | This is what the Dockerfile runs (host `0.0.0.0`, no reload). |
| API docs | open `http://127.0.0.1:5000/docs` | FastAPI Swagger UI (`/redoc` also available) |
| Run tests | `pytest` (or `python -m pytest -q`) | Needs a seeded DB: run `python seed_data.py` first. |

### 2.2 Frontend (`cd frontend`)

| Purpose | Command | Notes |
| :--- | :--- | :--- |
| Install | `npm install` | Node 22+ |
| Dev server | `npm run dev` | `http://127.0.0.1:5173`. Proxies `/api/*` to `http://127.0.0.1:5000` with the `/api` prefix stripped, so start the backend first. |
| Production build | `npm run build` | Output to `frontend/dist/` (git-ignored) |
| Preview build | `npm run preview` | |
| Lint | `npm run lint` | oxlint (`.oxlintrc.json`) |

### 2.3 Docker (repo root)

| Purpose | Command |
| :--- | :--- |
| Build and start all services | `docker compose up --build` |
| Seed the containerized DB | `docker compose exec backend python seed_data.py` |

Services: `postgres` (`pgvector/pgvector:pg16`, port 5432, volume `postgres_data`), `redis` (`redis:7-alpine`, port 6379, volume `redis_data`), `backend` (port 5000), `frontend` (mapped to 5173). The backend waits for the Postgres healthcheck. Defaults can be overridden with `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `OPENAI_API_KEY` and `AI_MODEL`.

### 2.4 Demo account

`harsh@example.com` / PIN `1234`, created by `seed_data.py` only when the `user` table is empty.

### 2.5 Claude Code workflow commands (`.claude/`)

| Command | File | What it does |
| :--- | :--- | :--- |
| `/session-branch-workflow` | `.claude/skills/session-branch-workflow/SKILL.md` | Start of session: commit and push leftover work, delete the old local branch only after confirming it is on the remote, update the base branch, and create a fresh `TYPE/short-kebab-name` branch. Never force-pushes, never commits to the base branch, never deletes remote branches. |
| `/ship-feature` | `.claude/commands/ship-feature.md` | End of feature (9 steps): refuse on `main` → secrets/junk check and `pytest` if `backend/` changed → Conventional Commit → push → create PR via GitHub MCP → squash-merge → delete remote branch → `git checkout main` + `git pull --ff-only` → `git branch -D` local branch. Reads `.claude/specs/` for the PR text and definition of done. Stops if tests fail, PR creation fails, or GitHub MCP is not connected. |

Commit message rules used by `/ship-feature`: `feat | fix | chore | docs`, lowercase, no trailing period, under 72 characters, describes what the user can now do.

---

## 3. Configuration

Loaded from `backend/.env` (via `python-dotenv`) or real environment variables. `core/config.py` and `database.py` each read them.

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///backend/hotel.db` | DB connection. `postgres://` and `postgresql://` are rewritten to `postgresql+psycopg2://`. SQLite gets `check_same_thread=False`. |
| `REDIS_URL` | `redis://localhost:6379/0` | Reserved; unused |
| `OPENAI_API_KEY` | empty | Intended to enable the LLM path; not wired up |
| `AI_MODEL` | `gpt-4o-mini` | Intended model name; not wired up |
| `AI_FALLBACK_ENABLED` | `true` | Settings flag only; not read by any logic |

Fixed in code: `PROJECT_NAME="Rajmahal Residency API"`, `VERSION="2.0.0"`, `CORS_ORIGINS=["*"]`.

---

## 4. Features

### 4.1 Data model (`backend/models.py`)

| Table | Columns |
| :--- | :--- |
| `user` | `id` PK, `name` (50), `email` (120, unique, indexed), `password` (128, plain text), `age`, `address` (200) |
| `room` | `id` PK (101–105 Single, 201–205 Double, 301–305 Suite, 401–405 Deluxe, 501–505 Family), `room_type` (20), `price` (int ₹), `is_available` (bool) |
| `booking` | `id` PK, `user_id` FK→user, `room_id` FK→room, `start_date`, `end_date` |

Schema is created at app startup (`Base.metadata.create_all` in the FastAPI lifespan). There are no migrations.

### 4.2 Rooms

- **25 rooms, 5 categories, 5 rooms each**, seeded at fixed per-night prices: Single ₹1,200 · Double ₹2,200 · Suite ₹3,800 · Deluxe ₹5,500 · Family ₹7,500.
- **Metadata is attached in code, not stored in the DB** (`ROOM_META` in `hotel_service.py`). Each category has an image URL (Unsplash), an amenities list, a capacity (Single 1, Double 2, Suite 3, Deluxe 2, Family 4) and a description. A `Luxury Suite` metadata entry exists but no such rooms are seeded. Unknown types fall back to the Double metadata.
- **`GET /rooms`** returns only available rooms by default; `?all=true` includes booked rooms.

### 4.3 Accounts (email + 4-digit PIN)

- **Register** (`POST /register`): requires a non-empty name, an email containing `@` and `.`, and a password that is exactly 4 digits. Email is lower-cased. A duplicate email that already has a PIN returns `409`. A pre-existing user with no PIN (for example one created via `/users`) is upgraded in place rather than duplicated. Success returns `201` with `{message, user:{id,name,email}}`.
- **Login** (`POST /login`): wrong email or PIN returns `401` with a single generic message; missing fields return `400`. Success returns `200` with the user object.
- **Session** is client-side only: the frontend stores the user in `localStorage` under `rajmahal_user`. There are no tokens, and the server does not authenticate later requests.
- **`/users`** (`GET` lists `{id,name,email}`; `POST` get-or-creates a user by email with a generated guest email when none is given). This is a legacy helper and returns no password.

### 4.4 Reservations

- **Book** (`POST /book`, `201`): requires `room_id`, `start_date`, `end_date` (`YYYY-MM-DD`), and a known user via `user_id` or `user_email`. Checks, in order: room exists (`404`) → room available (`400`) → user exists (`401`, "Authentication required…") → date format and `end_date > start_date` (`400`). On success it creates the booking, sets `room.is_available = False`, and returns `{message, booking_id, room_id, user_id, user_name}`.
- **List** (`GET /bookings`, optional `?user_id=`): newest first, enriched with `user_name`, `user_email`, `room_type`, `room_price`, `room_image`, `start_date`, `end_date`. A non-numeric `user_id` is silently ignored (returns all bookings).
- **Cancel** (`DELETE /cancel/{booking_id}`): deletes the booking and sets the room available again. `404` if not found. There is no ownership check, so anyone can cancel any booking.
- **Availability model:** a room has one available/booked flag. There is no date-range availability, so a booked room is blocked for all dates until cancelled.
- **Error contract:** all errors are returned as `{"message": "..."}` (custom `HTTPException` handler in `main.py`).

### 4.5 AI assistant API (rule-based)

All endpoints work with no LLM configured. `AIOrchestrator.chat()` currently always calls the rule-based fallback, and `has_llm` is computed but never used.

| Endpoint | Behaviour |
| :--- | :--- |
| `POST /ai/chat` `{message, history?, context?}` | Keyword match → `{reply, suggested_category, source:"rule_fallback"}`. Keyword groups: solo/business/single → Single; couple/double/romantic → Double; family/kids/group → Family; luxury/suite/deluxe/royal/view → Suite; price/cost/cheap/rate → price list; anything else → welcome message. `history` and `context` are accepted but ignored. Prices in replies are hard-coded strings. |
| `POST /ai/recommend` `{budget_max?, guests?}` | Filters **available** rooms by `price <= budget_max` and `capacity >= guests`. If nothing matches, returns the first 3 available rooms. Response: `{recommendations:[room…]}`. |
| `POST /ai/compare` `{room_ids:[…]}` | Looks across all rooms and returns `{rooms:[{id,type,price,capacity,amenities,is_available}], count, recommendation}`. `recommendation` is the type of the first selected room, or `"Double"` if none. |

### 4.6 Frontend

Single-page app with three tabs (`rooms`, `bookings`, `auth`) held in `App.jsx` state. Toasts auto-dismiss after 4.5 s.

- **Navbar:** logo, "Rooms & Suites" tab with a live available-rooms badge, "My Bookings" tab with a count badge, a Sign In / Register button (or a user chip with sign-out), and a BOOK NOW button that scrolls to the room list.
- **Hero and availability widget:** check-in date (today to +7 days), stay duration (1–7, 10, 14 days), an auto-calculated check-out date, a guests selector, and a "Check availability" button. These values only scroll the page and do not filter results or pre-fill the booking modal.
- **Search and filters** (all client-side): free-text search (category name, room id, description, amenities), category chips (All/Single/Double/Suite/Deluxe/Family), a max-price slider (₹1,000–₹10,000, step 500), an "Available only" toggle, a live "Showing X of Y rooms" counter, and a "Reset all filters" action on an empty result.
- **Category cards:** one card per category with image, rating, price, capacity, amenities, a per-room availability pill ("N of 5 available"), a selectable grid of the 5 room IDs (booked rooms are disabled), and a Book button (or "All 5 Rooms Booked").
- **Booking modal:** room summary; sign-in gate when logged out and a verified-member banner when logged in; check-in date (today to +7 days); stay duration via 1–7 day chips or a 1–30 day dropdown; an auto-calculated, read-only check-out date; a price breakdown (nights × rate, "taxes included ₹0", total). Submitting while logged out redirects to the auth tab and remembers the pending room.
- **Auth page:** Sign In / Create Account tabs; the PIN field accepts digits only (max 4) with a dot progress indicator and show/hide toggle; a one-click demo-credentials fill; a callout showing the pending booking. After success the guest is returned to the booking modal for the room they chose.
- **My Bookings:** three states — signed out (prompt to sign in), signed in with none (prompt to browse), and a list of cards (image, room, dates, rate, "Confirmed" tag) with a **Cancel Stay** button behind a `confirm()` dialog. Bookings are filtered client-side by user id or email.
- **Other:** guest reviews section (3 static reviews), footer with contact details, an offline banner with a Retry button, and a server-status indicator.
- **Data layer:** `services/api.js` is the client used by the app (base `/api`: status, rooms, book, bookings, cancel, register, login). The AI endpoints have **no frontend client or UI**.

### 4.7 Tests (`backend/tests/test_api.py`)

1. `test_health_check` — `GET /` is online and the service name contains "FastAPI".
2. `test_rooms_list` — `GET /rooms?all=true` returns at least 20 rooms with `id`, `type`, `price`, `amenities`.
3. `test_login_validation` — wrong PIN → `401`; demo credentials → `200`.
4. `test_booking_requires_authentication` — booking with no user is rejected (`400` or `401`).
5. `test_ai_fallback_resilience` — `/ai/chat` returns a `reply` and `source == "rule_fallback"`.

Tests run against the real configured database, with no isolation or fixtures. Nothing tests registration, a successful booking, cancellation, `/ai/recommend` or `/ai/compare`.

---

## 5. REST API summary

| Method | Endpoint | Success | Errors |
| :--- | :--- | :--- | :--- |
| GET | `/` | `200` status JSON | — |
| GET | `/rooms?all=` | `200` room list | — |
| POST | `/register` | `201` | `400`, `409` |
| POST | `/login` | `200` | `400`, `401` |
| GET / POST | `/users` | `200` | — |
| POST | `/book` | `201` | `400`, `401`, `404` |
| GET | `/bookings?user_id=` | `200` list | — |
| DELETE | `/cancel/{booking_id}` | `200` | `404` |
| POST | `/ai/chat` | `200` | — |
| POST | `/ai/recommend` | `200` | — |
| POST | `/ai/compare` | `200` | — |

---

## 6. Definition of done for this milestone

- [x] Rooms are seeded (25 across 5 categories) and listed through the API and UI
- [x] Register and sign in with email + 4-digit PIN
- [x] A booking requires a registered user; guests are redirected to sign in and return to their pending booking
- [x] Booking, listing and cancelling reservations, with the room's availability updated
- [x] Client-side search, category, price and availability filters
- [x] AI endpoints respond with no LLM configured (rule-based fallback)
- [x] Works on SQLite locally; Docker Compose provisions PostgreSQL/pgvector and Redis
- [x] Five API tests exist (`cd backend && pytest`)
- [ ] Tests pass — **not verified when this document was written; none were run**
- [ ] Date-range availability, hashed passwords, token auth, a real LLM path, RAG, Redis caching (see §7)

---

## 7. Known gaps and inconsistencies (found while reading the code)

**Security**
1. PINs are stored and compared in **plain text**; a 4-digit PIN has only 10,000 combinations and there is no rate limiting.
2. There are **no auth tokens**. Anyone can call `/book` with any `user_id`, and `/cancel/{id}` and `/bookings` (without `user_id`) expose and modify any user's data. The `user_id` filter on `/bookings` is optional.
3. `CORS_ORIGINS=["*"]` together with `allow_credentials=True`.
4. `.env.example` ships working-looking Postgres credentials, and `docker-compose.yml` hard-codes the same password for the backend `DATABASE_URL`.

**Correctness**
5. Availability is a single boolean, not date-based. The booking race (check then write) is also unguarded.
6. `seed_data.py --force` deletes rooms without touching bookings, which leaves orphaned foreign keys.
7. The booking modal sends `user_name` and the frontend sends it too, but the backend ignores it; the displayed name always comes from the user record.
8. The hero widget's dates and guest count are not passed on to the booking modal or the filters.
9. `.env.example` sets `DATABASE_URL` to PostgreSQL, so copying it as-is stops the "no setup" SQLite path working and the app fails to start unless Postgres is running.

**Unused or misleading code**
10. `schemas.py` (Pydantic schemas) is not imported anywhere; the routers parse `request.json()` by hand with no validation models.
11. `hooks/useHotelQueries.js`, `types/hotel.ts` and the React Query provider are wired but unused; `App.jsx` fetches with `useState`/`useEffect` instead.
12. `AI_FALLBACK_ENABLED`, `OPENAI_API_KEY`, `AI_MODEL`, `REDIS_URL` and `AIOrchestrator.has_llm` have no effect on behaviour. Despite the README's "AI assistant", there is no LLM integration.
13. Stale UI text: an offline banner and error toast say "Flask backend"; the footer says "Powered by Flask REST API"; the registration toast says "Welcome to Grand Horizon".
14. `frontend/Dockerfile` builds a static nginx image listening on port **80**, but `docker-compose.yml` maps `5173:5173`, and the nginx image has no `/api` proxy, so the containerized frontend cannot reach the backend as configured.
15. The auth page claims "256-bit encrypted" and "100% refund before check-in", but neither is implemented.

---

## 8. Out of scope for this milestone (planned next, per README roadmap)

- [ ] LLM tool-calling in `AIOrchestrator` (OpenAI) keeping the rule-based fallback
- [ ] RAG over hotel content using pgvector embeddings
- [ ] Redis query caching and AI rate limiting
- [ ] Date-range availability
- [ ] Hashed passwords and token-based authentication
- [ ] Restricted CORS origins for production
