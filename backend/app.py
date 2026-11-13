# backend/app.py
"""
Rajmahal Residency - Modern FastAPI Server Entrypoint
Migrated to FastAPI + SQLAlchemy 2 + Pydantic 2.
Milestone 0 legacy Flask app is preserved in `app_flask_legacy.py`.
"""
import uvicorn
from main import app

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=True)
