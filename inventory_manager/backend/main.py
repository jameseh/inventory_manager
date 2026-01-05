from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.database import engine, Base
from app.routers import auth, items, upload, transactions, dashboard
from app.models.transaction import Transaction
import os

# Create tables (if not using Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory System with Authentication + Roles")

# Ensure media directory exists
MEDIA_DIR = "media"
os.makedirs(MEDIA_DIR, exist_ok=True)

app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.206:3000",
        "http://localhost:8000",
        "http://192.168.1.206:8000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

app.include_router(auth.router)
app.include_router(items.router)
app.include_router(upload.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
