import { useState, useMemo } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  ToggleButton,
  ResultDisplay,
  ResultCard,
  ResultGrid,
} from '../components'
import { calculateBodyFat } from '../lib/bodyfat'

// Helper for height conversion (also in tdee.js but keeping bodyfat self-contained)
function feetInchesToInchesLocal(feet, inches) {
  return feet * 12 + inches
}

export function BodyFatCalculator() {
  const [sex, setSex] = useState('male')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState('lbs')
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [heightUnit, setHeightUnit] = useState('ft')
  const [measurementUnit, setMeasurementUnit] = useState('in')
  const [neck, setNeck] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')

  const results = useMemo(() => {
    const weightNum = parseFloat(weight)
    const neckNum = parseFloat(neck)
    const waistNum = parseFloat(waist)
    const hipNum = parseFloat(hip)

    let heightValue
    if (heightUnit === 'ft') {
      const feet = parseFloat(heightFeet) || 0
      const inches = parseFloat(heightInches) || 0
      heightValue = feetInchesToInchesLocal(feet, inches)
    } else {
      heightValue = parseFloat(heightCm)
    }

    if (!weightNum || !heightValue || !neckNum || !waistNum) {
      return null
    }

    if (sex === 'female' && !hipNum) {
      return null
    }

    return calculateBodyFat({
      sex,
      weight: weightNum,
      weightUnit,
      height: heightValue,
      heightUnit: heightUnit === 'ft' ? 'in' : 'cm',
      neck: neckNum,
      waist: waistNum,
      hip: hipNum || undefined,
      measurementUnit,
    })
  }, [sex, weight, weightUnit, heightFeet, heightInches, heightCm, heightUnit, measurementUnit, neck, waist, hip])

  const getCategoryColor = (color) => {
    const colors = {
      success: 'success',
      warning: 'warning',
      error: 'error',
    }
    return colors[color] || 'primary'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Navy Body Fat Calculator</CardTitle>
          <CardDescription>
            Estimate your body fat percentage using the U.S. Navy circumference method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="border-t border-[var(--bg-tertiary)] pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[var(--text-secondary)]">Measurements</span>
              <ToggleButton
                options={[
                  { value: 'in', label: 'inches' },
                  { value: 'cm', label: 'cm' },
                ]}
                value={measurementUnit}
                onChange={setMeasurementUnit}
              />
            </div>

            <div className="space-y-4">
              <Input
                label="Neck circumference"
                id="neck"
                value={neck}
                onChange={(e) => setNeck(e.target.value)}
                placeholder={measurementUnit === 'in' ? '15' : '38'}
                min="1"
              />

              <Input
                label="Waist circumference (at navel)"
                id="waist"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder={measurementUnit === 'in' ? '34' : '86'}
                min="1"
              />

              {sex === 'female' && (
                <Input
                  label="Hip circumference (at widest)"
                  id="hip"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  placeholder={measurementUnit === 'in' ? '38' : '97'}
                  min="1"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {results && (
        <ResultCard>
          <div className="text-center mb-6">
            <ResultDisplay
              label="Body Fat Percentage"
              value={results.bodyFatPercentage}
              unit="%"
              size="lg"
              color={getCategoryColor(results.category.color)}
            />
            <div className={`
              inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium
              ${results.category.color === 'success' ? 'bg-[var(--success)]/20 text-[var(--success)]' : ''}
              ${results.category.color === 'warning' ? 'bg-[var(--warning)]/20 text-[var(--warning)]' : ''}
              ${results.category.color === 'error' ? 'bg-[var(--error)]/20 text-[var(--error)]' : ''}
            `}>
              {results.category.label}
            </div>
          </div>

          <ResultGrid>
            <ResultDisplay
              label="Fat Mass"
              value={results.fatMass.toFixed(1)}
              unit="lbs"
              size="md"
              color="warning"
            />
            <ResultDisplay
              label="Lean Mass"
              value={results.leanMass.toFixed(1)}
              unit="lbs"
              size="md"
              color="success"
            />
          </ResultGrid>

          <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg">
            <p className="text-xs text-[var(--text-secondary)]">
              <strong>Note:</strong> The Navy method provides an estimate. For precise measurements,
              consider DEXA scanning or hydrostatic weighing.
            </p>
          </div>
        </ResultCard>
      )}
    </div>
  )
}
