export function Card({ children, className = '' }) {
  return (
    <div className={`bg-[var(--bg-secondary)] rounded-xl p-6 ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h2 className={`text-xl font-semibold text-[var(--text-primary)] ${className}`}>
      {children}
    </h2>
  )
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-[var(--text-secondary)] mt-1 ${className}`}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
