import api from './client'

export type DashboardSummary = {
  total_income: number
  total_expense: number
  balance: number
  income_change_percent: number
  expense_change_percent: number
  savings_rate: number
}

export type CategoryBreakdownItem = {
  category: string
  amount: number
}

export type MonthlyTrendItem = {
  month: string
  income: number
  expense: number
}

export async function getDashboardSummary() {
  const response = await api.get<DashboardSummary>('/dashboard/summary')
  return response.data
}

export async function getCategoryBreakdown() {
  const response = await api.get<CategoryBreakdownItem[]>(
    '/dashboard/category-breakdown',
  )

  return response.data
}

export async function getMonthlyTrend() {
  const response = await api.get<MonthlyTrendItem[]>('/dashboard/monthly-trend')
  return response.data
}