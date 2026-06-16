from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.transaction import Transaction
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def get_month_range(year: int, month: int):
    start_date = date(year, month, 1)

    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)

    return start_date, end_date


def calculate_percentage_change(current: float, previous: float) -> float:
    if previous == 0:
        if current == 0:
            return 0
        return 100

    return round(((current - previous) / previous) * 100, 2)


@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    current_start, current_end = get_month_range(today.year, today.month)

    if today.month == 1:
        previous_year = today.year - 1
        previous_month = 12
    else:
        previous_year = today.year
        previous_month = today.month - 1

    previous_start, previous_end = get_month_range(previous_year, previous_month)

    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .all()
    )

    current_income = 0.0
    current_expense = 0.0
    previous_income = 0.0
    previous_expense = 0.0

    for transaction in transactions:
        transaction_date = transaction.transaction_date

        if current_start <= transaction_date < current_end:
            if transaction.type == "income":
                current_income += transaction.amount
            else:
                current_expense += transaction.amount

        if previous_start <= transaction_date < previous_end:
            if transaction.type == "income":
                previous_income += transaction.amount
            else:
                previous_expense += transaction.amount

    balance = current_income - current_expense

    if current_income > 0:
        savings_rate = round((balance / current_income) * 100, 2)
    else:
        savings_rate = 0

    return {
        "total_income": current_income,
        "total_expense": current_expense,
        "balance": balance,
        "income_change_percent": calculate_percentage_change(
            current_income,
            previous_income,
        ),
        "expense_change_percent": calculate_percentage_change(
            current_expense,
            previous_expense,
        ),
        "savings_rate": savings_rate,
    }


@router.get("/category-breakdown")
def get_category_breakdown(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    current_start, current_end = get_month_range(today.year, today.month)

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
            Transaction.transaction_date >= current_start,
            Transaction.transaction_date < current_end,
        )
        .all()
    )

    category_totals = defaultdict(float)

    for transaction in transactions:
        category_totals[transaction.category] += transaction.amount

    return [
        {
            "category": category,
            "amount": amount,
        }
        for category, amount in sorted(
            category_totals.items(),
            key=lambda item: item[1],
            reverse=True,
        )
    ]


@router.get("/monthly-trend")
def get_monthly_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    month_keys = []

    for index in range(5, -1, -1):
        month = today.month - index
        year = today.year

        while month <= 0:
            month += 12
            year -= 1

        month_keys.append((year, month))

    trend_map = {
        (year, month): {
            "month": date(year, month, 1).strftime("%b"),
            "income": 0.0,
            "expense": 0.0,
        }
        for year, month in month_keys
    }

    transactions = (
        db.query(Transaction)
        .filter(Transaction.user_id == current_user.id)
        .all()
    )

    for transaction in transactions:
        key = (
            transaction.transaction_date.year,
            transaction.transaction_date.month,
        )

        if key in trend_map:
            if transaction.type == "income":
                trend_map[key]["income"] += transaction.amount
            else:
                trend_map[key]["expense"] += transaction.amount

    return [trend_map[key] for key in month_keys]