import { describe, it, expect, vi } from 'vitest'
import {
  RANGE_OPTIONS,
  convertWeight,
  normalizeWeightSeries,
  filterSeriesByRange,
  calculateMovingAverage,
  calculateLinearRegression,
} from './weightTrends'

describe('convertWeight', () => {
  it('returns the same value when units match', () => {
    expect(convertWeight(80, 'kg', 'kg')).toBe(80)
  })

  it('converts lbs to kg', () => {
    expect(convertWeight(220, 'lbs', 'kg')).toBeCloseTo(99.79, 1)
  })

  it('converts kg to lbs', () => {
    expect(convertWeight(100, 'kg', 'lbs')).toBeCloseTo(220.46, 1)
  })
})

describe('normalizeWeightSeries', () => {
  it('normalizes mixed-unit entries to a single target unit', () => {
    const entries = [
      { id: '1', date: '2026-07-02', data: { weight: 220, unit: 'lbs' } },
      { id: '2', date: '2026-07-01', data: { weight: 80, unit: 'kg' } },
    ]
    const series = normalizeWeightSeries(entries, 'kg')
    expect(series).toHaveLength(2)
    // sorted chronologically
    expect(series[0].date).toBe('2026-07-01')
    expect(series[0].value).toBe(80)
    expect(series[1].value).toBeCloseTo(99.79, 1)
  })

  it('filters out entries with missing weight', () => {
    const entries = [{ id: '1', date: '2026-07-01', data: { unit: 'kg' } }]
    expect(normalizeWeightSeries(entries)).toHaveLength(0)
  })

  it('defaults unit to kg when unspecified', () => {
    const entries = [{ id: '1', date: '2026-07-01', data: { weight: 80 } }]
    expect(normalizeWeightSeries(entries, 'kg')[0].value).toBe(80)
  })
})

describe('filterSeriesByRange', () => {
  const now = new Date('2026-07-16T00:00:00Z')
  const series = [
    { date: '2025-01-01', value: 90 },
    { date: '2026-01-20', value: 85 },
    { date: '2026-04-20', value: 83 },
    { date: '2026-06-20', value: 81 },
    { date: '2026-07-10', value: 80 },
    { date: '2026-07-15', value: 79.5 },
  ]

  it('returns everything for ALL', () => {
    expect(filterSeriesByRange(series, 'ALL', now)).toHaveLength(6)
  })

  it('filters to the last 7 days for 1W', () => {
    const result = filterSeriesByRange(series, '1W', now)
    expect(result.map((p) => p.date)).toEqual(['2026-07-10', '2026-07-15'])
  })

  it('filters to the last 30 days for 1M', () => {
    const result = filterSeriesByRange(series, '1M', now)
    expect(result.map((p) => p.date)).toEqual(['2026-06-20', '2026-07-10', '2026-07-15'])
  })

  it('filters to the last 90 days for 3M', () => {
    const result = filterSeriesByRange(series, '3M', now)
    expect(result.map((p) => p.date)).toEqual(['2026-04-20', '2026-06-20', '2026-07-10', '2026-07-15'])
  })

  it('filters to the last 365 days for 1Y', () => {
    const result = filterSeriesByRange(series, '1Y', now)
    expect(result.map((p) => p.date)).toEqual([
      '2026-01-20',
      '2026-04-20',
      '2026-06-20',
      '2026-07-10',
      '2026-07-15',
    ])
  })

  it('has an option for every documented range', () => {
    expect(RANGE_OPTIONS.map((r) => r.value)).toEqual(['1W', '1M', '3M', '6M', '1Y', 'ALL'])
  })

  it('defaults "now" to the New Zealand date, not the device/UTC date', () => {
    // 11:30pm UTC on 2026-07-15 is already 2026-07-16 in New Zealand
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-15T23:30:00Z'))
    const result = filterSeriesByRange(series, '1W')
    vi.useRealTimers()
    // a 7-day window ending 2026-07-16 should include 2026-07-10 but not 2026-06-20
    expect(result.map((p) => p.date)).toEqual(['2026-07-10', '2026-07-15'])
  })
})

describe('calculateMovingAverage', () => {
  it('averages only points within the trailing window', () => {
    const series = [
      { date: '2026-07-01', value: 80 },
      { date: '2026-07-02', value: 82 },
      { date: '2026-07-10', value: 78 },
    ]
    const result = calculateMovingAverage(series, 7)
    expect(result[0].average).toBe(80)
    expect(result[1].average).toBe(81)
    // 2026-07-10 window start is 2026-07-04, so only itself qualifies
    expect(result[2].average).toBe(78)
  })

  it('returns an empty array for an empty series', () => {
    expect(calculateMovingAverage([])).toEqual([])
  })
})

describe('calculateLinearRegression', () => {
  it('returns null for fewer than 2 points', () => {
    expect(calculateLinearRegression([{ date: '2026-07-01', value: 80 }])).toBeNull()
    expect(calculateLinearRegression([])).toBeNull()
  })

  it('fits a perfect downward trend', () => {
    const series = [
      { date: '2026-07-01', value: 90 },
      { date: '2026-07-08', value: 89 },
      { date: '2026-07-15', value: 88 },
    ]
    const regression = calculateLinearRegression(series)
    expect(regression.weeklyRate).toBeCloseTo(-1, 5)
    expect(regression.getValueAtDate('2026-07-01')).toBeCloseTo(90, 5)
    expect(regression.getValueAtDate('2026-07-15')).toBeCloseTo(88, 5)
  })

  it('fits a flat trend with zero slope', () => {
    const series = [
      { date: '2026-07-01', value: 80 },
      { date: '2026-07-08', value: 80 },
      { date: '2026-07-15', value: 80 },
    ]
    const regression = calculateLinearRegression(series)
    expect(regression.weeklyRate).toBe(0)
  })
})
