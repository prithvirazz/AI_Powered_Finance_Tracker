from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.ai import router as ai_router
from app.api.budgets import router as budgets_router
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.transactions import router as transactions_router
from app.core.config import settings
from app.db.session import Base, engine
from app.models import AIInsight, Budget, BudgetCategory, Transaction, User

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered finance and expense tracking platform backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(transactions_router)
app.include_router(dashboard_router)
app.include_router(budgets_router)
app.include_router(ai_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "message": "FinSight AI backend is running",
    }