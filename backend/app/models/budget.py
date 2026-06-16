from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    total_budget = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    categories = relationship(
        "BudgetCategory",
        back_populates="budget",
        cascade="all, delete-orphan",
    )


class BudgetCategory(Base):
    __tablename__ = "budget_categories"

    id = Column(Integer, primary_key=True, index=True)
    budget_id = Column(Integer, ForeignKey("budgets.id"), nullable=False, index=True)

    category = Column(String(100), nullable=False)
    limit_amount = Column(Float, nullable=False)

    budget = relationship("Budget", back_populates="categories")