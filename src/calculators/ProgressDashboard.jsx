import { useState, useMemo, useRef } from 'react'
import { Download, Upload, Trash2, TrendingUp, TrendingDown, Minus, Calendar, Scale, Percent, Flame } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  ResultCard,
} from '../components'
import {
  getProgressEntries,
  getEntriesByType,
  getChartData,
  getProgressStats,
  exportProgressData,
  importProgressData,
  deleteProgressEntry,
  clearAllProgress,
  formatDate,
  ENTRY_TYPES,
} from '../lib/progress'

const METRIC_CONFIG = {
  [ENTRY_TYPES.WEIGHT]: {
    label: 'Weight',
    icon: Scale,
    metric: 'weight',
    unit: 'lbs',
    color: 'var(--accent)',
  },
  [ENTRY_TYPES.BODY_FAT]: {
    label: 'Body Fat',
    icon: Percent,
    metric: 'bodyFat',
    unit: '%',
    color: 'var(--warning)',
  },
  [ENTRY_TYPES.TDEE]: {
    label: 'TDEE',
    icon: Flame,
    metric: 'tdee',
    unit: 'cal',
    color: 'var(--success)',
  },
}

function SimpleLineChart({ data, color, height = 150 }) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-[var(--bg-secondary)] rounded-lg"
        style={{ height }}
      >
        <span className="text-sm text-[var(--text-secondary)]">No data to display</span>
      </div>
    )
  }

  const padding = { top: 20, right: 20, bottom: 30, left: 50 }
  const width = 100
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const values = data.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const valueRange = maxValue - minValue || 1

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth
    const y = padding.top + chartHeight - ((d.value - minValue) / valueRange) * chartHeight
    return { x, y, ...d }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = padding.top + chartHeight * (1 - ratio)
        const value = minValue + valueRange * ratio
        return (
          <g key={ratio}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="var(--bg-tertiary)"
              strokeWidth="0.5"
            />
            <text
              x={padding.left - 5}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fill="var(--text-secondary)"
              fontSize="3"
            >
              {Math.round(value)}
            </text>
          </g>
        )
      })}

      {/* Line path */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} />
      ))}

      {/* X-axis labels (first and last) */}
      {data.length > 0 && (
        <>
          <text
            x={padding.left}
            y={height - 5}
            textAnchor="start"
            fill="var(--text-secondary)"
            fontSize="2.5"
          >
            {formatDate(data[0].date, 'short')}
          </text>
          {data.length > 1 && (
            <text
              x={width - padding.right}
              y={height - 5}
              textAnchor="end"
              fill="var(--text-secondary)"
              fontSize="2.5"
            >
              {formatDate(data[data.length - 1].date, 'short')}
            </text>
          )}
        </>
      )}
    </svg>
  )
}

function StatCard({ label, value, unit, change, icon: Icon }) {
  const getTrendIcon = () => {
    if (change === null || change === 0) return <Minus className="w-4 h-4 text-[var(--text-secondary)]" />
    if (change > 0) return <TrendingUp className="w-4 h-4 text-[var(--success)]" />
    return <TrendingDown className="w-4 h-4 text-[var(--error)]" />
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-[var(--accent)]" />}
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[var(--text-primary)]">
          {value !== null ? value : '--'}
        </span>
        {unit && <span className="text-sm text-[var(--text-secondary)]">{unit}</span>}
      </div>
      {change !== null && (
        <div className="flex items-center gap-1 mt-1">
          {getTrendIcon()}
          <span
            className={`text-xs ${change > 0 ? 'text-[var(--success)]' : change < 0 ? 'text-[var(--error)]' : 'text-[var(--text-secondary)]'}`}
          >
            {change > 0 ? '+' : ''}
            {change} {unit}
          </span>
        </div>
      )}
    </div>
  )
}

function EntryList({ entries, onDelete }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No entries yet</p>
        <p className="text-sm">Save progress from calculators to see it here</p>
      </div>
    )
  }

  const getEntryIcon = (type) => {
    const config = METRIC_CONFIG[type]
    return config ? config.icon : Scale
  }

  const getEntryLabel = (entry) => {
    switch (entry.type) {
      case ENTRY_TYPES.WEIGHT:
        return `${entry.data.weight} ${entry.data.unit || 'lbs'}`
      case ENTRY_TYPES.BODY_FAT:
        return `${entry.data.bodyFat}%`
      case ENTRY_TYPES.TDEE:
        return `${entry.data.tdee} cal`
      case ENTRY_TYPES.MACROS:
        return `P: ${entry.data.protein}g / C: ${entry.data.carbs}g / F: ${entry.data.fat}g`
      default:
        return 'Entry'
    }
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {entries.slice(0, 20).map((entry) => {
        const Icon = getEntryIcon(entry.type)
        return (
          <div
            key={entry.id}
            className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg group"
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-[var(--accent)]" />
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">
                  {getEntryLabel(entry)}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {formatDate(entry.date, 'medium')}
                </div>
              </div>
            </div>
            <button
              onClick={() => onDelete(entry.id)}
              className="p-1 opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-[var(--error)] transition-all"
              aria-label="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function ProgressDashboard() {
  const [activeType, setActiveType] = useState(ENTRY_TYPES.WEIGHT)
  const [refreshKey, setRefreshKey] = useState(0)
  const fileInputRef = useRef(null)

  // refreshKey is used to trigger re-fetch from localStorage after mutations
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const entries = useMemo(() => getProgressEntries(), [refreshKey])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const typeEntries = useMemo(() => getEntriesByType(activeType), [activeType, refreshKey])
  const config = METRIC_CONFIG[activeType]
  const chartData = useMemo(
    () => (config ? getChartData(activeType, config.metric, 30) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeType, config, refreshKey]
  )
  const stats = useMemo(
    () => (config ? getProgressStats(activeType, config.metric) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeType, config, refreshKey]
  )

  const handleExport = () => {
    const data = exportProgressData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bodycalc-progress-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = importProgressData(e.target.result, true)
      if (result.success) {
        setRefreshKey((k) => k + 1)
        alert(`Imported ${result.imported} entries successfully!`)
      } else {
        alert(`Import failed: ${result.error}`)
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleDelete = (id) => {
    if (confirm('Delete this entry?')) {
      deleteProgressEntry(id)
      setRefreshKey((k) => k + 1)
    }
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete ALL progress data? This cannot be undone.')) {
      clearAllProgress()
      setRefreshKey((k) => k + 1)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Progress Dashboard</CardTitle>
          <CardDescription>Track your body stats over time with visual charts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Metric Type Tabs */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(METRIC_CONFIG).map(([type, cfg]) => {
              const Icon = cfg.icon
              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeType === type
                      ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{cfg.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      activeType === type
                        ? 'bg-[var(--bg-primary)] text-[var(--accent)]'
                        : 'bg-[var(--bg-secondary)]'
                    }`}
                  >
                    {getEntriesByType(type).length}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="Current"
                value={typeEntries[0]?.data[config.metric]}
                unit={config.unit}
                change={null}
                icon={config.icon}
              />
              <StatCard
                label="Change"
                value={stats.change}
                unit={config.unit}
                change={stats.change}
              />
              <StatCard label="Average" value={stats.average} unit={config.unit} change={null} />
              <StatCard label="Entries" value={stats.count} unit="" change={null} icon={Calendar} />
            </div>
          )}

          {/* Chart */}
          <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
              {config?.label} Over Time
            </h3>
            <SimpleLineChart data={chartData} color={config?.color || 'var(--accent)'} height={180} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <ResultCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-[var(--text-primary)]">All Entries</h3>
          <span className="text-sm text-[var(--text-secondary)]">{entries.length} total</span>
        </div>
        <EntryList entries={entries} onDelete={handleDelete} />
      </ResultCard>

      {/* Import/Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export your progress for backup or import existing data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import Data
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            {entries.length > 0 && (
              <Button
                onClick={handleClearAll}
                variant="danger"
                className="flex items-center gap-2 ml-auto"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
