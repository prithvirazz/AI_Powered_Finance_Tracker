from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    type: Literal["income", "expense"]
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    transaction_date: date


class TransactionUpdate(BaseModel):
    type: Literal["income", "expense"] | None = None
    amount: float | None = Field(default=None, gt=0)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    transaction_date: date | None = None


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    type: str
    amount: float
    category: str
    description: str | None
    transaction_date: date
    created_at: datetime

    class Config:
        from_attributes = True