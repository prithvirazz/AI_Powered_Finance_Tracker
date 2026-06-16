import axios from 'axios'
import type { SyntheticEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  type Transaction,
  type TransactionType,
} from '../api/transactions'

function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [transactionDate, setTransactionDate] = useState(getTodayDate())

  const [filterType, setFilterType] = useState<TransactionType | ''>('')
  const [filterCategory, setFilterCategory] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totals = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    const expense = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    return {
      income,
      expense,
      balance: income - expense,
    }
  }, [transactions])

  const loadTransactions = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getTransactions({
        transaction_type: filterType,
        category: filterCategory,
        search,
        date_from: dateFrom,
        date_to: dateTo,
      })

      setTransactions(data)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to load transactions')
      } else {
        setError('Failed to load transactions')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const handleCreateTransaction = async (
    event: SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (!category.trim()) {
      setError('Please enter a category')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await createTransaction({
        type,
        amount: Number(amount),
        category: category.trim(),
        description: description.trim() || undefined,
        transaction_date: transactionDate,
      })

      setAmount('')
      setCategory('')
      setDescription('')
      setTransactionDate(getTodayDate())
      setType('expense')

      await loadTransactions()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to create transaction')
      } else {
        setError('Failed to create transaction')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTransaction = async (transactionId: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this transaction?',
    )

    if (!confirmed) {
      return
    }

    setError('')

    try {
      await deleteTransaction(transactionId)
      await loadTransactions()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to delete transaction')
      } else {
        setError('Failed to delete transaction')
      }
    }
  }

  const handleClearFilters = async () => {
    setFilterType('')
    setFilterCategory('')
    setSearch('')
    setDateFrom('')
    setDateTo('')

    setLoading(true)
    setError('')

    try {
      const data = await getTransactions()
      setTransactions(data)
    } catch {
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Filtered Income</p>
          <h3 className="mt-2 text-3xl font-bold text-emerald-400">
            {formatCurrency(totals.income)}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Filtered Expenses</p>
          <h3 className="mt-2 text-3xl font-bold text-red-400">
            {formatCurrency(totals.expense)}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Filtered Balance</p>
          <h3 className="mt-2 text-3xl font-bold text-sky-400">
            {formatCurrency(totals.balance)}
          </h3>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-bold">Add Transaction</h1>
          <p className="mt-2 text-sm text-slate-400">
            Record income and expenses in your finance tracker.
          </p>

          <form onSubmit={handleCreateTransaction} className="mt-6 space-y-5">
            <div>
              <label className="text-sm text-slate-300">Type</label>
              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as TransactionType)
                }
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-300">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder="850"
                min="1"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Category</label>
              <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder="Food, Salary, Travel, Rent"
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-2 min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                placeholder="Lunch at restaurant"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Date</label>
              <input
                type="date"
                value={transactionDate}
                onChange={(event) => setTransactionDate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-5 w-5" />
              {submitting ? 'Adding...' : 'Add Transaction'}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Transaction History</h1>
              <p className="mt-2 text-sm text-slate-400">
                Search, filter, and manage your income and expenses.
              </p>
            </div>

            <button
              onClick={loadTransactions}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-emerald-500 hover:text-emerald-300 disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <select
              value={filterType}
              onChange={(event) =>
                setFilterType(event.target.value as TransactionType | '')
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="">All Types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <input
              type="text"
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              placeholder="Category"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              placeholder="Search description"
            />

            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={loadTransactions}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              <Search className="h-4 w-4" />
              Apply Filters
            </button>

            <button
              onClick={handleClearFilters}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500"
            >
              Clear Filters
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-400"
                      >
                        Loading transactions...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-400"
                      >
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="bg-slate-900 hover:bg-slate-800/70"
                      >
                        <td className="px-4 py-4 text-slate-300">
                          {transaction.transaction_date}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              transaction.type === 'income'
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-red-950 text-red-300'
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-slate-200">
                          {transaction.category}
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {transaction.description || '-'}
                        </td>

                        <td
                          className={`px-4 py-4 text-right font-semibold ${
                            transaction.type === 'income'
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </td>

                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() =>
                              handleDeleteTransaction(transaction.id)
                            }
                            className="inline-flex items-center justify-center rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-red-500 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionsPage