# config.py
import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))

# Load environment variables from .env file if it exists
load_dotenv(os.path.join(basedir, '.env'))

db_url = os.getenv('DATABASE_URL')
if not db_url:
    # Default fallback to SQLite
    db_url = 'sqlite:///' + os.path.join(basedir, 'hotel.db')
elif db_url.startswith('postgres://'):
    # SQLAlchemy requires 'postgresql://' instead of legacy 'postgres://'
    db_url = db_url.replace('postgres://', 'postgresql://', 1)

class Config:
    SQLALCHEMY_DATABASE_URI = db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
