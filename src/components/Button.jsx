export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] font-medium',
    secondary: 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--bg-tertiary)]',
    ghost: 'bg-transparent hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
    danger: 'bg-[var(--error)] hover:bg-red-600 text-white font-medium',
    success: 'bg-[var(--success)] hover:bg-green-600 text-white font-medium',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

export function ButtonGroup({ children, className = '' }) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {children}
    </div>
  )
}

export function ToggleButton({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex rounded-lg bg-[var(--bg-tertiary)] p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-3 py-1.5 text-sm rounded-md transition-colors
            ${value === option.value
              ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-medium'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
