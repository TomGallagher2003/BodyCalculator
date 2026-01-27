export function Input({
  label,
  id,
  type = 'number',
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg
                   text-[var(--text-primary)] placeholder-[var(--text-secondary)]
                   focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]
                   transition-colors"
        {...props}
      />
    </div>
  )
}

export function InputGroup({ children, className = '' }) {
  return (
    <div className={`flex gap-2 items-end ${className}`}>
      {children}
    </div>
  )
}
