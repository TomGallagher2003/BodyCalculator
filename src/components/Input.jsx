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

export function Slider({
  label,
  id,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  valueFormatter = (v) => v,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={id}
              className="text-sm font-medium text-[var(--text-secondary)]"
            >
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm font-bold text-[var(--accent)]">
              {valueFormatter(value)}
            </span>
          )}
        </div>
      )}
      <input
        id={id}
        type="range"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                   [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-[var(--accent)]
                   [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
      />
    </div>
  )
}
