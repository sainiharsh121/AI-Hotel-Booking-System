# 🏨 Rajmahal Residency — AI Hotel Booking System

A full-stack hotel room booking and management web application for **Rajmahal Residency**, built with a **FastAPI** (Python) backend and a **React 19 + Vite** single-page frontend. It includes an AI-assistant layer that is designed so that booking never depends on an LLM being available.

> **Status:** The core booking flow (rooms, accounts, reservations, cancellations) is working. The AI layer currently runs on deterministic rule-based logic; LLM tool-calling, RAG (pgvector) and Redis caching are planned (see [Roadmap](#-roadmap)).

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, TanStack React Query, lucide-react, plain CSS design system |
| **Backend** | FastAPI, Uvicorn, SQLAlchemy 2, Pydantic 2 / pydantic-settings |
| **Database** | SQLite for local development (`backend/hotel.db`); PostgreSQL 16 + pgvector via Docker |
| **Cache / queue** | Redis 7 (provisioned in Docker Compose, not used by the code yet) |
| **AI** | Rule-based assistant today; OpenAI (`gpt-4o-mini`) integration planned |
| **Testing** | pytest + FastAPI `TestClient` |
| **Infra** | Docker & Docker Compose |

---

## 🌟 Key Features

- **Rooms showcase** — 25 rooms across 5 categories (Single, Double, Suite, Deluxe, Family) with images, amenities, capacity and prices in ₹.
- **Search & filtering** — filter by room category, price range and an "Available only" toggle.
- **Reservation engine** — booking modal with automatic night count, live total price and date validation (check-out must be after check-in).
- **Accounts** — register and sign in with an email and a 4-digit PIN. A signed-in account is required to confirm a booking; guests are redirected to sign in and returned to their pending reservation afterwards.
- **My Bookings** — view reservations and cancel them, which releases the room again.
- **AI assistant endpoints** — chat, room recommendation (by budget and party size) and room comparison. All have a deterministic fallback, so the hotel keeps working if no LLM is configured.
- **Polished UI** — luxury styling (Cormorant Garamond, Playfair Display, Outfit, Inter), reviews section, toast notifications and a server-status indicator.

---

## 📂 Project Structure

```
AI-Hotel-Booking-System/
├── backend/                         # FastAPI service
│   ├── main.py                      # App factory: CORS, error handler, routers, startup schema creation
│   ├── app.py                       # Thin launcher (uvicorn -> main:app)
│   ├── app_flask_legacy.py          # Original Flask version (Milestone 0), kept for reference
│   ├── database.py                  # SQLAlchemy engine / session (SQLite or PostgreSQL)
│   ├── models.py                    # ORM models: User, Room, Booking
│   ├── schemas.py                   # Pydantic schemas
│   ├── seed_data.py                 # Seeds 25 rooms and a demo user
│   ├── core/config.py               # Settings loaded from environment / .env
│   ├── routers/
│   │   ├── rooms.py                 # GET /rooms
│   │   ├── auth.py                  # /register, /login, /users
│   │   ├── bookings.py              # /book, /bookings, /cancel/{id}
│   │   └── ai.py                    # /ai/chat, /ai/recommend, /ai/compare
│   ├── services/
│   │   ├── hotel_service.py         # Business logic: rooms, auth, bookings
│   │   └── ai_orchestrator.py       # AI layer with deterministic fallbacks
│   ├── tests/test_api.py            # API tests
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example                 # Environment variable template
│
├── frontend/                        # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx                  # Top-level state and tab routing
│   │   ├── components/              # Navbar, HeroSection, CategoryBox, RoomCard, BookingModal,
│   │   │                            # BookingsList, AuthPage, ReviewsSection, Toast
│   │   ├── services/api.js          # Centralized API client (calls /api/*)
│   │   ├── hooks/useHotelQueries.js # React Query hooks
│   │   └── lib/queryClient.js
│   ├── vite.config.js               # Dev server on :5173, proxies /api -> http://127.0.0.1:5000
│   └── Dockerfile
│
├── docker-compose.yml               # Postgres (pgvector), Redis, backend, frontend
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Python** 3.11+
- **Node.js** 22+ and npm
- *(Optional)* Docker Desktop for the Postgres/Redis stack

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows  (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt

cp .env.example .env              # optional; leave DATABASE_URL commented/blank to use SQLite
python seed_data.py               # creates tables, 25 rooms and a demo user
python app.py                     # http://127.0.0.1:5000
```

With no `DATABASE_URL` set, the API uses a local SQLite file (`backend/hotel.db`). Interactive API docs are available at **http://127.0.0.1:5000/docs**.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                       # http://127.0.0.1:5173
```

The Vite dev server proxies `/api/*` to the backend on port 5000, so start the backend first.

### 3. Tests

```bash
cd backend
pytest
```

The tests expect a seeded database (run `python seed_data.py` first).

### Demo account
Seeding creates a demo user: `harsh@example.com` / PIN `1234`.

---

## ⚙️ Configuration

Set these in `backend/.env` (see `.env.example`):

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | SQLite file | PostgreSQL URL for production-style setups |
| `REDIS_URL` | `redis://localhost:6379/0` | Reserved for caching / rate limiting |
| `OPENAI_API_KEY` | *(empty)* | Enables the LLM path once implemented |
| `AI_MODEL` | `gpt-4o-mini` | Model name for the AI layer |
| `AI_FALLBACK_ENABLED` | `true` | Keep rule-based fallback when the LLM is unavailable |

---

## 📡 REST API

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Service status and stack info |
| `GET` | `/rooms` | List available rooms (`?all=true` to include booked rooms) |
| `POST` | `/register` | Create an account (`name`, `email`, 4-digit `password`) |
| `POST` | `/login` | Sign in (`email`, `password`) |
| `GET` / `POST` | `/users` | List or create users |
| `POST` | `/book` | Book a room (`room_id`, `start_date`, `end_date`, plus `user_id` or `user_email`) |
| `GET` | `/bookings` | List reservations (`?user_id=` to filter) |
| `DELETE` | `/cancel/{booking_id}` | Cancel a booking and free the room |
| `POST` | `/ai/chat` | Assistant reply for a guest message |
| `POST` | `/ai/recommend` | Recommend rooms by `budget_max` and `guests` |
| `POST` | `/ai/compare` | Compare rooms by `room_ids` |

Dates use the `YYYY-MM-DD` format. Errors are returned as `{"message": "..."}`.

---

## 🐳 Docker

`docker-compose.yml` defines four services: `postgres` (pgvector/pg16), `redis`, `backend` (port 5000) and `frontend`.

```bash
docker compose up --build
```

Seed the containerized database with `docker compose exec backend python seed_data.py`.

---

## 🗺️ Roadmap

- [ ] LLM tool-calling in `AIOrchestrator` (OpenAI), keeping the rule-based fallback
- [ ] RAG over hotel content using pgvector embeddings
- [ ] Redis query caching and AI rate limiting
- [ ] Date-range availability (currently a room has a single available/booked flag)
- [ ] Hashed passwords and token-based authentication
- [ ] Restricted CORS origins for production

---

## 👨‍💻 Author

**Harsh Saini**
