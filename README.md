# FinSight AI — AI-Powered Finance & Expense Tracking Platform

FinSight AI is a full-stack AI-powered finance and expense tracking platform built for managing personal transactions, monitoring spending patterns, planning budgets, and generating intelligent financial insights.

The platform helps users track income and expenses, analyze monthly financial behavior, set budgets, and interact with an AI assistant for finance-related queries.

## Key Features

* User signup and login with JWT authentication
* Protected dashboard routes
* Income and expense transaction management
* Transaction search and filtering by type, category, date, and description
* Dynamic financial dashboard with analytics cards and charts
* Monthly income vs expense visualization
* Category-wise expense breakdown
* Budget creation and budget status tracking
* Category-wise budget usage analysis
* AI-generated financial summary
* AI chatbot assistant for finance-related queries
* Responsive modern UI
* Secure backend API architecture

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router DOM
* Axios
* Recharts
* Lucide React

### Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* Passlib + bcrypt
* SQLite for local development

### Database

* SQLite for local development
* PostgreSQL-ready architecture for production deployment

## Project Structure

```txt
finsight-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── main.tsx
│   └── .env
│
├── docs/
│   ├── screenshots/
│   └── technical-report.md
│
└── README.md
```

## Local Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-link>
cd finsight-ai
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder:

```env
APP_NAME=FinSight AI
SECRET_KEY=change-this-secret-key-before-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./finsight.db
FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

Backend runs at:

```txt
http://127.0.0.1:8000
```

API documentation:

```txt
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend folder:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Run the frontend:

```bash
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

## Main API Modules

### Authentication

* `POST /auth/signup`
* `POST /auth/login`
* `POST /auth/token`
* `GET /auth/me`

### Transactions

* `POST /transactions`
* `GET /transactions`
* `GET /transactions/{transaction_id}`
* `PUT /transactions/{transaction_id}`
* `DELETE /transactions/{transaction_id}`

### Dashboard

* `GET /dashboard/summary`
* `GET /dashboard/category-breakdown`
* `GET /dashboard/monthly-trend`

### Budgets

* `POST /budgets`
* `GET /budgets/current`
* `PUT /budgets/{budget_id}`
* `GET /budgets/status`

### AI

* `POST /ai/summary`
* `POST /ai/chat`

## AI Workflow

The AI module uses a rule-based financial intelligence workflow over the user’s real transaction and budget data. It can generate monthly summaries, highlight top spending categories, detect budget risks, calculate savings rate, and answer chatbot queries such as:

* How much did I spend this month?
* What is my highest expense category?
* How much did I spend on food?
* Summarize my spending trends.
* How can I optimize my monthly budget?

This approach avoids dependency on external paid APIs while still demonstrating AI-driven product behavior.

## Security Features

* JWT-based authentication
* Protected backend routes
* Password hashing using bcrypt
* Request validation using Pydantic
* CORS configuration
* User-specific transaction and budget isolation

## Future Improvements

* PostgreSQL production deployment
* Alembic migrations
* Docker support
* Real-time notifications
* AI-powered transaction auto-categorization
* Advanced analytics
* Multi-user family finance tracking
* OpenAI or local LLM integration
* Export reports as PDF/CSV

## Author

Prithvi Raj Kaushik
