import { useEffect, useMemo, useRef, useState } from 'react'
import {
  RANGE_OPTIONS,
  filterSeriesByRange,
  calculateMovingAverage,
  calculateLinearRegression,
} from '../lib/weightTrends'
import { formatDate } from '../lib/progress'

const COLOR_RAW = '#71717a'
const COLOR_AVERAGE = 'var(--accent)'
const COLOR_TREND = 'var(--warning)'

const DEFAULT_WIDTH = 600
const PADDING = { top: 16, right: 16, bottom: 26, left: 44 }

function buildScales(series, width, height) {
  const chartWidth = width - PADDING.left - PADDING.right
  const chartHeight = height - PADDING.top - PADDING.bottom

  const dates = series.map((p) => new Date(p.date).getTime())
  const minDate = Math.min(...dates)
  const maxDate = Math.max(...dates)
  const dateRange = maxDate - minDate || 1

  const values = series.flatMap((p) => [p.value, p.average].filter((v) => v !== null && v !== undefined))
  const minValue = values.length ? Math.min(...values) : 0
  const maxValue = values.length ? Math.max(...values) : 1
  const pad = (maxValue - minValue) * 0.1 || 1
  const yMin = minValue - pad
  const yMax = maxValue + pad
  const valueRange = yMax - yMin || 1

  const x = (date) => PADDING.left + ((new Date(date).getTime() - minDate) / dateRange) * chartWidth
  const y = (value) => PADDING.top + chartHeight - ((value - yMin) / valueRange) * chartHeight

  return { x, y, chartWidth, chartHeight, yMin, yMax }
}

function useContainerWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(DEFAULT_WIDTH)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry && entry.contentRect.width > 0) setWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}

function RangeSelector({ range, onChange }) {
  return (
    <div className="inline-flex flex-wrap rounded-lg bg-[var(--bg-tertiary)] p-1 gap-1">
      {RANGE_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
            range === option.value
              ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-medium'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Legend({ hasTrend }) {
  const items = [
    { label: 'Actual', color: COLOR_RAW, dash: false },
    { label: '7-day average', color: COLOR_AVERAGE, dash: false },
  ]
  if (hasTrend) items.push({ label: 'Trend', color: COLOR_TREND, dash: true })

  return (
    <div className="flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <svg width="14" height="6" aria-hidden="true">
            <line
              x1="0"
              y1="3"
              x2="14"
              y2="3"
              stroke={item.color}
              strokeWidth="2"
              strokeDasharray={item.dash ? '3,2' : undefined}
            />
          </svg>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Weight trend chart: raw entries, 7-day moving average, and a linear
 * regression trendline, with a selectable date range relative to today.
 */
export function WeightTrendChart({ series, unit = 'kg', range, onRangeChange, height = 220 }) {
  const [containerRef, width] = useContainerWidth()
  const [hoverIndex, setHoverIndex] = useState(null)

  const filtered = useMemo(() => filterSeriesByRange(series, range), [series, range])
  const withAverage = useMemo(() => calculateMovingAverage(filtered, 7), [filtered])
  const regression = useMemo(() => calculateLinearRegression(filtered), [filtered])

  const hasData = withAverage.length > 0
  const scales = hasData ? buildScales(withAverage, width, height) : null

  const points = hasData
    ? withAverage.map((p) => ({ ...p, x: scales.x(p.date), y: scales.y(p.value) }))
    : []
  const averagePoints = hasData
    ? withAverage.filter((p) => p.average !== null).map((p) => ({ ...p, x: scales.x(p.date), y: scales.y(p.average) }))
    : []

  const rawPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const averagePath = averagePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const trendLine =
    regression && hasData
      ? {
          x1: scales.x(withAverage[0].date),
          y1: scales.y(regression.getValueAtDate(withAverage[0].date)),
          x2: scales.x(withAverage[withAverage.length - 1].date),
          y2: scales.y(regression.getValueAtDate(withAverage[withAverage.length - 1].date)),
        }
      : null

  const handlePointerMove = (event) => {
    if (!hasData || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const xValue = event.clientX - rect.left
    let closest = 0
    let closestDist = Infinity
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - xValue)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    })
    setHoverIndex(closest)
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <Legend hasTrend={!!trendLine} />
        <RangeSelector range={range} onChange={onRangeChange} />
      </div>

      {!hasData ? (
        <div
          className="flex items-center justify-center bg-[var(--bg-secondary)] rounded-lg"
          style={{ height }}
        >
          <span className="text-sm text-[var(--text-secondary)]">No data in this range</span>
        </div>
      ) : (
        <div ref={containerRef}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full touch-none block"
            style={{ height }}
            onMouseMove={handlePointerMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const value = scales.yMin + (scales.yMax - scales.yMin) * ratio
              const yPos = scales.y(value)
              return (
                <g key={ratio}>
                  <line
                    x1={PADDING.left}
                    y1={yPos}
                    x2={width - PADDING.right}
                    y2={yPos}
                    stroke="var(--bg-tertiary)"
                    strokeWidth="1"
                  />
                  <text
                    x={PADDING.left - 6}
                    y={yPos}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="var(--text-secondary)"
                    fontSize="10"
                  >
                    {value.toFixed(1)}
                  </text>
                </g>
              )
            })}

            {/* Trend line (line of best fit) */}
            {trendLine && (
              <line
                x1={trendLine.x1}
                y1={trendLine.y1}
                x2={trendLine.x2}
                y2={trendLine.y2}
                stroke={COLOR_TREND}
                strokeWidth="2"
                strokeDasharray="5,4"
                strokeLinecap="round"
              />
            )}

            {/* Raw data line + points */}
            <path d={rawPath} fill="none" stroke={COLOR_RAW} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
            {points.map((p, i) => (
              <circle key={`raw-${i}`} cx={p.x} cy={p.y} r="2.5" fill={COLOR_RAW} opacity="0.8" />
            ))}

            {/* 7-day moving average line */}
            <path
              d={averagePath}
              fill="none"
              stroke={COLOR_AVERAGE}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hover crosshair */}
            {hovered && (
              <g>
                <line
                  x1={hovered.x}
                  y1={PADDING.top}
                  x2={hovered.x}
                  y2={height - PADDING.bottom}
                  stroke="var(--text-secondary)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <circle cx={hovered.x} cy={hovered.y} r="3.5" fill="var(--text-primary)" />
              </g>
            )}

            {/* X-axis labels (first and last) */}
            <text x={PADDING.left} y={height - 6} textAnchor="start" fill="var(--text-secondary)" fontSize="10">
              {formatDate(withAverage[0].date, 'short')}
            </text>
            {withAverage.length > 1 && (
              <text
                x={width - PADDING.right}
                y={height - 6}
                textAnchor="end"
                fill="var(--text-secondary)"
                fontSize="10"
              >
                {formatDate(withAverage[withAverage.length - 1].date, 'short')}
              </text>
            )}
          </svg>
        </div>
      )}

      {hovered && (
        <div className="mt-2 text-xs text-[var(--text-secondary)] flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-[var(--text-primary)] font-medium">{formatDate(hovered.date, 'medium')}</span>
          <span>Actual: {hovered.value.toFixed(1)} {unit}</span>
          {hovered.average !== null && (
            <span>7-day avg: {hovered.average.toFixed(1)} {unit}</span>
          )}
        </div>
      )}

      {regression && (
        <div className="mt-3 text-sm text-[var(--text-secondary)]">
          Trend:{' '}
          <span
            className={`font-medium ${
              regression.weeklyRate > 0
                ? 'text-[var(--warning)]'
                : regression.weeklyRate < 0
                  ? 'text-[var(--success)]'
                  : 'text-[var(--text-primary)]'
            }`}
          >
            {regression.weeklyRate > 0 ? '+' : ''}
            {regression.weeklyRate} {unit}/week
          </span>
        </div>
      )}
    </div>
  )
}
