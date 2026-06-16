import axios from 'axios'
import type { SyntheticEvent } from 'react'
import { useEffect, useState } from 'react'
import { createBudget, getBudgetStatus, type BudgetStatus } from '../api/budgets'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const currentDate = new Date()

function BudgetsPage() {
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())
  const [totalBudget, setTotalBudget] = useState('30000')

  const [foodLimit, setFoodLimit] = useState('8000')
  const [travelLimit, setTravelLimit] = useState('6000')
  const [shoppingLimit, setShoppingLimit] = useState('5000')
  const [otherLimit, setOtherLimit] = useState('5000')

  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadBudgetStatus = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getBudgetStatus(month, year)
      setBudgetStatus(data)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to load budget status')
      } else {
        setError('Failed to load budget status')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBudgetStatus()
  }, [])

  const handleCreateBudget = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await createBudget({
        month,
        year,
        total_budget: Number(totalBudget),
        categories: [
          {
            category: 'Food',
            limit_amount: Number(foodLimit),
          },
          {
            category: 'Travel',
            limit_amount: Number(travelLimit),
          },
          {
            category: 'Shopping',
            limit_amount: Number(shoppingLimit),
          },
          {
            category: 'Other',
            limit_amount: Number(otherLimit),
          },
        ],
      })

      setSuccess('Budget created successfully.')
      await loadBudgetStatus()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to create budget')
      } else {
        setError('Failed to create budget')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold">Create Monthly Budget</h1>
          <p className="mt-2 text-sm text-slate-400">
            Set your total monthly budget and category-wise limits.
          </p>

          <form onSubmit={handleCreateBudget} className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300">Month</label>
                <input
                  type="number"
                  value={month}
                  onChange={(event) => setMonth(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  min={1}
                  max={12}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  min={2000}
                  max={2100}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300">Total Budget</label>
              <input
                type="number"
                value={totalBudget}
                onChange={(event) => setTotalBudget(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                min={1}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300">Food Limit</label>
                <input
                  type="number"
                  value={foodLimit}
                  onChange={(event) => setFoodLimit(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  min={1}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Travel Limit</label>
                <input
                  type="number"
                  value={travelLimit}
                  onChange={(event) => setTravelLimit(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  min={1}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Shopping Limit</label>
                <input
                  type="number"
                  value={shoppingLimit}
                  onChange={(event) => setShoppingLimit(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  min={1}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Other Limit</label>
                <input
                  type="number"
                  value={otherLimit}
                  onChange={(event) => setOtherLimit(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                  min={1}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating Budget...' : 'Create Budget'}
            </button>

            <button
              type="button"
              onClick={loadBudgetStatus}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300 hover:border-emerald-500 hover:text-emerald-300 disabled:opacity-60"
            >
              {loading ? 'Checking...' : 'Check Budget Status'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold">Budget Status</h1>
          <p className="mt-2 text-sm text-slate-400">
            Track your actual spending against your planned budget.
          </p>

          {!budgetStatus || !budgetStatus.budget_exists ? (
            <div className="mt-6 rounded-xl border border-yellow-800 bg-yellow-950/30 p-5 text-yellow-200">
              No budget found for this selected month. Create one using the form.
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div className="grid gap-5 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <p className="text-sm text-slate-400">Total Budget</p>
                  <h3 className="mt-2 text-2xl font-bold text-sky-400">
                    {formatCurrency(budgetStatus.total_budget || 0)}
                  </h3>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <p className="text-sm text-slate-400">Total Spent</p>
                  <h3 className="mt-2 text-2xl font-bold text-red-400">
                    {formatCurrency(budgetStatus.total_spent || 0)}
                  </h3>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <p className="text-sm text-slate-400">Remaining</p>
                  <h3 className="mt-2 text-2xl font-bold text-emerald-400">
                    {formatCurrency(budgetStatus.total_remaining || 0)}
                  </h3>
                </div>
              </div>

              <div
                className={`rounded-xl border p-5 ${
                  budgetStatus.status === 'over_budget'
                    ? 'border-red-800 bg-red-950/30 text-red-300'
                    : 'border-emerald-800 bg-emerald-950/30 text-emerald-300'
                }`}
              >
                Overall budget usage: {budgetStatus.usage_percent || 0}%
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Category Breakdown</h2>

                {budgetStatus.category_status?.map((item) => (
                  <div
                    key={item.category}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{item.category}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Spent {formatCurrency(item.spent)} of{' '}
                          {formatCurrency(item.limit_amount)}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === 'over_budget'
                            ? 'bg-red-950 text-red-300'
                            : 'bg-emerald-950 text-emerald-300'
                        }`}
                      >
                        {item.usage_percent}%
                      </span>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full ${
                          item.status === 'over_budget'
                            ? 'bg-red-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(item.usage_percent, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BudgetsPage