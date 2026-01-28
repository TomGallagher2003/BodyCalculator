import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getProgressEntries,
  saveProgressEntry,
  updateProgressEntry,
  deleteProgressEntry,
  getEntriesByType,
  getEntriesByDateRange,
  getLatestEntry,
  exportProgressData,
  importProgressData,
  clearAllProgress,
  getChartData,
  getProgressStats,
  formatDate,
  getTodayISO,
  ENTRY_TYPES,
} from './progress'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('Progress Storage', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('ENTRY_TYPES', () => {
    it('should have correct entry type constants', () => {
      expect(ENTRY_TYPES.WEIGHT).toBe('weight')
      expect(ENTRY_TYPES.BODY_FAT).toBe('bodyFat')
      expect(ENTRY_TYPES.TDEE).toBe('tdee')
      expect(ENTRY_TYPES.MACROS).toBe('macros')
    })
  })

  describe('getProgressEntries', () => {
    it('should return empty array when no data exists', () => {
      const entries = getProgressEntries()
      expect(entries).toEqual([])
    })

    it('should return sorted entries (newest first)', () => {
      const testData = [
        { id: '1', date: '2025-01-01', type: 'weight', data: { weight: 180 } },
        { id: '2', date: '2025-01-15', type: 'weight', data: { weight: 178 } },
        { id: '3', date: '2025-01-10', type: 'weight', data: { weight: 179 } },
      ]
      localStorageMock.setItem('bodycalc_progress', JSON.stringify(testData))

      const entries = getProgressEntries()
      expect(entries[0].date).toBe('2025-01-15')
      expect(entries[1].date).toBe('2025-01-10')
      expect(entries[2].date).toBe('2025-01-01')
    })

    it('should handle invalid JSON gracefully', () => {
      localStorageMock.setItem('bodycalc_progress', 'invalid json')
      const entries = getProgressEntries()
      expect(entries).toEqual([])
    })
  })

  describe('saveProgressEntry', () => {
    it('should save a new entry with generated ID', () => {
      const entry = {
        type: ENTRY_TYPES.WEIGHT,
        date: '2025-01-20',
        data: { weight: 180, unit: 'lbs' },
      }

      const saved = saveProgressEntry(entry)

      expect(saved.id).toBeDefined()
      expect(saved.createdAt).toBeDefined()
      expect(saved.type).toBe(ENTRY_TYPES.WEIGHT)
      expect(saved.data.weight).toBe(180)
    })

    it('should append to existing entries', () => {
      const existing = [{ id: '1', date: '2025-01-01', type: 'weight', data: { weight: 180 } }]
      localStorageMock.setItem('bodycalc_progress', JSON.stringify(existing))

      saveProgressEntry({
        type: ENTRY_TYPES.WEIGHT,
        date: '2025-01-20',
        data: { weight: 178 },
      })

      const entries = getProgressEntries()
      expect(entries.length).toBe(2)
    })
  })

  describe('updateProgressEntry', () => {
    it('should update an existing entry', () => {
      const testData = [{ id: 'test-id', date: '2025-01-01', type: 'weight', data: { weight: 180 } }]
      localStorageMock.setItem('bodycalc_progress', JSON.stringify(testData))

      const updated = updateProgressEntry('test-id', { data: { weight: 175 } })

      expect(updated.data.weight).toBe(175)
      expect(updated.updatedAt).toBeDefined()
    })

    it('should return null for non-existent entry', () => {
      const result = updateProgressEntry('non-existent', { data: {} })
      expect(result).toBeNull()
    })
  })

  describe('deleteProgressEntry', () => {
    it('should delete an existing entry', () => {
      const testData = [
        { id: '1', date: '2025-01-01', type: 'weight', data: { weight: 180 } },
        { id: '2', date: '2025-01-02', type: 'weight', data: { weight: 179 } },
      ]
      localStorageMock.setItem('bodycalc_progress', JSON.stringify(testData))

      const result = deleteProgressEntry('1')

      expect(result).toBe(true)
      const entries = getProgressEntries()
      expect(entries.length).toBe(1)
      expect(entries[0].id).toBe('2')
    })

    it('should return false for non-existent entry', () => {
      const result = deleteProgressEntry('non-existent')
      expect(result).toBe(false)
    })
  })

  describe('getEntriesByType', () => {
    it('should filter entries by type', () => {
      const testData = [
        { id: '1', date: '2025-01-01', type: 'weight', data: { weight: 180 } },
        { id: '2', date: '2025-01-02', type: 'bodyFat', data: { bodyFat: 20 } },
        { id: '3', date: '2025-01-03', type: 'weight', data: { weight: 178 } },
      ]
      localStorageMock.setItem('bodycalc_progress', JSON.stringify(testData))

      const weightEntries = getEntriesByType(ENTRY_TYPES.WEIGHT)
      expect(weightEntries.length).toBe(2)
      expect(weightEntries.every((e) => e.type === 'weight')).toBe(true)
    })
  })

  describe('getEntriesByDateRange', () => {
    it('should filter entries within date range', () => {
      const testData = [
        { id: '1', date: '2025-01-01', type: 'weight', data: { weight: 180 } },
        { id: '2', date: '2025-01-15', type: 'weight', data: { weight: 178 } },
        { id: '3', date: '2025-01-30', type: 'weight', data: { weight: 176 } },
      ]
      localStorageMock.setItem('bodycalc_progress', JSON.stringify(testData))

      const entries = getEntriesByDateRange(new Date('2025-01-10'), new Date('2025-01-20'))
      expect(entries.length).toBe(1)
      expect(entries[0].id).toBe('2')
    })
  })

  describe('getLatestEntry', () => {
    it('should return the most recent entry of a type', () => {
      const testData = [
        { id: '1', date: '2025-01-01', type: 'weight', data: { weight: 180 } },
        { id: '2', date: '2025-01-15', type: 'weight', data: { weight: 178 } },
      ]
      localStorageMock.setItem('bodycalc_progress', JSON.stringify(testData))

      const latest = getLatestEntry(ENTRY_TYPES.WEIGHT)
      expect(latest.id).toBe('2')
      expect(latest.data.weight).toBe(178)
    })

    it('should return null when no entries of type exist', () => {
      const latest = getLatestEntry(ENTRY_TYPES.BODY_FAT)
      expect(latest).toBeNull()
    })
  })

  describe('exportProgressData', () => {
    it('should export all data as JSON string', () => {
      const testData = [{ id: '1', date: '2025-01-01', type: 'weight', data: { weight: 180 } }]
      localStorageMock.setItem('bodycalc_progress', JSON.stringify(testData))

      const exported = exportProgressData()
      const parsed = JSON.parse(exported)

      expect(parsed.version).toBe(1)
      expect(parsed.exportedAt).toBeDefined()
      expect(parsed.entries.length).toBe(1)
    })
  })

  describe('importProgressData', () => {
    it('should import valid data and merge with existing', () => {
      const existing = [{ id: '1', date: '2025-01-01', type: 'weight', data: { weight: 180 } }]
      localStorageMock.setItem('bodycalc_progress', JSON.stringify(existing))

      const importData = JSON.stringify({
        version: 1,
        entries: [{ id: '2', date: '2025-01-15', type: 'weight', data: { weight: 178 } }],
      })

      const result = importProgressData(importData, true)

      expect(result.success).toBe(true)
      expect(result.imported).toBe(1)
      expect(result.total).toBe(2)
    })

    it('should replace existing data when merge is false', () => {
      const existing = [{ id: '1', date: '2025-01-01', type: 'weight', data: { weight: 180 } }]
      localStorageMock.setItem('bodycalc_progress', JSON.stringify(existing))

      const importData = JSON.stringify({
        version: 1,
        entries: [{ id: '2', date: '2025-01-15', type: 'weight', data: { weight: 178 } }],
      })

      const result = importProgressData(importData, false)

      expect(result.success).toBe(true)
      expect(result.total).toBe(1)
      const entries = getProgressEntries()
      expect(entries[0].data.weight).toBe(178)
    })

    it('should handle invalid JSON', () => {
      const result = importProgressData('invalid json')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle missing entries array', () => {
      const result = importProgressData(JSON.stringify({ version: 1 }))
      expect(result.success).toBe(false)
    })
  })

  describe('clearAllProgress', () => {
    it('should remove all progress data', () => {
      const testData = [{ id: '1', date: '2025-01-01', type: 'weight', data: { weight: 180 } }]
      localStorageMock.setItem('bodycalc_progress', JSON.stringify(testData))

      const result = clearAllProgress()

      expect(result).toBe(true)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('bodycalc_progress')
    })
  })

  describe('getChartData', () => {
    it('should return chart-ready data sorted chronologically', () => {
      const testData = [
        { id: '1', date: '2025-01-01', type: 'weight', data: { weight: 180 } },
        { id: '2', date: '2025-01-15', type: 'weight', data: { weight: 178 } },
        { id: '3', date: '2025-01-10', type: 'weight', data: { weight: 179 } },
      ]
      localStorageMock.setItem('bodycalc_progress', JSON.stringify(testData))

      const chartData = getChartData(ENTRY_TYPES.WEIGHT, 'weight')

      expect(chartData[0].date).toBe('2025-01-01')
      expect(chartData[1].date).toBe('2025-01-10')
      expect(chartData[2].date).toBe('2025-01-15')
      expect(chartData[0].value).toBe(180)
    })

    it('should respect limit parameter', () => {
      const testData = Array.from({ length: 50 }, (_, i) => ({
        id: `${i}`,
        date: `2025-01-${String(i + 1).padStart(2, '0')}`,
        type: 'weight',
        data: { weight: 180 - i },
      }))
      localStorageMock.setItem('bodycalc_progress', JSON.stringify(testData))

      const chartData = getChartData(ENTRY_TYPES.WEIGHT, 'weight', 10)
      expect(chartData.length).toBe(10)
    })
  })

  describe('getProgressStats', () => {
    it('should calculate correct statistics', () => {
      const testData = [
        { id: '1', date: '2025-01-01', type: 'weight', data: { weight: 180 } },
        { id: '2', date: '2025-01-15', type: 'weight', data: { weight: 178 } },
        { id: '3', date: '2025-01-30', type: 'weight', data: { weight: 175 } },
      ]
      localStorageMock.setItem('bodycalc_progress', JSON.stringify(testData))

      const stats = getProgressStats(ENTRY_TYPES.WEIGHT, 'weight')

      expect(stats.count).toBe(3)
      expect(stats.min).toBe(175)
      expect(stats.max).toBe(180)
      expect(stats.average).toBeCloseTo(177.7, 1)
      expect(stats.change).toBe(-5) // newest (175) - oldest (180)
    })

    it('should return null values for empty data', () => {
      const stats = getProgressStats(ENTRY_TYPES.WEIGHT, 'weight')

      expect(stats.count).toBe(0)
      expect(stats.min).toBeNull()
      expect(stats.max).toBeNull()
      expect(stats.average).toBeNull()
    })
  })

  describe('formatDate', () => {
    it('should format date with short format', () => {
      const formatted = formatDate('2025-01-15', 'short')
      expect(formatted).toContain('1')
      expect(formatted).toContain('15')
    })

    it('should format date with medium format (default)', () => {
      const formatted = formatDate('2025-01-15')
      expect(formatted).toContain('Jan')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2025')
    })

    it('should format date with long format', () => {
      const formatted = formatDate('2025-01-15', 'long')
      expect(formatted).toContain('Jan')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2025')
    })
  })

  describe('getTodayISO', () => {
    it('should return today date in YYYY-MM-DD format', () => {
      const today = getTodayISO()
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })
})
