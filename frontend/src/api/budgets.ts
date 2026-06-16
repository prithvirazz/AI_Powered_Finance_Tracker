import api from './client'

export type BudgetCategoryPayload = {
  category: string
  limit_amount: number
}

export type BudgetPayload = {
  month: number
  year: number
  total_budget: number
  categories: BudgetCategoryPayload[]
}

export type BudgetCategoryResponse = {
  id: number
  category: string
  limit_amount: number
}

export type Budget = {
  id: number
  user_id: number
  month: number
  year: number
  total_budget: number
  created_at: string
  categories: BudgetCategoryResponse[]
}

export type CategoryStatus = {
  category: string
  limit_amount: number
  spent: number
  remaining: number
  usage_percent: number
  status: 'within_budget' | 'over_budget'
}

export type BudgetStatus = {
  budget_exists: boolean
  message?: string
  month?: number
  year?: number
  total_budget?: number
  total_spent?: number
  total_remaining?: number
  usage_percent?: number
  status?: 'within_budget' | 'over_budget'
  category_status?: CategoryStatus[]
}

export async function createBudget(payload: BudgetPayload) {
  const response = await api.post<Budget>('/budgets', payload)
  return response.data
}

export async function getBudgetStatus(month: number, year: number) {
  const response = await api.get<BudgetStatus>('/budgets/status', {
    params: {
      month,
      year,
    },
  })

  return response.data
}