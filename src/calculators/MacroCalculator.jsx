import { useState, useMemo } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Select,
  ToggleButton,
  ResultDisplay,
  ResultCard,
  ResultGrid,
  MacroBar,
} from '../components'
import { calculateMacros, GOALS, kgToLbs } from '../lib/macros'

export function MacroCalculator({ initialTDEE, initialWeight, initialWeightUnit }) {
  // Use a key-based approach: parent will remount with new key when props change
  const [tdee, setTdee] = useState(initialTDEE?.toString() || '')
  const [bodyweight, setBodyweight] = useState(initialWeight?.toString() || '')
  const [weightUnit, setWeightUnit] = useState(initialWeightUnit || 'lbs')
  const [goal, setGoal] = useState('maintain')

  // Derived values from props for display (allows manual override)
  const displayTdee = tdee || (initialTDEE?.toString() ?? '')
  const displayWeight = bodyweight || (initialWeight?.toString() ?? '')

  const goalOptions = Object.entries(GOALS).map(([key, val]) => ({
    value: key,
    label: `${val.label} (${val.adjustment >= 0 ? '+' : ''}${val.adjustment} cal)`,
  }))

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
      goal,
    })
  }, [displayTdee, displayWeight, weightUnit, goal])

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

          <Select
            label="Goal"
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            options={goalOptions}
          />
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
