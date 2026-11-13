# backend/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from core.config import settings
from routers import rooms, auth, bookings, ai

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema exists on startup
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Exception handler for seamless frontend contract compatibility
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "message" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc.detail)}
    )

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(rooms.router)
app.include_router(auth.router)
app.include_router(bookings.router)
app.include_router(ai.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Rajmahal Residency API (FastAPI)",
        "version": settings.VERSION,
        "stack": "FastAPI + SQLAlchemy 2 + Pydantic 2 + PostgreSQL/SQLite"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)
