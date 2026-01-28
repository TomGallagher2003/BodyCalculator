/**
 * Progress Tracking Storage Utility
 * Handles localStorage operations for tracking user body stats over time
 */

const STORAGE_KEY = 'bodycalc_progress'

/**
 * Entry types for different calculator results
 */
export const ENTRY_TYPES = {
  WEIGHT: 'weight',
  BODY_FAT: 'bodyFat',
  TDEE: 'tdee',
  MACROS: 'macros',
}

/**
 * Get all progress entries from localStorage
 * @returns {Array} Array of progress entries sorted by date (newest first)
 */
export function getProgressEntries() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    const entries = JSON.parse(data)
    return entries.sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch {
    console.error('Failed to read progress data')
    return []
  }
}

/**
 * Save a new progress entry
 * @param {Object} entry - The progress entry to save
 * @param {string} entry.type - Entry type (weight, bodyFat, tdee, macros)
 * @param {string} entry.date - ISO date string
 * @param {Object} entry.data - The calculator data to save
 * @returns {Object} The saved entry with generated ID
 */
export function saveProgressEntry(entry) {
  const entries = getProgressEntries()
  const newEntry = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    ...entry,
  }
  entries.push(newEntry)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  return newEntry
}

/**
 * Update an existing progress entry
 * @param {string} id - Entry ID to update
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated entry or null if not found
 */
export function updateProgressEntry(id, updates) {
  const entries = getProgressEntries()
  const index = entries.findIndex((e) => e.id === id)
  if (index === -1) return null

  entries[index] = { ...entries[index], ...updates, updatedAt: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  return entries[index]
}

/**
 * Delete a progress entry
 * @param {string} id - Entry ID to delete
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteProgressEntry(id) {
  const entries = getProgressEntries()
  const filtered = entries.filter((e) => e.id !== id)
  if (filtered.length === entries.length) return false

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

/**
 * Get entries filtered by type
 * @param {string} type - Entry type to filter by
 * @returns {Array} Filtered entries sorted by date
 */
export function getEntriesByType(type) {
  return getProgressEntries().filter((e) => e.type === type)
}

/**
 * Get entries within a date range
 * @param {Date} startDate - Start of date range
 * @param {Date} endDate - End of date range
 * @returns {Array} Entries within the date range
 */
export function getEntriesByDateRange(startDate, endDate) {
  const entries = getProgressEntries()
  return entries.filter((e) => {
    const entryDate = new Date(e.date)
    return entryDate >= startDate && entryDate <= endDate
  })
}

/**
 * Get the latest entry of a specific type
 * @param {string} type - Entry type
 * @returns {Object|null} Latest entry or null
 */
export function getLatestEntry(type) {
  const entries = getEntriesByType(type)
  return entries.length > 0 ? entries[0] : null
}

/**
 * Export all progress data as JSON string
 * @returns {string} JSON string of all progress data
 */
export function exportProgressData() {
  const entries = getProgressEntries()
  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries,
  }
  return JSON.stringify(exportData, null, 2)
}

/**
 * Import progress data from JSON string
 * @param {string} jsonString - JSON string to import
 * @param {boolean} merge - If true, merge with existing data; if false, replace
 * @returns {Object} Result with success status and count of imported entries
 */
export function importProgressData(jsonString, merge = true) {
  try {
    const importData = JSON.parse(jsonString)

    if (!importData.entries || !Array.isArray(importData.entries)) {
      return { success: false, error: 'Invalid import format: missing entries array' }
    }

    // Validate entries have required fields
    const validEntries = importData.entries.filter(
      (e) => e.type && e.date && e.data && typeof e.data === 'object'
    )

    if (merge) {
      const existingEntries = getProgressEntries()
      const existingIds = new Set(existingEntries.map((e) => e.id))

      // Add new IDs to imported entries that might conflict
      const processedEntries = validEntries.map((e) => ({
        ...e,
        id: existingIds.has(e.id) ? generateId() : e.id || generateId(),
      }))

      const merged = [...existingEntries, ...processedEntries]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
      return { success: true, imported: processedEntries.length, total: merged.length }
    } else {
      // Ensure all entries have IDs
      const processedEntries = validEntries.map((e) => ({
        ...e,
        id: e.id || generateId(),
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(processedEntries))
      return { success: true, imported: processedEntries.length, total: processedEntries.length }
    }
  } catch {
    return { success: false, error: 'Failed to parse import data' }
  }
}

/**
 * Clear all progress data
 * @returns {boolean} True if cleared successfully
 */
export function clearAllProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

/**
 * Get chart-ready data for a specific metric
 * @param {string} type - Entry type
 * @param {string} metric - Metric key within data object
 * @param {number} limit - Max number of entries (default 30)
 * @returns {Array} Array of {date, value} objects sorted chronologically
 */
export function getChartData(type, metric, limit = 30) {
  const entries = getEntriesByType(type)
    .slice(0, limit)
    .reverse() // Chronological order for charts

  return entries
    .filter((e) => e.data && e.data[metric] !== undefined)
    .map((e) => ({
      date: e.date,
      value: e.data[metric],
      id: e.id,
    }))
}

/**
 * Calculate progress statistics for a metric
 * @param {string} type - Entry type
 * @param {string} metric - Metric key
 * @returns {Object} Statistics including min, max, average, change
 */
export function getProgressStats(type, metric) {
  const entries = getEntriesByType(type).filter((e) => e.data && e.data[metric] !== undefined)

  if (entries.length === 0) {
    return { count: 0, min: null, max: null, average: null, change: null, percentChange: null }
  }

  const values = entries.map((e) => e.data[metric])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const average = values.reduce((sum, v) => sum + v, 0) / values.length

  // Calculate change from oldest to newest
  const oldest = entries[entries.length - 1].data[metric]
  const newest = entries[0].data[metric]
  const change = newest - oldest
  const percentChange = oldest !== 0 ? ((change / oldest) * 100).toFixed(1) : null

  return {
    count: entries.length,
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    average: Math.round(average * 10) / 10,
    change: Math.round(change * 10) / 10,
    percentChange,
  }
}

/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Format a date for display
 * @param {string} isoDate - ISO date string
 * @param {string} format - 'short', 'medium', or 'long'
 * @returns {string} Formatted date string
 */
export function formatDate(isoDate, format = 'medium') {
  const date = new Date(isoDate)
  const options = {
    short: { month: 'numeric', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' },
  }
  return date.toLocaleDateString('en-US', options[format] || options.medium)
}

/**
 * Get today's date as ISO string (date only, no time)
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}
