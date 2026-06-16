from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.budget import Budget, BudgetCategory
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetUpdate

router = APIRouter(prefix="/budgets", tags=["Budgets"])


def get_month_date_range(year: int, month: int):
    start_date = date(year, month, 1)

    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)

    return start_date, end_date


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_budget(
    payload: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.month == payload.month,
            Budget.year == payload.year,
        )
        .first()
    )

    if existing_budget:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Budget already exists for this month and year",
        )

    budget = Budget(
        user_id=current_user.id,
        month=payload.month,
        year=payload.year,
        total_budget=payload.total_budget,
    )

    for category_item in payload.categories:
        budget.categories.append(
            BudgetCategory(
                category=category_item.category,
                limit_amount=category_item.limit_amount,
            )
        )

    db.add(budget)
    db.commit()
    db.refresh(budget)

    return budget


@router.get("/current", response_model=BudgetResponse | None)
def get_current_budget(
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    selected_month = month or today.month
    selected_year = year or today.year

    budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.month == selected_month,
            Budget.year == selected_year,
        )
        .first()
    )

    return budget


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    payload: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = (
        db.query(Budget)
        .filter(
            Budget.id == budget_id,
            Budget.user_id == current_user.id,
        )
        .first()
    )

    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found",
        )

    if payload.total_budget is not None:
        budget.total_budget = payload.total_budget

    if payload.categories is not None:
        budget.categories.clear()

        for category_item in payload.categories:
            budget.categories.append(
                BudgetCategory(
                    category=category_item.category,
                    limit_amount=category_item.limit_amount,
                )
            )

    db.commit()
    db.refresh(budget)

    return budget


@router.get("/status")
def get_budget_status(
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    selected_month = month or today.month
    selected_year = year or today.year

    budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.month == selected_month,
            Budget.year == selected_year,
        )
        .first()
    )

    if not budget:
        return {
            "budget_exists": False,
            "message": "No budget found for this month",
        }

    start_date, end_date = get_month_date_range(selected_year, selected_month)

    expense_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
            Transaction.transaction_date >= start_date,
            Transaction.transaction_date < end_date,
        )
        .all()
    )

    total_spent = sum(transaction.amount for transaction in expense_transactions)
    total_remaining = budget.total_budget - total_spent

    if budget.total_budget > 0:
        usage_percent = round((total_spent / budget.total_budget) * 100, 2)
    else:
        usage_percent = 0

    category_spending = defaultdict(float)

    for transaction in expense_transactions:
        category_spending[transaction.category.lower()] += transaction.amount

    category_status = []

    for category_budget in budget.categories:
        spent = category_spending.get(category_budget.category.lower(), 0.0)
        remaining = category_budget.limit_amount - spent

        if category_budget.limit_amount > 0:
            category_usage = round((spent / category_budget.limit_amount) * 100, 2)
        else:
            category_usage = 0

        category_status.append(
            {
                "category": category_budget.category,
                "limit_amount": category_budget.limit_amount,
                "spent": spent,
                "remaining": remaining,
                "usage_percent": category_usage,
                "status": "over_budget"
                if spent > category_budget.limit_amount
                else "within_budget",
            }
        )

    return {
        "budget_exists": True,
        "month": selected_month,
        "year": selected_year,
        "total_budget": budget.total_budget,
        "total_spent": total_spent,
        "total_remaining": total_remaining,
        "usage_percent": usage_percent,
        "status": "over_budget" if total_spent > budget.total_budget else "within_budget",
        "category_status": category_status,
    }