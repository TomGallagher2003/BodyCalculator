import { useState, useMemo } from 'react'
import { ArrowRight, ChevronDown, ChevronUp, X } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Slider,
  Select,
  Button,
  ToggleButton,
  ResultDisplay,
  ResultCard,
  ResultGrid,
} from '../components'
import { calculateFullTDEE, ACTIVITY_LEVELS, feetInchesToInches, kgToLbs } from '../lib/tdee'

export function TDEECalculator({ onUseTDEE }) {
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState('lbs')
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [heightUnit, setHeightUnit] = useState('ft')
  const [sex, setSex] = useState('male')
  const [activityLevel, setActivityLevel] = useState('moderate')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [bodyFatPercent, setBodyFatPercent] = useState('')

  const activityOptions = Object.entries(ACTIVITY_LEVELS).map(([key, val]) => ({
    value: key,
    label: `${val.label} - ${val.description}`,
  }))

  const results = useMemo(() => {
    const ageNum = parseFloat(age)
    const weightNum = parseFloat(weight)
    const bfPercent = bodyFatPercent ? parseFloat(bodyFatPercent) : null

    let heightValue
    if (heightUnit === 'ft') {
      const feet = parseFloat(heightFeet) || 0
      const inches = parseFloat(heightInches) || 0
      heightValue = feetInchesToInches(feet, inches)
    } else {
      heightValue = parseFloat(heightCm)
    }

    if (!ageNum || !weightNum || !heightValue) {
      return null
    }

    return calculateFullTDEE({
      weight: weightNum,
      weightUnit,
      height: heightValue,
      heightUnit: heightUnit === 'ft' ? 'in' : 'cm',
      age: ageNum,
      sex,
      activityLevel,
      bodyFatPercent: bfPercent,
    })
  }, [age, weight, weightUnit, heightFeet, heightInches, heightCm, heightUnit, sex, activityLevel, bodyFatPercent])

  const handleUseTDEE = () => {
    if (results && onUseTDEE) {
      onUseTDEE(results.tdee, parseFloat(weight), weightUnit)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>TDEE Calculator</CardTitle>
          <CardDescription>
            Calculate your Total Daily Energy Expenditure using the Mifflin-St Jeor formula
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Age"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
              min="1"
              max="120"
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Sex</label>
              <ToggleButton
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
                value={sex}
                onChange={setSex}
                className="w-full justify-center"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Weight</label>
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Height</label>
              <ToggleButton
                options={[
                  { value: 'ft', label: 'ft/in' },
                  { value: 'cm', label: 'cm' },
                ]}
                value={heightUnit}
                onChange={setHeightUnit}
              />
            </div>
            {heightUnit === 'ft' ? (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="height-feet"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  placeholder="5"
                  min="1"
                  max="8"
                />
                <Input
                  id="height-inches"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  placeholder="10"
                  min="0"
                  max="11"
                />
              </div>
            ) : (
              <Input
                id="height-cm"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="178"
                min="1"
              />
            )}
          </div>

          <Select
            label="Activity Level"
            id="activity"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            options={activityOptions}
          />

          {/* Advanced Section - Body Fat % */}
          <div className="border-t border-[var(--bg-tertiary)] pt-4 mt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
            >
              <span>Advanced Options</span>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-[var(--bg-tertiary)] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Body Fat % <span className="text-xs">(optional)</span>
                  </span>
                  {bodyFatPercent && (
                    <button
                      type="button"
                      onClick={() => setBodyFatPercent('')}
                      className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                <Slider
                  id="body-fat"
                  value={bodyFatPercent || 20}
                  onChange={(e) => setBodyFatPercent(e.target.value)}
                  min={5}
                  max={50}
                  step={0.5}
                  valueFormatter={(v) => `${v}%`}
                />

                <div className="flex items-center gap-2">
                  <Input
                    id="body-fat-input"
                    value={bodyFatPercent}
                    onChange={(e) => setBodyFatPercent(e.target.value)}
                    placeholder="Enter body fat %"
                    min={5}
                    max={50}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-[var(--text-secondary)]">%</span>
                </div>

                {bodyFatPercent && (
                  <div className="text-xs text-[var(--accent)] bg-[var(--bg-secondary)] px-3 py-2 rounded">
                    Using Katch-McArdle formula (more accurate with known body fat %)
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {results && (
        <ResultCard>
          {results.formula === 'katch-mcardle' && (
            <div className="mb-4 pb-4 border-b border-[var(--bg-tertiary)]">
              <div className="text-xs text-[var(--accent)] font-medium mb-2">
                Katch-McArdle Formula
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                Lean Mass: <span className="text-[var(--text-primary)] font-medium">
                  {weightUnit === 'lbs'
                    ? `${Math.round(kgToLbs(results.leanMassKg))} lbs`
                    : `${Math.round(results.leanMassKg)} kg`
                  }
                </span>
              </div>
            </div>
          )}
          <ResultGrid>
            <ResultDisplay
              label="Basal Metabolic Rate"
              value={results.bmr.toLocaleString()}
              unit="cal/day"
              size="md"
              color="primary"
            />
            <ResultDisplay
              label="Total Daily Energy Expenditure"
              value={results.tdee.toLocaleString()}
              unit="cal/day"
              size="lg"
              color="accent"
            />
          </ResultGrid>
          {results.formula === 'mifflin-st-jeor' && (
            <div className="mt-4 text-xs text-[var(--text-secondary)] text-center">
              Using Mifflin-St Jeor formula
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-[var(--bg-secondary)]">
            <Button onClick={handleUseTDEE} className="w-full flex items-center justify-center gap-2">
              Use for Macro Calculator
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </ResultCard>
      )}
    </div>
  )
}
