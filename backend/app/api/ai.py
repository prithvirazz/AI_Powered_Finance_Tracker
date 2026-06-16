from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.ai_insight import AIInsight
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.ai import AIChatRequest, AIChatResponse, AISummaryRequest, AISummaryResponse

router = APIRouter(prefix="/ai", tags=["AI Insights"])


def get_month_range(year: int, month: int):
    start_date = date(year, month, 1)

    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)

    return start_date, end_date


def get_previous_month(year: int, month: int):
    if month == 1:
        return year - 1, 12

    return year, month - 1


def format_inr(amount: float) -> str:
    return f"₹{amount:,.0f}"


def percentage_change(current: float, previous: float) -> float:
    if previous == 0:
        if current == 0:
            return 0
        return 100

    return round(((current - previous) / previous) * 100, 2)


@router.post("/summary", response_model=AISummaryResponse)
def generate_ai_summary(
    payload: AISummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    selected_month = payload.month
    selected_year = payload.year

    current_start, current_end = get_month_range(selected_year, selected_month)

    previous_year, previous_month = get_previous_month(selected_year, selected_month)
    previous_start, previous_end = get_month_range(previous_year, previous_month)

    current_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= current_start,
            Transaction.transaction_date < current_end,
        )
        .all()
    )

    previous_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= previous_start,
            Transaction.transaction_date < previous_end,
        )
        .all()
    )

    current_income = sum(
        transaction.amount
        for transaction in current_transactions
        if transaction.type == "income"
    )

    current_expense = sum(
        transaction.amount
        for transaction in current_transactions
        if transaction.type == "expense"
    )

    previous_expense = sum(
        transaction.amount
        for transaction in previous_transactions
        if transaction.type == "expense"
    )

    balance = current_income - current_expense

    savings_rate = round((balance / current_income) * 100, 2) if current_income > 0 else 0

    expense_change = percentage_change(current_expense, previous_expense)

    category_totals = defaultdict(float)

    for transaction in current_transactions:
        if transaction.type == "expense":
            category_totals[transaction.category] += transaction.amount

    sorted_categories = sorted(
        category_totals.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    top_category = sorted_categories[0][0] if sorted_categories else None
    top_category_amount = sorted_categories[0][1] if sorted_categories else 0

    budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.month == selected_month,
            Budget.year == selected_year,
        )
        .first()
    )

    highlights = []
    warnings = []
    recommendations = []

    if not current_transactions:
        summary = (
            "No transactions were found for this selected month. "
            "Add income and expense records to generate meaningful AI insights."
        )

        recommendations.append(
            "Start by adding your salary, recurring bills, food expenses, rent, and travel transactions."
        )

    else:
        highlights.append(
            f"Total income for this month is {format_inr(current_income)}."
        )
        highlights.append(
            f"Total expenses for this month are {format_inr(current_expense)}."
        )
        highlights.append(
            f"Current balance after expenses is {format_inr(balance)}."
        )
        highlights.append(
            f"Your savings rate is {savings_rate}%."
        )

        if top_category:
            highlights.append(
                f"Your highest spending category is {top_category} at {format_inr(top_category_amount)}."
            )

        if expense_change > 0:
            highlights.append(
                f"Your expenses increased by {expense_change}% compared to the previous month."
            )
        elif expense_change < 0:
            highlights.append(
                f"Your expenses reduced by {abs(expense_change)}% compared to the previous month."
            )
        else:
            highlights.append(
                "Your expenses are almost unchanged compared to the previous month."
            )

        if budget:
            budget_usage = round((current_expense / budget.total_budget) * 100, 2)

            if current_expense > budget.total_budget:
                warnings.append(
                    f"You have exceeded your monthly budget by {format_inr(current_expense - budget.total_budget)}."
                )
            elif budget_usage >= 80:
                warnings.append(
                    f"You have already used {budget_usage}% of your monthly budget."
                )
            else:
                highlights.append(
                    f"You are within your monthly budget. Budget usage is {budget_usage}%."
                )
        else:
            warnings.append(
                "No monthly budget is set for this month, so budget risk analysis is limited."
            )

        if savings_rate < 10:
            recommendations.append(
                "Your savings rate is low. Try reducing discretionary spending by 10–15%."
            )
        elif savings_rate < 25:
            recommendations.append(
                "Your savings rate is moderate. Track flexible categories like food, shopping, and subscriptions."
            )
        else:
            recommendations.append(
                "Your savings rate is healthy. Continue monitoring high-spend categories to maintain this trend."
            )

        if top_category:
            recommendations.append(
                f"Review your {top_category} spending because it is the largest expense category this month."
            )

        if current_expense > 0 and current_income > 0:
            expense_ratio = round((current_expense / current_income) * 100, 2)

            if expense_ratio > 70:
                warnings.append(
                    f"Your expenses consume {expense_ratio}% of your income, which may reduce monthly savings."
                )
            else:
                highlights.append(
                    f"Your expense-to-income ratio is {expense_ratio}%."
                )

        summary = (
            f"For {selected_month}/{selected_year}, you recorded "
            f"{format_inr(current_income)} in income and {format_inr(current_expense)} in expenses. "
            f"Your current balance is {format_inr(balance)}, with a savings rate of {savings_rate}%. "
        )

        if top_category:
            summary += (
                f"The highest spending category was {top_category}, contributing "
                f"{format_inr(top_category_amount)} to your total expenses. "
            )

        if expense_change > 0:
            summary += (
                f"Overall expenses increased by {expense_change}% compared to the previous month. "
            )
        elif expense_change < 0:
            summary += (
                f"Overall expenses reduced by {abs(expense_change)}% compared to the previous month. "
            )

        if warnings:
            summary += "The system detected some budget or spending risks that should be reviewed. "
        else:
            summary += "No major spending risk was detected for this period. "

    insight = AIInsight(
        user_id=current_user.id,
        month=selected_month,
        year=selected_year,
        summary_text=summary,
    )

    db.add(insight)
    db.commit()

    return {
        "summary": summary,
        "highlights": highlights,
        "warnings": warnings,
        "recommendations": recommendations,
        "metadata": {
            "month": selected_month,
            "year": selected_year,
            "income": current_income,
            "expense": current_expense,
            "balance": balance,
            "savings_rate": savings_rate,
            "top_category": top_category,
            "top_category_amount": top_category_amount,
            "expense_change_percent": expense_change,
        },
    }
@router.post("/chat", response_model=AIChatResponse)
def ai_chatbot(
    payload: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_message = payload.message.lower().strip()

    today = date.today()
    current_start, current_end = get_month_range(today.year, today.month)

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_date >= current_start,
            Transaction.transaction_date < current_end,
        )
        .all()
    )

    income_total = sum(
        transaction.amount for transaction in transactions if transaction.type == "income"
    )

    expense_total = sum(
        transaction.amount for transaction in transactions if transaction.type == "expense"
    )

    balance = income_total - expense_total

    category_totals = defaultdict(float)

    for transaction in transactions:
        if transaction.type == "expense":
            category_totals[transaction.category] += transaction.amount

    sorted_categories = sorted(
        category_totals.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    top_category = sorted_categories[0][0] if sorted_categories else None
    top_category_amount = sorted_categories[0][1] if sorted_categories else 0

    budget = (
        db.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.month == today.month,
            Budget.year == today.year,
        )
        .first()
    )

    if not transactions:
        return {
            "answer": (
                "I could not find any transactions for the current month. "
                "Please add income and expense records first, then I can answer your finance questions."
            ),
            "intent": "no_data",
            "metadata": {
                "month": today.month,
                "year": today.year,
            },
        }

    if "food" in user_message:
        food_spending = sum(
            amount
            for category, amount in category_totals.items()
            if category.lower() == "food"
        )

        return {
            "answer": f"You spent {format_inr(food_spending)} on Food this month.",
            "intent": "category_spending_food",
            "metadata": {
                "category": "Food",
                "amount": food_spending,
                "month": today.month,
                "year": today.year,
            },
        }

    if "travel" in user_message or "transport" in user_message:
        travel_spending = sum(
            amount
            for category, amount in category_totals.items()
            if category.lower() in ["travel", "transport", "transportation"]
        )

        return {
            "answer": f"You spent {format_inr(travel_spending)} on Travel/Transportation this month.",
            "intent": "category_spending_travel",
            "metadata": {
                "category": "Travel",
                "amount": travel_spending,
                "month": today.month,
                "year": today.year,
            },
        }

    if "shopping" in user_message:
        shopping_spending = sum(
            amount
            for category, amount in category_totals.items()
            if category.lower() == "shopping"
        )

        return {
            "answer": f"You spent {format_inr(shopping_spending)} on Shopping this month.",
            "intent": "category_spending_shopping",
            "metadata": {
                "category": "Shopping",
                "amount": shopping_spending,
                "month": today.month,
                "year": today.year,
            },
        }

    if "highest" in user_message or "top" in user_message or "largest" in user_message:
        if top_category:
            answer = (
                f"Your highest expense category this month is {top_category}, "
                f"with total spending of {format_inr(top_category_amount)}."
            )
        else:
            answer = "I could not find any expense categories for this month."

        return {
            "answer": answer,
            "intent": "highest_expense_category",
            "metadata": {
                "top_category": top_category,
                "top_category_amount": top_category_amount,
            },
        }

    if "income" in user_message:
        return {
            "answer": f"Your total income for this month is {format_inr(income_total)}.",
            "intent": "monthly_income",
            "metadata": {
                "income": income_total,
                "month": today.month,
                "year": today.year,
            },
        }

    if "expense" in user_message or "spent" in user_message or "spend" in user_message:
        return {
            "answer": f"Your total expenses for this month are {format_inr(expense_total)}.",
            "intent": "monthly_expense",
            "metadata": {
                "expense": expense_total,
                "month": today.month,
                "year": today.year,
            },
        }

    if "balance" in user_message or "saving" in user_message or "savings" in user_message:
        savings_rate = round((balance / income_total) * 100, 2) if income_total > 0 else 0

        return {
            "answer": (
                f"Your current monthly balance is {format_inr(balance)}. "
                f"Your savings rate is {savings_rate}%."
            ),
            "intent": "balance_and_savings",
            "metadata": {
                "balance": balance,
                "savings_rate": savings_rate,
            },
        }

    if "budget" in user_message or "optimize" in user_message or "improve" in user_message:
        recommendations = []

        if budget:
            budget_usage = round((expense_total / budget.total_budget) * 100, 2)

            if expense_total > budget.total_budget:
                recommendations.append(
                    f"You have crossed your monthly budget by {format_inr(expense_total - budget.total_budget)}."
                )
            elif budget_usage >= 80:
                recommendations.append(
                    f"You have already used {budget_usage}% of your monthly budget. Reduce discretionary spending."
                )
            else:
                recommendations.append(
                    f"You are within budget. Current budget usage is {budget_usage}%."
                )
        else:
            recommendations.append(
                "You have not set a budget for this month. Start by creating a monthly budget."
            )

        if top_category:
            recommendations.append(
                f"Your largest spending area is {top_category}. Reviewing this category can improve savings."
            )

        recommendations.append(
            "A practical target is to reduce flexible expenses like food delivery, shopping, subscriptions, and travel by 10–15%."
        )

        return {
            "answer": " ".join(recommendations),
            "intent": "budget_optimization",
            "metadata": {
                "expense": expense_total,
                "top_category": top_category,
                "budget_exists": budget is not None,
            },
        }

    if "summary" in user_message or "trend" in user_message or "summarize" in user_message:
        savings_rate = round((balance / income_total) * 100, 2) if income_total > 0 else 0

        answer = (
            f"This month, your income is {format_inr(income_total)} and your expenses are "
            f"{format_inr(expense_total)}. Your remaining balance is {format_inr(balance)}, "
            f"with a savings rate of {savings_rate}%."
        )

        if top_category:
            answer += f" Your highest spending category is {top_category} at {format_inr(top_category_amount)}."

        return {
            "answer": answer,
            "intent": "monthly_summary",
            "metadata": {
                "income": income_total,
                "expense": expense_total,
                "balance": balance,
                "top_category": top_category,
                "savings_rate": savings_rate,
            },
        }

    return {
        "answer": (
            "I can help you with questions like: "
            "'How much did I spend this month?', "
            "'What is my highest expense category?', "
            "'How much did I spend on food?', "
            "'Summarize my spending trends', or "
            "'How can I optimize my budget?'"
        ),
        "intent": "fallback_help",
        "metadata": {
            "supported_queries": [
                "monthly expense",
                "monthly income",
                "highest category",
                "category spending",
                "budget optimization",
                "spending summary",
            ]
        },
    }