# FinSight AI — Technical Report

## Prithvi Raj Kaushik
## MTech Medical Device Innovation - MI24MTEH14005

## 1. Project Overview

FinSight AI is a full-stack AI-powered finance and expense tracking platform designed to help users manage personal transactions, monitor spending behavior, plan budgets, and generate intelligent financial insights.

The application includes secure authentication, income and expense tracking, financial analytics dashboards, budget management workflows, an AI-generated financial summary engine, and an AI chatbot assistant for finance-related queries.

## 2. Objective

The main objective of the project is to build a scalable and user-friendly finance platform that allows users to:

* Track income and expenses
* View financial analytics
* Set monthly and category-wise budgets
* Understand spending patterns
* Receive intelligent financial recommendations
* Ask natural finance-related questions through a chatbot

## 3. Technology Stack

### Frontend

The frontend is built using React, TypeScript, Vite, Tailwind CSS, React Router DOM, Axios, Recharts, and Lucide React.

React was chosen for reusable component-based development. TypeScript improves maintainability and reduces runtime errors. Tailwind CSS enables fast and consistent UI development. Recharts is used for dashboard visualizations.

### Backend

The backend is built using Python FastAPI, SQLAlchemy, Pydantic, JWT authentication, Passlib, and bcrypt.

FastAPI was selected because it provides high performance, automatic Swagger documentation, strong validation through Pydantic, and clean API development patterns.

### Database

SQLite is used for local development. The backend architecture is designed so that SQLite can be replaced with PostgreSQL for production deployment by changing the database URL.

## 4. System Architecture

The platform follows a client-server architecture.

```txt
React Frontend
     |
     | Axios HTTP Requests
     |
FastAPI Backend
     |
     | SQLAlchemy ORM
     |
SQLite Database
```

The frontend communicates with the backend through REST APIs. The backend handles authentication, business logic, validation, and database operations. The database stores users, transactions, budgets, budget categories, and AI insight records.

## 5. Database Schema Explanation

### Users Table

Stores user account information.

Important fields:

* id
* name
* email
* password_hash
* role
* created_at

The password is not stored directly. It is hashed before saving.

### Transactions Table

Stores both income and expense records.

Important fields:

* id
* user_id
* type
* amount
* category
* description
* transaction_date
* created_at

Each transaction belongs to a user. The type field identifies whether the transaction is income or expense.

### Budgets Table

Stores monthly budget data.

Important fields:

* id
* user_id
* month
* year
* total_budget
* created_at

Each user can create a monthly budget for a specific month and year.

### Budget Categories Table

Stores category-wise budget limits.

Important fields:

* id
* budget_id
* category
* limit_amount

This enables category-level spending analysis.

### AI Insights Table

Stores generated AI summary records.

Important fields:

* id
* user_id
* month
* year
* summary_text
* created_at

This table can be used later for insight history and analytics.

## 6. API Structure

### Authentication APIs

* `POST /auth/signup`
* `POST /auth/login`
* `POST /auth/token`
* `GET /auth/me`

Authentication uses JWT tokens. Passwords are hashed using bcrypt.

### Transaction APIs

* `POST /transactions`
* `GET /transactions`
* `GET /transactions/{transaction_id}`
* `PUT /transactions/{transaction_id}`
* `DELETE /transactions/{transaction_id}`

These APIs allow users to create, read, update, delete, search, and filter transactions.

### Dashboard APIs

* `GET /dashboard/summary`
* `GET /dashboard/category-breakdown`
* `GET /dashboard/monthly-trend`

These APIs power the dashboard cards and visualizations.

### Budget APIs

* `POST /budgets`
* `GET /budgets/current`
* `PUT /budgets/{budget_id}`
* `GET /budgets/status`

These APIs allow users to create monthly budgets and compare actual expenses with planned limits.

### AI APIs

* `POST /ai/summary`
* `POST /ai/chat`

These APIs generate financial summaries and chatbot answers based on transaction and budget data.

## 7. AI Integration Explanation

The AI layer is implemented as a rule-based financial intelligence system.

The summary generator analyzes:

* Monthly income
* Monthly expenses
* Balance
* Savings rate
* Highest spending category
* Expense change compared to previous month
* Budget usage
* Budget risks

The chatbot interprets common finance queries and responds using actual user data. It supports questions such as:

* How much did I spend this month?
* What is my highest expense category?
* How much did I spend on food?
* Summarize my spending trends.
* How can I optimize my budget?

This design avoids dependency on paid external APIs while still demonstrating AI-driven insight generation. In future versions, this module can be upgraded to use OpenAI APIs, local LLMs, or retrieval-augmented generation.

## 8. Product Decisions and Tradeoffs

### SQLite for Development

SQLite was selected to keep local setup simple. The backend uses SQLAlchemy, so switching to PostgreSQL in production is straightforward.

### Rule-Based AI

A rule-based AI system was selected to ensure reliable demo behavior without external API dependency or quota issues. This improves assessment stability.

### JWT Authentication

JWT authentication was used because it is lightweight, scalable, and suitable for REST API applications.

### Modular Backend Structure

The backend is divided into API routes, models, schemas, services, core config, and database modules. This improves maintainability and scalability.

### Component-Based Frontend

The frontend uses reusable pages, API modules, layout components, and context providers. This keeps the UI clean and easy to extend.

## 9. Challenges Faced

Some challenges during development included:

* Handling protected frontend routes
* Managing JWT storage and authorization headers
* Fixing Swagger authorization for protected APIs
* Designing clean transaction filters
* Keeping dashboard data dynamic instead of static
* Implementing AI-like behavior without external API dependency
* Maintaining consistent UI across pages

## 10. Security Considerations

Security measures implemented:

* Password hashing
* JWT-based route protection
* User-specific data filtering
* Input validation using Pydantic
* CORS configuration
* Protected frontend dashboard routes

Future improvements can include refresh tokens, rate limiting, audit logs, and stricter production CORS rules.

## 11. Scalability Considerations

The project can be scaled further by:

* Migrating from SQLite to PostgreSQL
* Adding Alembic database migrations
* Adding Redis caching
* Adding Docker containers
* Deploying backend on Render, Railway, or AWS
* Deploying frontend on Vercel or Netlify
* Adding background jobs for monthly reports
* Adding LLM-based advanced financial assistant
* Adding multi-user collaboration

## 12. Future Scope

Future improvements include:

* AI-powered transaction categorization
* CSV bank statement import
* PDF monthly report generation
* Real-time budget alerts
* Email notifications
* Recurring transactions
* Family/shared finance workspace
* Admin analytics dashboard
* Mobile app support
* Production-grade PostgreSQL deployment

## 13. Conclusion

FinSight AI demonstrates a complete full-stack finance product with authentication, transaction management, analytics dashboards, budget workflows, AI-generated insights, and chatbot interaction.

The project focuses on clean architecture, modular code, product thinking, secure API design, and scalable development practices.
