# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

db_url = os.getenv('DATABASE_URL')
if not db_url:
    db_url = 'sqlite:///' + os.path.join(basedir, 'hotel.db')
elif db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql+psycopg2://', 1)
elif db_url.startswith('postgresql://') and not db_url.startswith('postgresql+'):
    db_url = db_url.replace('postgresql://', 'postgresql+psycopg2://', 1)

is_sqlite = db_url.startswith('sqlite')
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
