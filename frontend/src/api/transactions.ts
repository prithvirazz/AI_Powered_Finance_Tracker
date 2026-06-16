import api from './client'

export type TransactionType = 'income' | 'expense'

export type Transaction = {
  id: number
  user_id: number
  type: TransactionType
  amount: number
  category: string
  description: string | null
  transaction_date: string
  created_at: string
}

export type TransactionCreatePayload = {
  type: TransactionType
  amount: number
  category: string
  description?: string
  transaction_date: string
}

export type TransactionFilters = {
  transaction_type?: TransactionType | ''
  category?: string
  search?: string
  date_from?: string
  date_to?: string
}

export async function getTransactions(filters: TransactionFilters = {}) {
  const params: Record<string, string> = {}

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params[key] = value
    }
  })

  const response = await api.get<Transaction[]>('/transactions', {
    params,
  })

  return response.data
}

export async function createTransaction(payload: TransactionCreatePayload) {
  const response = await api.post<Transaction>('/transactions', payload)
  return response.data
}

export async function deleteTransaction(transactionId: number) {
  const response = await api.delete<{ message: string }>(
    `/transactions/${transactionId}`,
  )

  return response.data
}