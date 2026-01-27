import { useState, useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Select,
  Button,
  ToggleButton,
  ResultDisplay,
  ResultCard,
  ResultGrid,
} from '../components'
import { calculateFullTDEE, ACTIVITY_LEVELS, feetInchesToInches } from '../lib/tdee'

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

  const activityOptions = Object.entries(ACTIVITY_LEVELS).map(([key, val]) => ({
    value: key,
    label: `${val.label} - ${val.description}`,
  }))

  const results = useMemo(() => {
    const ageNum = parseFloat(age)
    const weightNum = parseFloat(weight)

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
    })
  }, [age, weight, weightUnit, heightFeet, heightInches, heightCm, heightUnit, sex, activityLevel])

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
        </CardContent>
      </Card>

      {results && (
        <ResultCard>
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
