import { Calculator, Utensils, Activity, Target } from 'lucide-react'

const navItems = [
  { id: 'tdee', label: 'TDEE', icon: Calculator },
  { id: 'macros', label: 'Macros', icon: Utensils },
  { id: 'bodyfat', label: 'Body Fat', icon: Activity },
  { id: 'fatloss', label: 'Fat Loss', icon: Target },
]

export function MobileNav({ currentPage, onNavigate }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--bg-tertiary)] z-50">
      <ul className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <li key={item.id} className="flex-1">
              <button
                onClick={() => onNavigate(item.id)}
                className={`
                  w-full flex flex-col items-center gap-1 py-3 transition-colors
                  ${isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-secondary)]'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function MobileHeader({ title }) {
  return (
    <header className="md:hidden sticky top-0 bg-[var(--bg-secondary)] border-b border-[var(--bg-tertiary)] p-4 z-40">
      <h1 className="text-lg font-bold text-center">{title}</h1>
    </header>
  )
}
