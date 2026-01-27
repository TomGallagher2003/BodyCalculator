import { describe, it, expect } from 'vitest'
import {
  inchesToCm,
  cmToInches,
  calculateMaleBodyFat,
  calculateFemaleBodyFat,
  getBodyFatCategory,
  calculateMassComposition,
  calculateBodyFat,
  BODY_FAT_CATEGORIES,
} from './bodyfat'

describe('Unit Conversions', () => {
  describe('inchesToCm', () => {
    it('converts 36 inches to 91.44 cm', () => {
      expect(inchesToCm(36)).toBeCloseTo(91.44, 1)
    })
  })

  describe('cmToInches', () => {
    it('converts 90 cm to ~35.43 inches', () => {
      expect(cmToInches(90)).toBeCloseTo(35.43, 1)
    })
  })
})

describe('calculateMaleBodyFat', () => {
  it('calculates body fat for typical male measurements', () => {
    // 34 inch waist, 15 inch neck, 70 inch height
    const bf = calculateMaleBodyFat(34, 15, 70)
    expect(bf).toBeGreaterThan(10)
    expect(bf).toBeLessThan(25)
  })

  it('returns lower body fat for leaner measurements', () => {
    // 30 inch waist, 16 inch neck, 72 inch height
    const bf = calculateMaleBodyFat(30, 16, 72)
    expect(bf).toBeLessThan(15)
  })

  it('returns higher body fat for larger waist', () => {
    // 40 inch waist, 15 inch neck, 70 inch height
    const bf = calculateMaleBodyFat(40, 15, 70)
    expect(bf).toBeGreaterThan(20)
  })

  it('never returns negative values', () => {
    // Even with extreme values, should not be negative
    const bf = calculateMaleBodyFat(15, 20, 80)
    expect(bf).toBeGreaterThanOrEqual(0)
  })
})

describe('calculateFemaleBodyFat', () => {
  it('calculates body fat for typical female measurements', () => {
    // 30 inch waist, 38 inch hip, 13 inch neck, 65 inch height
    const bf = calculateFemaleBodyFat(30, 38, 13, 65)
    expect(bf).toBeGreaterThan(15)
    expect(bf).toBeLessThan(35)
  })

  it('returns lower body fat for leaner measurements', () => {
    // 26 inch waist, 35 inch hip, 13 inch neck, 66 inch height
    const bf = calculateFemaleBodyFat(26, 35, 13, 66)
    expect(bf).toBeLessThan(25)
  })

  it('never returns negative values', () => {
    const bf = calculateFemaleBodyFat(20, 30, 15, 70)
    expect(bf).toBeGreaterThanOrEqual(0)
  })
})

describe('getBodyFatCategory', () => {
  describe('male categories', () => {
    it('returns Essential Fat for <6%', () => {
      const category = getBodyFatCategory(4, 'male')
      expect(category.label).toBe('Essential Fat')
    })

    it('returns Athletic for 6-13%', () => {
      const category = getBodyFatCategory(10, 'male')
      expect(category.label).toBe('Athletic')
    })

    it('returns Fitness for 14-17%', () => {
      const category = getBodyFatCategory(15, 'male')
      expect(category.label).toBe('Fitness')
    })

    it('returns Average for 18-24%', () => {
      const category = getBodyFatCategory(20, 'male')
      expect(category.label).toBe('Average')
    })

    it('returns Obese for >24%', () => {
      const category = getBodyFatCategory(30, 'male')
      expect(category.label).toBe('Obese')
    })
  })

  describe('female categories', () => {
    it('returns Essential Fat for <14%', () => {
      const category = getBodyFatCategory(12, 'female')
      expect(category.label).toBe('Essential Fat')
    })

    it('returns Athletic for 14-20%', () => {
      const category = getBodyFatCategory(18, 'female')
      expect(category.label).toBe('Athletic')
    })

    it('returns Fitness for 21-24%', () => {
      const category = getBodyFatCategory(22, 'female')
      expect(category.label).toBe('Fitness')
    })

    it('returns Average for 25-31%', () => {
      const category = getBodyFatCategory(28, 'female')
      expect(category.label).toBe('Average')
    })

    it('returns Obese for >31%', () => {
      const category = getBodyFatCategory(35, 'female')
      expect(category.label).toBe('Obese')
    })
  })
})

describe('calculateMassComposition', () => {
  it('calculates fat and lean mass correctly', () => {
    // 20% body fat at 180 lbs = 36 lbs fat, 144 lbs lean
    const { fatMass, leanMass } = calculateMassComposition(20, 180)
    expect(fatMass).toBe(36)
    expect(leanMass).toBe(144)
  })

  it('handles decimal percentages', () => {
    const { fatMass, leanMass } = calculateMassComposition(15.5, 200)
    expect(fatMass).toBe(31)
    expect(leanMass).toBe(169)
  })
})

describe('calculateBodyFat', () => {
  it('calculates full body fat analysis for male with imperial units', () => {
    const result = calculateBodyFat({
      sex: 'male',
      weight: 180,
      weightUnit: 'lbs',
      height: 70,
      heightUnit: 'in',
      neck: 15,
      waist: 34,
      measurementUnit: 'in',
    })

    expect(result.bodyFatPercentage).toBeGreaterThan(0)
    expect(result.category).toHaveProperty('label')
    expect(result.fatMass).toBeGreaterThan(0)
    expect(result.leanMass).toBeGreaterThan(0)
    expect(result.fatMass + result.leanMass).toBeCloseTo(180, 0)
  })

  it('calculates full body fat analysis for female with metric units', () => {
    const result = calculateBodyFat({
      sex: 'female',
      weight: 65,
      weightUnit: 'kg',
      height: 165,
      heightUnit: 'cm',
      neck: 33,
      waist: 76,
      hip: 97,
      measurementUnit: 'cm',
    })

    expect(result.bodyFatPercentage).toBeGreaterThan(0)
    expect(result.category).toHaveProperty('label')
    expect(result.fatMass).toBeGreaterThan(0)
    expect(result.leanMass).toBeGreaterThan(0)
  })

  it('converts metric measurements correctly', () => {
    // Same measurements in different units should give similar results
    const imperialResult = calculateBodyFat({
      sex: 'male',
      weight: 180,
      weightUnit: 'lbs',
      height: 70,
      heightUnit: 'in',
      neck: 15,
      waist: 34,
      measurementUnit: 'in',
    })

    const metricResult = calculateBodyFat({
      sex: 'male',
      weight: 81.6,
      weightUnit: 'kg',
      height: 177.8,
      heightUnit: 'cm',
      neck: 38.1,
      waist: 86.36,
      measurementUnit: 'cm',
    })

    // Should be within 1% of each other
    expect(metricResult.bodyFatPercentage).toBeCloseTo(imperialResult.bodyFatPercentage, 0)
  })
})

describe('BODY_FAT_CATEGORIES', () => {
  it('has male categories', () => {
    expect(BODY_FAT_CATEGORIES.male).toHaveLength(5)
  })

  it('has female categories', () => {
    expect(BODY_FAT_CATEGORIES.female).toHaveLength(5)
  })

  it('categories cover full range', () => {
    // Male categories should cover 0-100%
    const maleRanges = BODY_FAT_CATEGORIES.male
    expect(maleRanges[0].min).toBe(0)
    expect(maleRanges[maleRanges.length - 1].max).toBe(100)
  })
})
