import { Calculator, Utensils, Activity, Dumbbell, Target, TrendingUp } from 'lucide-react'

const navItems = [
  { id: 'tdee', label: 'TDEE Calculator', icon: Calculator },
  { id: 'macros', label: 'Macro Splitter', icon: Utensils },
  { id: 'bodyfat', label: 'Body Fat', icon: Activity },
  { id: 'fatloss', label: 'Fat Loss Required', icon: Target },
  { id: 'progress', label: 'Progress Tracker', icon: TrendingUp },
]

export function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-[var(--bg-secondary)] border-r border-[var(--bg-tertiary)] h-screen sticky top-0">
      <div className="p-4 border-b border-[var(--bg-tertiary)]">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-[var(--accent)]" />
          <span className="font-bold text-lg">BodyCalc</span>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-[var(--bg-tertiary)]">
        <p className="text-xs text-[var(--text-secondary)]">
          Built with React + Tailwind
        </p>
      </div>
    </aside>
  )
}
