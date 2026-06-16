import api from './client'

export type AISummaryResponse = {
  summary: string
  highlights: string[]
  warnings: string[]
  recommendations: string[]
  metadata: {
    month: number
    year: number
    income: number
    expense: number
    balance: number
    savings_rate: number
    top_category: string | null
    top_category_amount: number
    expense_change_percent: number
  }
}

export type AIChatResponse = {
  answer: string
  intent: string
  metadata: Record<string, unknown>
}

export async function generateAISummary(month: number, year: number) {
  const response = await api.post<AISummaryResponse>('/ai/summary', {
    month,
    year,
  })

  return response.data
}

export async function sendChatMessage(message: string) {
  const response = await api.post<AIChatResponse>('/ai/chat', {
    message,
  })

  return response.data
}