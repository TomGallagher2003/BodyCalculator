import { useState } from 'react'
import { Save, Check, Calendar } from 'lucide-react'
import { Button } from './Button'
import { saveProgressEntry, getTodayISO } from '../lib/progress'

export function SaveProgressButton({ entryType, data, onSave }) {
  const [saved, setSaved] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(getTodayISO())

  const handleSave = () => {
    const entry = saveProgressEntry({
      type: entryType,
      date: selectedDate,
      data,
    })

    setSaved(true)
    setShowDatePicker(false)
    onSave?.(entry)

    // Reset after 2 seconds
    setTimeout(() => setSaved(false), 2000)
  }

  if (saved) {
    return (
      <Button variant="success" className="flex items-center gap-2" disabled>
        <Check className="w-4 h-4" />
        Saved!
      </Button>
    )
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex items-center gap-2 flex-1">
          <Save className="w-4 h-4" />
          Save Progress
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="px-3"
          aria-label="Select date"
        >
          <Calendar className="w-4 h-4" />
        </Button>
      </div>

      {showDatePicker && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-lg shadow-lg z-10">
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Entry Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={getTodayISO()}
            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg
                       text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          />
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleSave} className="flex-1">
              Save for {selectedDate === getTodayISO() ? 'Today' : selectedDate}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowDatePicker(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
