import { describe, it, expect } from 'vitest'
import {
  lbsToKg,
  kgToLbs,
  inchesToCm,
  cmToInches,
  feetInchesToInches,
  calculateBMR,
  calculateBMRKatchMcArdle,
  calculateLeanMass,
  calculateTDEE,
  calculateFullTDEE,
  ACTIVITY_LEVELS,
} from './tdee'

describe('Unit Conversions', () => {
  describe('lbsToKg', () => {
    it('converts 150 lbs to ~68 kg', () => {
      expect(lbsToKg(150)).toBeCloseTo(68.04, 1)
    })

    it('converts 200 lbs to ~90.7 kg', () => {
      expect(lbsToKg(200)).toBeCloseTo(90.72, 1)
    })
  })

  describe('kgToLbs', () => {
    it('converts 70 kg to ~154.3 lbs', () => {
      expect(kgToLbs(70)).toBeCloseTo(154.32, 1)
    })
  })

  describe('inchesToCm', () => {
    it('converts 70 inches to 177.8 cm', () => {
      expect(inchesToCm(70)).toBeCloseTo(177.8, 1)
    })
  })

  describe('cmToInches', () => {
    it('converts 180 cm to ~70.87 inches', () => {
      expect(cmToInches(180)).toBeCloseTo(70.87, 1)
    })
  })

  describe('feetInchesToInches', () => {
    it('converts 5 feet 10 inches to 70 inches', () => {
      expect(feetInchesToInches(5, 10)).toBe(70)
    })

    it('converts 6 feet 0 inches to 72 inches', () => {
      expect(feetInchesToInches(6, 0)).toBe(72)
    })
  })
})

describe('calculateLeanMass', () => {
  it('calculates lean mass for 80kg at 20% body fat', () => {
    const leanMass = calculateLeanMass(80, 20)
    expect(leanMass).toBe(64)
  })

  it('calculates lean mass for 100kg at 15% body fat', () => {
    const leanMass = calculateLeanMass(100, 15)
    expect(leanMass).toBe(85)
  })

  it('calculates lean mass for 70kg at 30% body fat', () => {
    const leanMass = calculateLeanMass(70, 30)
    expect(leanMass).toBe(49)
  })
})

describe('calculateBMRKatchMcArdle', () => {
  it('calculates BMR for 64kg lean mass', () => {
    const bmr = calculateBMRKatchMcArdle(64)
    // 370 + (21.6 * 64) = 370 + 1382.4 = 1752.4 -> 1752
    expect(bmr).toBe(1752)
  })

  it('calculates BMR for 50kg lean mass', () => {
    const bmr = calculateBMRKatchMcArdle(50)
    // 370 + (21.6 * 50) = 370 + 1080 = 1450
    expect(bmr).toBe(1450)
  })

  it('calculates BMR for 80kg lean mass', () => {
    const bmr = calculateBMRKatchMcArdle(80)
    // 370 + (21.6 * 80) = 370 + 1728 = 2098
    expect(bmr).toBe(2098)
  })
})

describe('calculateBMR', () => {
  it('calculates BMR for a 30 year old male, 80kg, 180cm', () => {
    const bmr = calculateBMR({
      weightKg: 80,
      heightCm: 180,
      age: 30,
      sex: 'male',
    })
    // (10 * 80) + (6.25 * 180) - (5 * 30) + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(bmr).toBe(1780)
  })

  it('calculates BMR for a 30 year old female, 60kg, 165cm', () => {
    const bmr = calculateBMR({
      weightKg: 60,
      heightCm: 165,
      age: 30,
      sex: 'female',
    })
    // (10 * 60) + (6.25 * 165) - (5 * 30) - 161 = 600 + 1031.25 - 150 - 161 = 1320
    expect(bmr).toBe(1320)
  })

  it('calculates BMR for a 25 year old male, 70kg, 175cm', () => {
    const bmr = calculateBMR({
      weightKg: 70,
      heightCm: 175,
      age: 25,
      sex: 'male',
    })
    // (10 * 70) + (6.25 * 175) - (5 * 25) + 5 = 700 + 1093.75 - 125 + 5 = 1674
    expect(bmr).toBe(1674)
  })
})

describe('calculateTDEE', () => {
  it('calculates TDEE with sedentary activity', () => {
    const tdee = calculateTDEE(1800, 'sedentary')
    expect(tdee).toBe(Math.round(1800 * 1.2))
  })

  it('calculates TDEE with moderate activity', () => {
    const tdee = calculateTDEE(1800, 'moderate')
    expect(tdee).toBe(Math.round(1800 * 1.55))
  })

  it('calculates TDEE with very active activity', () => {
    const tdee = calculateTDEE(1800, 'veryActive')
    expect(tdee).toBe(Math.round(1800 * 1.9))
  })

  it('defaults to sedentary for unknown activity level', () => {
    const tdee = calculateTDEE(1800, 'unknown')
    expect(tdee).toBe(Math.round(1800 * 1.2))
  })
})

describe('calculateFullTDEE', () => {
  it('calculates full TDEE with imperial units', () => {
    const result = calculateFullTDEE({
      weight: 180,
      weightUnit: 'lbs',
      height: 70,
      heightUnit: 'in',
      age: 30,
      sex: 'male',
      activityLevel: 'moderate',
    })

    expect(result.bmr).toBeGreaterThan(1500)
    expect(result.bmr).toBeLessThan(2000)
    expect(result.tdee).toBeGreaterThan(result.bmr)
    expect(result.formula).toBe('mifflin-st-jeor')
    expect(result.leanMassKg).toBeNull()
  })

  it('calculates full TDEE with metric units', () => {
    const result = calculateFullTDEE({
      weight: 80,
      weightUnit: 'kg',
      height: 180,
      heightUnit: 'cm',
      age: 30,
      sex: 'male',
      activityLevel: 'moderate',
    })

    expect(result.bmr).toBe(1780)
    expect(result.tdee).toBe(Math.round(1780 * 1.55))
    expect(result.formula).toBe('mifflin-st-jeor')
  })

  it('uses Katch-McArdle formula when body fat % is provided', () => {
    const result = calculateFullTDEE({
      weight: 80,
      weightUnit: 'kg',
      height: 180,
      heightUnit: 'cm',
      age: 30,
      sex: 'male',
      activityLevel: 'moderate',
      bodyFatPercent: 20,
    })

    // Lean mass = 80 * (1 - 0.20) = 64 kg
    // BMR = 370 + (21.6 * 64) = 1752
    expect(result.formula).toBe('katch-mcardle')
    expect(result.leanMassKg).toBe(64)
    expect(result.bmr).toBe(1752)
    expect(result.tdee).toBe(Math.round(1752 * 1.55))
  })

  it('uses Mifflin-St Jeor when body fat is null', () => {
    const result = calculateFullTDEE({
      weight: 80,
      weightUnit: 'kg',
      height: 180,
      heightUnit: 'cm',
      age: 30,
      sex: 'male',
      activityLevel: 'moderate',
      bodyFatPercent: null,
    })

    expect(result.formula).toBe('mifflin-st-jeor')
    expect(result.bmr).toBe(1780)
  })

  it('uses Mifflin-St Jeor when body fat is 0', () => {
    const result = calculateFullTDEE({
      weight: 80,
      weightUnit: 'kg',
      height: 180,
      heightUnit: 'cm',
      age: 30,
      sex: 'male',
      activityLevel: 'moderate',
      bodyFatPercent: 0,
    })

    expect(result.formula).toBe('mifflin-st-jeor')
    expect(result.bmr).toBe(1780)
  })

  it('calculates correct TDEE with Katch-McArdle and imperial units', () => {
    const result = calculateFullTDEE({
      weight: 180,
      weightUnit: 'lbs',
      height: 70,
      heightUnit: 'in',
      age: 30,
      sex: 'male',
      activityLevel: 'sedentary',
      bodyFatPercent: 15,
    })

    // 180 lbs = ~81.6 kg
    // Lean mass = 81.6 * 0.85 = ~69.4 kg
    // BMR = 370 + (21.6 * 69.4) = ~1869
    expect(result.formula).toBe('katch-mcardle')
    expect(result.leanMassKg).toBeCloseTo(69.4, 0)
    expect(result.bmr).toBeGreaterThan(1800)
    expect(result.bmr).toBeLessThan(1900)
  })
})

describe('ACTIVITY_LEVELS', () => {
  it('has all expected activity levels', () => {
    expect(ACTIVITY_LEVELS).toHaveProperty('sedentary')
    expect(ACTIVITY_LEVELS).toHaveProperty('light')
    expect(ACTIVITY_LEVELS).toHaveProperty('moderate')
    expect(ACTIVITY_LEVELS).toHaveProperty('active')
    expect(ACTIVITY_LEVELS).toHaveProperty('veryActive')
  })

  it('has correct multiplier values', () => {
    expect(ACTIVITY_LEVELS.sedentary.value).toBe(1.2)
    expect(ACTIVITY_LEVELS.light.value).toBe(1.375)
    expect(ACTIVITY_LEVELS.moderate.value).toBe(1.55)
    expect(ACTIVITY_LEVELS.active.value).toBe(1.725)
    expect(ACTIVITY_LEVELS.veryActive.value).toBe(1.9)
  })
})
