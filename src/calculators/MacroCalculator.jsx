import { useState, useMemo } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Slider,
  ToggleButton,
  ResultDisplay,
  ResultCard,
  ResultGrid,
  MacroBar,
} from '../components'
import { calculateMacros, GOALS, kgToLbs } from '../lib/macros'

const QUICK_ADJUSTMENTS = [
  { value: -500, label: '-500' },
  { value: -250, label: '-250' },
  { value: 0, label: '0' },
  { value: 250, label: '+250' },
  { value: 500, label: '+500' },
]

export function MacroCalculator({ initialTDEE, initialWeight, initialWeightUnit }) {
  const [tdee, setTdee] = useState(initialTDEE?.toString() || '')
  const [bodyweight, setBodyweight] = useState(initialWeight?.toString() || '')
  const [weightUnit, setWeightUnit] = useState(initialWeightUnit || 'lbs')
  const [customAdjustment, setCustomAdjustment] = useState(0)

  const displayTdee = tdee || (initialTDEE?.toString() ?? '')
  const displayWeight = bodyweight || (initialWeight?.toString() ?? '')

  const formatAdjustment = (val) => {
    const num = parseInt(val, 10)
    if (num > 0) return `+${num} cal`
    if (num < 0) return `${num} cal`
    return 'Maintenance'
  }

  const results = useMemo(() => {
    const tdeeNum = parseFloat(displayTdee)
    const weightNum = parseFloat(displayWeight)

    if (!tdeeNum || !weightNum) {
      return null
    }

    const bodyweightLbs = weightUnit === 'kg' ? kgToLbs(weightNum) : weightNum

    return calculateMacros({
      tdee: tdeeNum,
      bodyweightLbs,
      goal: 'maintain',
      customAdjustment: parseInt(customAdjustment, 10),
    })
  }, [displayTdee, displayWeight, weightUnit, customAdjustment])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Macro Splitter</CardTitle>
          <CardDescription>
            Calculate your daily protein, fat, and carb targets based on your goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="TDEE (calories)"
            id="tdee"
            value={displayTdee}
            onChange={(e) => setTdee(e.target.value)}
            placeholder="2500"
            min="1"
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Bodyweight</label>
              <ToggleButton
                options={[
                  { value: 'lbs', label: 'lbs' },
                  { value: 'kg', label: 'kg' },
                ]}
                value={weightUnit}
                onChange={setWeightUnit}
              />
            </div>
            <Input
              id="bodyweight"
              value={displayWeight}
              onChange={(e) => setBodyweight(e.target.value)}
              placeholder={weightUnit === 'lbs' ? '180' : '82'}
              min="1"
            />
          </div>

          <div className="space-y-3">
            <Slider
              label="Calorie Adjustment"
              id="calorie-adjustment"
              value={customAdjustment}
              onChange={(e) => setCustomAdjustment(e.target.value)}
              min={-1000}
              max={1000}
              step={25}
              valueFormatter={formatAdjustment}
            />

            <div className="flex flex-wrap gap-2">
              {QUICK_ADJUSTMENTS.map((adj) => (
                <button
                  key={adj.value}
                  onClick={() => setCustomAdjustment(adj.value)}
                  className={`
                    px-3 py-1.5 text-sm rounded-lg transition-colors
                    ${parseInt(customAdjustment, 10) === adj.value
                      ? 'bg-[var(--accent)] text-[var(--bg-primary)] font-medium'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  {adj.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-secondary)]">Custom:</span>
              <input
                type="number"
                value={customAdjustment}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10)
                  if (!isNaN(val) && val >= -1000 && val <= 1000) {
                    setCustomAdjustment(val)
                  }
                }}
                className="w-24 px-2 py-1 text-sm bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg
                           text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">cal</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {results && (
        <ResultCard>
          <div className="mb-4">
            <ResultDisplay
              label="Target Daily Calories"
              value={results.targetCalories.toLocaleString()}
              unit="cal"
              size="lg"
              color="accent"
            />
          </div>

          <div className="space-y-4">
            <MacroBar
              label="Protein"
              value={results.protein}
              percentage={results.breakdown.proteinPercentage}
              color="protein"
            />
            <MacroBar
              label="Carbohydrates"
              value={results.carbs}
              percentage={results.breakdown.carbPercentage}
              color="carbs"
            />
            <MacroBar
              label="Fat"
              value={results.fat}
              percentage={results.breakdown.fatPercentage}
              color="fat"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--bg-secondary)]">
            <ResultGrid className="grid-cols-3">
              <div className="text-center">
                <span className="block text-2xl font-bold text-blue-500">{results.protein}g</span>
                <span className="text-xs text-[var(--text-secondary)]">Protein</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-green-500">{results.carbs}g</span>
                <span className="text-xs text-[var(--text-secondary)]">Carbs</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-yellow-500">{results.fat}g</span>
                <span className="text-xs text-[var(--text-secondary)]">Fat</span>
              </div>
            </ResultGrid>
          </div>

          <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg">
            <p className="text-xs text-[var(--text-secondary)]">
              <strong>Formula:</strong> Protein = 1g/lb bodyweight, Fat = 25% of calories, Carbs = remaining calories
            </p>
          </div>
        </ResultCard>
      )}
    </div>
  )
}
