/**
 * Weight Trend Analysis Utilities
 * Moving averages, linear regression trendlines, and date-range filtering
 * for the weight tracking chart.
 */

import { lbsToKg, kgToLbs } from './tdee'

export const RANGE_OPTIONS = [
  { value: '1W', label: '1W', days: 7 },
  { value: '1M', label: '1M', days: 30 },
  { value: '3M', label: '3M', days: 90 },
  { value: '6M', label: '6M', days: 180 },
  { value: '1Y', label: '1Y', days: 365 },
  { value: 'ALL', label: 'All', days: null },
]

/**
 * Convert a weight entry's value to a target unit
 * @param {number} value - The weight value
 * @param {string} fromUnit - 'kg' or 'lbs'
 * @param {string} toUnit - 'kg' or 'lbs'
 * @returns {number} Converted value
 */
export function convertWeight(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value
  return fromUnit === 'lbs' ? lbsToKg(value) : kgToLbs(value)
}

/**
 * Build a chronological weight series from progress entries, normalized to a single unit
 * @param {Array} entries - Weight entries with data.weight and data.unit
 * @param {string} targetUnit - 'kg' or 'lbs' to normalize all values to
 * @returns {Array} Chronologically sorted [{date, value, id}]
 */
export function normalizeWeightSeries(entries, targetUnit = 'kg') {
  return entries
    .filter((e) => e.data && e.data.weight !== undefined && e.data.weight !== null)
    .map((e) => ({
      date: e.date,
      value: convertWeight(Number(e.data.weight), e.data.unit || 'kg', targetUnit),
      id: e.id,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

/**
 * Filter a chronological series to entries within a range relative to the current date
 * @param {Array} series - [{date, value}] sorted chronologically
 * @param {string} range - One of RANGE_OPTIONS values ('1W', '1M', '3M', '6M', '1Y', 'ALL')
 * @param {Date} [now] - Reference "current" date, defaults to today
 * @returns {Array} Filtered series
 */
export function filterSeriesByRange(series, range, now = new Date()) {
  const option = RANGE_OPTIONS.find((r) => r.value === range)
  if (!option || option.days === null) return series

  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - option.days)

  return series.filter((point) => new Date(point.date) >= cutoff)
}

/**
 * Calculate a trailing N-day moving average for each point in the series
 * (weekly moving average uses windowDays = 7)
 * @param {Array} series - Chronologically sorted [{date, value}]
 * @param {number} windowDays - Size of the trailing window in days (default 7)
 * @returns {Array} [{date, value, average}] - average is null when insufficient lookback data exists
 */
export function calculateMovingAverage(series, windowDays = 7) {
  return series.map((point, i) => {
    const pointDate = new Date(point.date)
    const windowStart = new Date(pointDate)
    windowStart.setDate(windowStart.getDate() - (windowDays - 1))

    const windowPoints = series
      .slice(0, i + 1)
      .filter((p) => new Date(p.date) >= windowStart && new Date(p.date) <= pointDate)

    const average =
      windowPoints.length > 0
        ? windowPoints.reduce((sum, p) => sum + p.value, 0) / windowPoints.length
        : null

    return { date: point.date, value: point.value, average: average !== null ? Math.round(average * 100) / 100 : null }
  })
}

/**
 * Calculate a linear regression (least-squares line of best fit) over a series
 * @param {Array} series - [{date, value}]
 * @returns {Object|null} { slope, intercept, weeklyRate, getValueAtDate } where slope is
 *   value change per millisecond-scaled day, weeklyRate is change per 7 days, and
 *   getValueAtDate(date) projects the fitted line's value at a given date. Null if <2 points.
 */
export function calculateLinearRegression(series) {
  if (!series || series.length < 2) return null

  const dayMs = 24 * 60 * 60 * 1000
  const baseTime = new Date(series[0].date).getTime()

  const xs = series.map((p) => (new Date(p.date).getTime() - baseTime) / dayMs)
  const ys = series.map((p) => p.value)
  const n = xs.length

  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0)
  const sumXX = xs.reduce((sum, x) => sum + x * x, 0)

  const denominator = n * sumXX - sumX * sumX
  if (denominator === 0) return null

  const slope = (n * sumXY - sumX * sumY) / denominator
  const intercept = (sumY - slope * sumX) / n

  const getValueAtDate = (date) => {
    const x = (new Date(date).getTime() - baseTime) / dayMs
    return slope * x + intercept
  }

  return {
    slope,
    intercept,
    weeklyRate: Math.round(slope * 7 * 100) / 100,
    getValueAtDate,
  }
}
