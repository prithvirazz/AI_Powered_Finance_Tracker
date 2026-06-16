import axios from 'axios'
import type { SyntheticEvent } from 'react'
import { useState } from 'react'
import { Bot, Send, Sparkles, User } from 'lucide-react'
import { sendChatMessage } from '../api/ai'

type ChatMessage = {
  id: number
  role: 'user' | 'assistant'
  content: string
  intent?: string
}

const suggestedQuestions = [
  'How much did I spend this month?',
  'What is my highest expense category?',
  'How much did I spend on food this month?',
  'Summarize my spending trends.',
  'How can I optimize my monthly budget?',
]

function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        "Hi, I am your FinSight AI assistant. Ask me about your income, expenses, budget, spending categories, or savings.",
      intent: 'welcome',
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendMessage = async (
    event?: SyntheticEvent<HTMLFormElement>,
    customMessage?: string,
  ) => {
    if (event) {
      event.preventDefault()
    }

    const messageToSend = customMessage || input.trim()

    if (!messageToSend) {
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: messageToSend,
    }

    setMessages((previous) => [...previous, userMessage])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const response = await sendChatMessage(messageToSend)

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.answer,
        intent: response.intent,
      }

      setMessages((previous) => [...previous, assistantMessage])
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Failed to get chatbot response')
      } else {
        setError('Failed to get chatbot response')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500 p-3 text-slate-950">
              <Bot className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">AI Chatbot Assistant</h1>
              <p className="mt-1 text-sm text-slate-400">
                Ask finance-related questions based on your transactions.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 rounded-xl border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="h-[560px] space-y-5 overflow-y-auto p-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-slate-950">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-5 py-4 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'border border-slate-800 bg-slate-950 text-slate-200'
                }`}
              >
                <p>{message.content}</p>

                {message.intent && message.role === 'assistant' && (
                  <p className="mt-2 text-xs text-slate-500">
                    Intent: {message.intent}
                  </p>
                )}
              </div>

              {message.role === 'user' && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-slate-950">
                <Bot className="h-5 w-5" />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4 text-sm text-slate-400">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(event) => handleSendMessage(event)}
          className="border-t border-slate-800 p-6"
        >
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
              placeholder="Ask: How much did I spend on food this month?"
            />

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-5 w-5" />
              Send
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold">Suggested Questions</h2>
        </div>

        <div className="mt-5 space-y-3">
          {suggestedQuestions.map((question) => (
            <button
              key={question}
              onClick={() => handleSendMessage(undefined, question)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-left text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300 disabled:opacity-60"
            >
              {question}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-sky-900 bg-sky-950/30 p-4 text-sm leading-6 text-sky-200">
          This chatbot uses a rule-based AI workflow over your actual transaction
          and budget data, so it works without external API keys.
        </div>
      </div>
    </div>
  )
}

export default ChatbotPage