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
} from '../components'
import { calculateFatLossRequired } from '../lib/fatloss'

export function FatLossCalculator() {
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState('lbs')
  const [currentBodyFat, setCurrentBodyFat] = useState(20)
  const [targetBodyFat, setTargetBodyFat] = useState(12)

  const formatBF = (val) => `${val}%`

  const results = useMemo(() => {
    const weightNum = parseFloat(weight)

    if (!weightNum || weightNum <= 0) {
      return null
    }

    return calculateFatLossRequired({
      currentWeight: weightNum,
      weightUnit,
      currentBodyFat,
      targetBodyFat,
    })
  }, [weight, weightUnit, currentBodyFat, targetBodyFat])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fat Loss Required</CardTitle>
          <CardDescription>
            Calculate how much weight you need to lose to reach your target body fat percentage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Current Weight</label>
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
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={weightUnit === 'lbs' ? '180' : '82'}
              min="1"
            />
          </div>

          <Slider
            label="Current Body Fat %"
            id="current-bf"
            value={currentBodyFat}
            onChange={(e) => setCurrentBodyFat(parseInt(e.target.value, 10))}
            min={5}
            max={50}
            step={1}
            valueFormatter={formatBF}
          />

          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)]">Exact:</span>
            <input
              type="number"
              value={currentBodyFat}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                if (!isNaN(val) && val >= 5 && val <= 50) {
                  setCurrentBodyFat(val)
                }
              }}
              className="w-20 px-2 py-1 text-sm bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg
                         text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">%</span>
          </div>

          <Slider
            label="Target Body Fat %"
            id="target-bf"
            value={targetBodyFat}
            onChange={(e) => setTargetBodyFat(parseInt(e.target.value, 10))}
            min={3}
            max={30}
            step={1}
            valueFormatter={formatBF}
          />

          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-secondary)]">Exact:</span>
            <input
              type="number"
              value={targetBodyFat}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                if (!isNaN(val) && val >= 3 && val <= 30) {
                  setTargetBodyFat(val)
                }
              }}
              className="w-20 px-2 py-1 text-sm bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg
                         text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">%</span>
          </div>
        </CardContent>
      </Card>

      {results && !results.isValid && (
        <Card className="border-[var(--error)]">
          <CardContent className="py-4">
            <p className="text-[var(--error)] text-sm">{results.error}</p>
          </CardContent>
        </Card>
      )}

      {results && results.isValid && (
        <ResultCard>
          <div className="mb-6">
            <ResultDisplay
              label="Weight to Lose"
              value={results.weightToLose.toLocaleString()}
              unit={results.weightUnit}
              size="lg"
              color="accent"
            />
          </div>

          <ResultGrid className="grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-[var(--bg-secondary)] rounded-lg text-center">
              <span className="block text-2xl font-bold text-[var(--success)]">
                {results.goalWeight.toLocaleString()}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">Goal Weight ({results.weightUnit})</span>
            </div>
            <div className="p-4 bg-[var(--bg-secondary)] rounded-lg text-center">
              <span className="block text-2xl font-bold text-[var(--warning)]">
                {results.fatToLose.toLocaleString()}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">Fat to Lose ({results.weightUnit})</span>
            </div>
          </ResultGrid>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center py-2 border-b border-[var(--bg-tertiary)]">
              <span className="text-[var(--text-secondary)]">Current Lean Mass</span>
              <span className="font-medium">{results.leanMass} {results.weightUnit}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--bg-tertiary)]">
              <span className="text-[var(--text-secondary)]">Current Fat Mass</span>
              <span className="font-medium">{results.currentFatMass} {results.weightUnit}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--bg-tertiary)]">
              <span className="text-[var(--text-secondary)]">Goal Fat Mass</span>
              <span className="font-medium">{results.goalFatMass} {results.weightUnit}</span>
            </div>
          </div>

          <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
            <p className="text-xs text-[var(--text-secondary)]">
              <strong>Formula:</strong> Goal Weight = Lean Mass ÷ (1 - Target BF%). Assumes lean mass is preserved during weight loss.
            </p>
          </div>
        </ResultCard>
      )}
    </div>
  )
}
