import { describe, it, expect } from 'vitest'
import {
  calculateTargetCalories,
  calculateProtein,
  calculateFat,
  calculateCarbs,
  calculateMacros,
  kgToLbs,
  proteinGramsToPercentage,
  proteinPercentageToGrams,
  calculateMacrosFromPercentages,
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

describe('proteinGramsToPercentage', () => {
  it('calculates protein percentage correctly for 180lb person at 2500 cal', () => {
    // 180 * 1 * 4 = 720 calories / 2500 = 28.8% -> 29%
    expect(proteinGramsToPercentage(1, 180, 2500)).toBe(29)
  })

  it('calculates higher percentage for higher multiplier', () => {
    // 180 * 1.2 * 4 = 864 calories / 2500 = 34.56% -> 35%
    expect(proteinGramsToPercentage(1.2, 180, 2500)).toBe(35)
  })

  it('returns 0 for zero target calories', () => {
    expect(proteinGramsToPercentage(1, 180, 0)).toBe(0)
  })

  it('returns 0 for negative target calories', () => {
    expect(proteinGramsToPercentage(1, 180, -100)).toBe(0)
  })

  it('scales correctly with bodyweight', () => {
    // 200 * 1 * 4 = 800 calories / 2500 = 32%
    expect(proteinGramsToPercentage(1, 200, 2500)).toBe(32)
  })
})

describe('proteinPercentageToGrams', () => {
  it('calculates g/lb correctly for 180lb person at 2500 cal', () => {
    // 2500 * 0.29 = 725 calories / 4 = 181.25g / 180 = 1.01 g/lb
    expect(proteinPercentageToGrams(29, 180, 2500)).toBe(1.01)
  })

  it('calculates lower g/lb for lower percentage', () => {
    // 2500 * 0.20 = 500 calories / 4 = 125g / 180 = 0.69 g/lb
    expect(proteinPercentageToGrams(20, 180, 2500)).toBe(0.69)
  })

  it('returns 0 for zero bodyweight', () => {
    expect(proteinPercentageToGrams(29, 0, 2500)).toBe(0)
  })

  it('scales correctly with calories', () => {
    // 3000 * 0.29 = 870 calories / 4 = 217.5g / 180 = 1.21 g/lb
    expect(proteinPercentageToGrams(29, 180, 3000)).toBe(1.21)
  })
})

describe('calculateMacrosFromPercentages', () => {
  it('calculates macros from percentages correctly', () => {
    const result = calculateMacrosFromPercentages({
      targetCalories: 2000,
      proteinPercentage: 30,
      fatPercentage: 25,
    })

    // Protein: 2000 * 0.30 = 600 cal / 4 = 150g
    expect(result.protein).toBe(150)
    // Fat: 2000 * 0.25 = 500 cal / 9 = 55.56g -> 56g
    expect(result.fat).toBe(56)
    // Carbs: 2000 * 0.45 = 900 cal / 4 = 225g
    expect(result.carbs).toBe(225)
  })

  it('handles high protein low carb split', () => {
    const result = calculateMacrosFromPercentages({
      targetCalories: 2000,
      proteinPercentage: 40,
      fatPercentage: 40,
    })

    // Protein: 2000 * 0.40 = 800 cal / 4 = 200g
    expect(result.protein).toBe(200)
    // Fat: 2000 * 0.40 = 800 cal / 9 = 88.89g -> 89g
    expect(result.fat).toBe(89)
    // Carbs: 2000 * 0.20 = 400 cal / 4 = 100g
    expect(result.carbs).toBe(100)
  })

  it('includes percentage breakdown', () => {
    const result = calculateMacrosFromPercentages({
      targetCalories: 2000,
      proteinPercentage: 30,
      fatPercentage: 25,
    })

    expect(result.breakdown).toHaveProperty('proteinPercentage')
    expect(result.breakdown).toHaveProperty('fatPercentage')
    expect(result.breakdown).toHaveProperty('carbPercentage')

    // Percentages should sum close to 100
    const total = result.breakdown.proteinPercentage +
      result.breakdown.fatPercentage +
      result.breakdown.carbPercentage
    expect(total).toBeGreaterThanOrEqual(99)
    expect(total).toBeLessThanOrEqual(101)
  })

  it('returns 0 carbs if percentages exceed 100', () => {
    const result = calculateMacrosFromPercentages({
      targetCalories: 2000,
      proteinPercentage: 60,
      fatPercentage: 50,
    })

    expect(result.carbs).toBe(0)
  })
})

describe('calculateMacros with custom multipliers', () => {
  it('uses custom fat percentage', () => {
    const result = calculateMacros({
      tdee: 2500,
      bodyweightLbs: 180,
      goal: 'maintain',
      fatPercentage: 0.30,
    })

    // Fat should be 30% of 2500 = 750 cal / 9 = 83.33g -> 83g
    expect(result.fat).toBe(83)
  })

  it('uses both custom protein multiplier and fat percentage', () => {
    const result = calculateMacros({
      tdee: 2500,
      bodyweightLbs: 180,
      goal: 'maintain',
      proteinMultiplier: 1.2,
      fatPercentage: 0.30,
    })

    expect(result.protein).toBe(216) // 180 * 1.2
    expect(result.fat).toBe(83) // 30% of 2500
  })
})
