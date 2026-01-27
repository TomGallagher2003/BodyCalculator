import { describe, it, expect } from 'vitest'
import {
  calculateTargetCalories,
  calculateProtein,
  calculateFat,
  calculateCarbs,
  calculateMacros,
  kgToLbs,
  GOALS,
  CALORIES_PER_GRAM,
} from './macros'

describe('calculateTargetCalories', () => {
  it('subtracts 500 calories for cut', () => {
    expect(calculateTargetCalories(2500, 'cut')).toBe(2000)
  })

  it('maintains calories for maintain', () => {
    expect(calculateTargetCalories(2500, 'maintain')).toBe(2500)
  })

  it('maintains calories for recomp', () => {
    expect(calculateTargetCalories(2500, 'recomp')).toBe(2500)
  })

  it('adds 250 calories for lean bulk', () => {
    expect(calculateTargetCalories(2500, 'lean_bulk')).toBe(2750)
  })

  it('adds 500 calories for bulk', () => {
    expect(calculateTargetCalories(2500, 'bulk')).toBe(3000)
  })

  it('defaults to no adjustment for unknown goal', () => {
    expect(calculateTargetCalories(2500, 'unknown')).toBe(2500)
  })
})

describe('calculateProtein', () => {
  it('calculates 1g per lb by default', () => {
    expect(calculateProtein(180)).toBe(180)
  })

  it('calculates with custom multiplier', () => {
    expect(calculateProtein(180, 1.2)).toBe(216)
  })

  it('rounds to nearest gram', () => {
    expect(calculateProtein(175, 1.1)).toBe(193)
  })
})

describe('calculateFat', () => {
  it('calculates 25% of calories by default', () => {
    // 2000 * 0.25 = 500 calories / 9 = 55.56 -> 56g
    expect(calculateFat(2000)).toBe(56)
  })

  it('calculates with custom percentage', () => {
    // 2000 * 0.30 = 600 calories / 9 = 66.67 -> 67g
    expect(calculateFat(2000, 0.30)).toBe(67)
  })
})

describe('calculateCarbs', () => {
  it('calculates remaining calories as carbs', () => {
    // 2000 total - (180 * 4) - (56 * 9) = 2000 - 720 - 504 = 776 / 4 = 194g
    expect(calculateCarbs(2000, 180, 56)).toBe(194)
  })

  it('returns 0 if protein and fat exceed target', () => {
    // If macros exceed calories, carbs should be 0
    expect(calculateCarbs(1000, 200, 100)).toBe(0)
  })
})

describe('calculateMacros', () => {
  it('calculates full macro split for 180lb person on cut', () => {
    const result = calculateMacros({
      tdee: 2500,
      bodyweightLbs: 180,
      goal: 'cut',
    })

    expect(result.targetCalories).toBe(2000)
    expect(result.protein).toBe(180) // 1g per lb
    expect(result.fat).toBe(56) // 25% of 2000 / 9
    // Remaining: 2000 - (180*4) - (56*9) = 2000 - 720 - 504 = 776 / 4 = 194
    expect(result.carbs).toBe(194)
  })

  it('calculates full macro split for bulk', () => {
    const result = calculateMacros({
      tdee: 2500,
      bodyweightLbs: 180,
      goal: 'bulk',
    })

    expect(result.targetCalories).toBe(3000)
    expect(result.protein).toBe(180)
  })

  it('includes percentage breakdown', () => {
    const result = calculateMacros({
      tdee: 2500,
      bodyweightLbs: 180,
      goal: 'maintain',
    })

    expect(result.breakdown).toHaveProperty('proteinPercentage')
    expect(result.breakdown).toHaveProperty('fatPercentage')
    expect(result.breakdown).toHaveProperty('carbPercentage')

    // Percentages should roughly sum to 100
    const totalPercentage =
      result.breakdown.proteinPercentage +
      result.breakdown.fatPercentage +
      result.breakdown.carbPercentage
    expect(totalPercentage).toBeGreaterThanOrEqual(99)
    expect(totalPercentage).toBeLessThanOrEqual(101)
  })

  it('allows custom protein multiplier', () => {
    const result = calculateMacros({
      tdee: 2500,
      bodyweightLbs: 180,
      goal: 'maintain',
      proteinMultiplier: 1.2,
    })

    expect(result.protein).toBe(216) // 180 * 1.2
  })
})

describe('kgToLbs', () => {
  it('converts kg to lbs correctly', () => {
    expect(kgToLbs(80)).toBeCloseTo(176.37, 1)
  })
})

describe('GOALS', () => {
  it('has all expected goals', () => {
    expect(GOALS).toHaveProperty('cut')
    expect(GOALS).toHaveProperty('maintain')
    expect(GOALS).toHaveProperty('recomp')
    expect(GOALS).toHaveProperty('lean_bulk')
    expect(GOALS).toHaveProperty('bulk')
  })
})

describe('CALORIES_PER_GRAM', () => {
  it('has correct values', () => {
    expect(CALORIES_PER_GRAM.protein).toBe(4)
    expect(CALORIES_PER_GRAM.carbs).toBe(4)
    expect(CALORIES_PER_GRAM.fat).toBe(9)
  })
})
