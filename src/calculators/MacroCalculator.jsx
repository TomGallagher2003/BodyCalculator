import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
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
  SaveProgressButton,
} from '../components'
import { ENTRY_TYPES } from '../lib/progress'
import { calculateMacros, kgToLbs, proteinGramsToPercentage } from '../lib/macros'

const QUICK_ADJUSTMENTS = [
  { value: -500, label: '-500' },
  { value: -250, label: '-250' },
  { value: 0, label: '0' },
  { value: 250, label: '+250' },
  { value: 500, label: '+500' },
]

const DEFAULT_PROTEIN_MULTIPLIER = 1
const DEFAULT_FAT_PERCENTAGE = 25

export function MacroCalculator({ initialTDEE, initialWeight, initialWeightUnit }) {
  const [tdee, setTdee] = useState(initialTDEE?.toString() || '')
  const [bodyweight, setBodyweight] = useState(initialWeight?.toString() || '')
  const [weightUnit, setWeightUnit] = useState(initialWeightUnit || 'kg')
  const [customAdjustment, setCustomAdjustment] = useState(0)
  const [showCustomRules, setShowCustomRules] = useState(false)
  const [proteinMultiplier, setProteinMultiplier] = useState(DEFAULT_PROTEIN_MULTIPLIER)
  const [fatPercentage, setFatPercentage] = useState(DEFAULT_FAT_PERCENTAGE)

  const displayTdee = tdee || (initialTDEE?.toString() ?? '')
  const displayWeight = bodyweight || (initialWeight?.toString() ?? '')

  const formatAdjustment = (val) => {
    const num = parseInt(val, 10)
    if (num > 0) return `+${num} cal`
    if (num < 0) return `${num} cal`
    return 'Maintenance'
  }

  const bodyweightLbs = useMemo(() => {
    const weightNum = parseFloat(displayWeight)
    if (!weightNum) return 0
    return weightUnit === 'kg' ? kgToLbs(weightNum) : weightNum
  }, [displayWeight, weightUnit])

  const targetCalories = useMemo(() => {
    const tdeeNum = parseFloat(displayTdee)
    if (!tdeeNum) return 0
    return tdeeNum + parseInt(customAdjustment, 10)
  }, [displayTdee, customAdjustment])

  const proteinPercentageDisplay = useMemo(() => {
    if (!bodyweightLbs || !targetCalories) return 0
    return proteinGramsToPercentage(proteinMultiplier, bodyweightLbs, targetCalories)
  }, [proteinMultiplier, bodyweightLbs, targetCalories])

  const results = useMemo(() => {
    const tdeeNum = parseFloat(displayTdee)
    const weightNum = parseFloat(displayWeight)

    if (!tdeeNum || !weightNum) {
      return null
    }

    return calculateMacros({
      tdee: tdeeNum,
      bodyweightLbs,
      goal: 'maintain',
      customAdjustment: parseInt(customAdjustment, 10),
      proteinMultiplier,
      fatPercentage: fatPercentage / 100,
    })
  }, [displayTdee, displayWeight, bodyweightLbs, customAdjustment, proteinMultiplier, fatPercentage])

  const resetCustomRules = () => {
    setProteinMultiplier(DEFAULT_PROTEIN_MULTIPLIER)
    setFatPercentage(DEFAULT_FAT_PERCENTAGE)
  }

  const isCustomRulesModified = proteinMultiplier !== DEFAULT_PROTEIN_MULTIPLIER || fatPercentage !== DEFAULT_FAT_PERCENTAGE

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

          {/* Custom Macro Rules Section */}
          <div className="border-t border-[var(--bg-tertiary)] pt-4">
            <button
              type="button"
              onClick={() => setShowCustomRules(!showCustomRules)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-primary)]">Custom Macro Rules</span>
                {isCustomRulesModified && (
                  <span className="px-2 py-0.5 text-xs bg-[var(--accent)] text-[var(--bg-primary)] rounded-full">
                    Modified
                  </span>
                )}
              </div>
              {showCustomRules ? (
                <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
              )}
            </button>

            {showCustomRules && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-[var(--text-secondary)]">
                      Protein (g/lb)
                    </label>
                    <span className="text-xs text-[var(--accent)]">
                      {proteinPercentageDisplay}% of calories
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.6"
                      max="1.5"
                      step="0.05"
                      value={proteinMultiplier}
                      onChange={(e) => setProteinMultiplier(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer
                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                                 [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:rounded-full
                                 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
                                 [&::-webkit-slider-thumb]:hover:scale-110"
                    />
                    <input
                      type="number"
                      min="0.6"
                      max="1.5"
                      step="0.05"
                      value={proteinMultiplier}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        if (!isNaN(val) && val >= 0.6 && val <= 1.5) {
                          setProteinMultiplier(val)
                        }
                      }}
                      className="w-20 px-2 py-1 text-sm text-center bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg
                                 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                    <span>0.6 g/lb</span>
                    <span>1.5 g/lb</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-[var(--text-secondary)]">
                      Fat (% of calories)
                    </label>
                    <span className="text-xs text-[var(--accent)]">
                      {results ? results.fat : 0}g
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="15"
                      max="45"
                      step="1"
                      value={fatPercentage}
                      onChange={(e) => setFatPercentage(parseInt(e.target.value, 10))}
                      className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer
                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                                 [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:rounded-full
                                 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
                                 [&::-webkit-slider-thumb]:hover:scale-110"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="15"
                        max="45"
                        step="1"
                        value={fatPercentage}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10)
                          if (!isNaN(val) && val >= 15 && val <= 45) {
                            setFatPercentage(val)
                          }
                        }}
                        className="w-16 px-2 py-1 text-sm text-center bg-[var(--bg-tertiary)] border border-[var(--bg-tertiary)] rounded-lg
                                   text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                      />
                      <span className="text-sm text-[var(--text-secondary)]">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                    <span>15%</span>
                    <span>45%</span>
                  </div>
                </div>

                {/* Live percentage breakdown */}
                {results && (
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                    <div className="text-xs text-[var(--text-secondary)] mb-2">Current Split:</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${results.breakdown.proteinPercentage}%` }}
                        />
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${results.breakdown.carbPercentage}%` }}
                        />
                        <div
                          className="h-full bg-yellow-500"
                          style={{ width: `${results.breakdown.fatPercentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <span className="text-blue-500">P: {results.breakdown.proteinPercentage}%</span>
                      <span className="text-green-500">C: {results.breakdown.carbPercentage}%</span>
                      <span className="text-yellow-500">F: {results.breakdown.fatPercentage}%</span>
                    </div>
                  </div>
                )}

                {isCustomRulesModified && (
                  <button
                    type="button"
                    onClick={resetCustomRules}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                               bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Defaults
                  </button>
                )}
              </div>
            )}
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
              <strong>Formula:</strong> Protein = {proteinMultiplier}g/lb bodyweight, Fat = {fatPercentage}% of calories, Carbs = remaining calories
              {isCustomRulesModified && <span className="text-[var(--accent)]"> (custom)</span>}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--bg-secondary)]">
            <SaveProgressButton
              entryType={ENTRY_TYPES.MACROS}
              data={{
                calories: results.targetCalories,
                protein: results.protein,
                carbs: results.carbs,
                fat: results.fat,
                weight: bodyweightLbs,
                weightUnit: 'lbs',
              }}
            />
          </div>
        </ResultCard>
      )}
    </div>
  )
}
