import axios from 'axios'
import { Brain, Lightbulb, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { generateAISummary, type AISummaryResponse } from '../api/ai'

const currentDate = new Date()

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function AIInsightsPage() {
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())
  const [summary, setSummary] = useState<AISummaryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateSummary = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await generateAISummary(month, year)
      setSummary(data)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to generate AI summary')
      } else {
        setError('Failed to generate AI summary')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500 p-3 text-slate-950">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Financial Summary</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Generate intelligent insights from your transactions and budget.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Month"
            />

            <input
              type="number"
              min={2000}
              max={2100}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Year"
            />

            <button
              onClick={handleGenerateSummary}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-5 w-5" />
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {!summary ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-emerald-400" />
          <h2 className="mt-4 text-xl font-semibold">
            Generate your first AI finance insight
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-slate-400">
            The AI engine will analyze your income, expenses, budget usage,
            spending categories, and savings rate to produce a financial summary.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-800 bg-emerald-950/30 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-emerald-500 p-3 text-slate-950">
                <Sparkles className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-emerald-300">
                  AI Generated Summary
                </h2>
                <p className="mt-3 leading-7 text-slate-200">
                  {summary.summary}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Income</p>
              <h3 className="mt-2 text-2xl font-bold text-emerald-400">
                {formatCurrency(summary.metadata.income)}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Expense</p>
              <h3 className="mt-2 text-2xl font-bold text-red-400">
                {formatCurrency(summary.metadata.expense)}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Balance</p>
              <h3 className="mt-2 text-2xl font-bold text-sky-400">
                {formatCurrency(summary.metadata.balance)}
              </h3>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Savings Rate</p>
              <h3 className="mt-2 text-2xl font-bold text-violet-400">
                {summary.metadata.savings_rate}%
              </h3>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-semibold">Highlights</h2>
              </div>

              <div className="mt-5 space-y-3">
                {summary.highlights.length === 0 ? (
                  <p className="text-sm text-slate-400">No highlights found.</p>
                ) : (
                  summary.highlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300"
                    >
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                <h2 className="text-lg font-semibold">Warnings</h2>
              </div>

              <div className="mt-5 space-y-3">
                {summary.warnings.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No major warnings detected.
                  </p>
                ) : (
                  summary.warnings.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-red-900 bg-red-950/30 p-4 text-sm text-red-200"
                    >
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-sky-400" />
                <h2 className="text-lg font-semibold">Recommendations</h2>
              </div>

              <div className="mt-5 space-y-3">
                {summary.recommendations.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No recommendations available.
                  </p>
                ) : (
                  summary.recommendations.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-sky-900 bg-sky-950/30 p-4 text-sm text-sky-200"
                    >
                      {item}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIInsightsPage