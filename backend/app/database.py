import os
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import inspect, text
from .config import settings

# SQLite connection with thread safety
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=connect_args)

def init_db():
    SQLModel.metadata.create_all(engine)
    # Lightweight compatibility migration for existing SQLite deployments.
    # New installations receive the column from SQLModel.metadata.create_all.
    inspector = inspect(engine)
    if "caserecord" in inspector.get_table_names():
        columns = {column["name"] for column in inspector.get_columns("caserecord")}
        if "access_token_hash" not in columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE caserecord ADD COLUMN access_token_hash VARCHAR"))

def get_session():
    with Session(engine) as session:
        yield session
