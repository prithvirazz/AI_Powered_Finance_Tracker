from datetime import datetime
from pydantic import BaseModel, Field


class BudgetCategoryCreate(BaseModel):
    category: str = Field(..., min_length=2, max_length=100)
    limit_amount: float = Field(..., gt=0)


class BudgetCreate(BaseModel):
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)
    total_budget: float = Field(..., gt=0)
    categories: list[BudgetCategoryCreate] = []


class BudgetUpdate(BaseModel):
    total_budget: float | None = Field(default=None, gt=0)
    categories: list[BudgetCategoryCreate] | None = None


class BudgetCategoryResponse(BaseModel):
    id: int
    category: str
    limit_amount: float

    class Config:
        from_attributes = True


class BudgetResponse(BaseModel):
    id: int
    user_id: int
    month: int
    year: int
    total_budget: float
    created_at: datetime
    categories: list[BudgetCategoryResponse]

    class Config:
        from_attributes = True