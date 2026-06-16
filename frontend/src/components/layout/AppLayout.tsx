import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bot,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Target,
  Wallet,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Transactions',
    path: '/transactions',
    icon: CreditCard,
  },
  {
    name: 'Budgets',
    path: '/budgets',
    icon: Target,
  },
  {
    name: 'AI Insights',
    path: '/ai-insights',
    icon: BarChart3,
  },
  {
    name: 'Chatbot',
    path: '/chatbot',
    icon: Bot,
  },
]

function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        <aside className="hidden min-h-screen w-72 border-r border-slate-800 bg-slate-900/70 p-6 lg:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500">
              <Wallet className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold">FinSight AI</h1>
              <p className="text-xs text-slate-400">Smart finance tracker</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>
        </aside>

        <main className="min-h-screen flex-1">
          <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">
                  Welcome back, {user?.name || 'User'}
                </p>
                <h2 className="text-2xl font-semibold">
                  Personal Finance Dashboard
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 md:block">
                  {user?.email}
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-red-500 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </header>

          <section className="p-6">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  )
}

export default AppLayout