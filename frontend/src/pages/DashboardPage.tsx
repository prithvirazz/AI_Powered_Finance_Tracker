import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getCategoryBreakdown,
  getDashboardSummary,
  getMonthlyTrend,
  type CategoryBreakdownItem,
  type DashboardSummary,
  type MonthlyTrendItem,
} from '../api/dashboard'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [categoryData, setCategoryData] = useState<CategoryBreakdownItem[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyTrendItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')

    try {
      const [summaryData, categoryBreakdownData, monthlyTrendData] =
        await Promise.all([
          getDashboardSummary(),
          getCategoryBreakdown(),
          getMonthlyTrend(),
        ])

      setSummary(summaryData)
      setCategoryData(categoryBreakdownData)
      setMonthlyData(monthlyTrendData)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to load dashboard')
      } else {
        setError('Failed to load dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-300">
        Loading dashboard analytics...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-800 bg-red-950/40 p-8 text-red-300">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">This Month Income</p>
          <h3 className="mt-2 text-3xl font-bold text-emerald-400">
            {formatCurrency(summary?.total_income || 0)}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {summary?.income_change_percent || 0}% from last month
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">This Month Expenses</p>
          <h3 className="mt-2 text-3xl font-bold text-red-400">
            {formatCurrency(summary?.total_expense || 0)}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {summary?.expense_change_percent || 0}% from last month
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Current Balance</p>
          <h3 className="mt-2 text-3xl font-bold text-sky-400">
            {formatCurrency(summary?.balance || 0)}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Savings rate: {summary?.savings_rate || 0}%
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-5 text-lg font-semibold">
            Monthly Income vs Expense
          </h3>

          {monthlyData.length === 0 ? (
            <p className="text-slate-400">No monthly data available yet.</p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="income" strokeWidth={3} />
                  <Line type="monotone" dataKey="expense" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-5 text-lg font-semibold">
            Category-wise Expense Breakdown
          </h3>

          {categoryData.length === 0 ? (
            <p className="text-slate-400">
              No expense category data available for this month.
            </p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-800 bg-emerald-950/30 p-5">
        <h3 className="text-lg font-semibold text-emerald-300">
          Smart Dashboard Insight
        </h3>
        <p className="mt-3 text-slate-300">
          Your current balance is {formatCurrency(summary?.balance || 0)} with a
          savings rate of {summary?.savings_rate || 0}%. The category chart helps
          identify where most of your monthly spending is concentrated.
        </p>
      </div>
    </div>
  )
}

export default DashboardPage