export function ResultDisplay({ label, value, unit, size = 'md', color = 'accent' }) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  const colors = {
    accent: 'text-[var(--accent)]',
    success: 'text-[var(--success)]',
    warning: 'text-[var(--warning)]',
    error: 'text-[var(--error)]',
    primary: 'text-[var(--text-primary)]',
  }

  return (
    <div className="flex flex-col">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`font-bold ${sizes[size]} ${colors[color]}`}>
          {value}
        </span>
        {unit && (
          <span className="text-sm text-[var(--text-secondary)]">{unit}</span>
        )}
      </div>
    </div>
  )
}

export function ResultCard({ children, className = '' }) {
  return (
    <div className={`bg-[var(--bg-tertiary)] rounded-lg p-4 ${className}`}>
      {children}
    </div>
  )
}

export function ResultGrid({ children, className = '' }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {children}
    </div>
  )
}

export function MacroBar({ label, value, percentage, color = 'accent' }) {
  const colors = {
    accent: 'bg-[var(--accent)]',
    success: 'bg-[var(--success)]',
    warning: 'bg-[var(--warning)]',
    error: 'bg-[var(--error)]',
    protein: 'bg-blue-500',
    carbs: 'bg-green-500',
    fat: 'bg-yellow-500',
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="text-[var(--text-primary)] font-medium">{value}g</span>
      </div>
      <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className="text-xs text-[var(--text-secondary)]">{percentage}%</span>
    </div>
  )
}
