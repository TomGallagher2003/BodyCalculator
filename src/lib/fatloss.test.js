import { describe, it, expect } from 'vitest'
import {
  kgToLbs,
  lbsToKg,
  calculateLeanMass,
  calculateFatMass,
  calculateGoalWeight,
  calculateFatLossRequired,
} from './fatloss'

describe('Unit Conversions', () => {
  it('converts kg to lbs', () => {
    expect(kgToLbs(1)).toBeCloseTo(2.205, 2)
    expect(kgToLbs(100)).toBeCloseTo(220.46, 1)
  })

  it('converts lbs to kg', () => {
    expect(lbsToKg(1)).toBeCloseTo(0.4536, 3)
    expect(lbsToKg(220)).toBeCloseTo(99.79, 1)
  })
})

describe('calculateLeanMass', () => {
  it('calculates lean mass correctly', () => {
    // 200 lbs at 20% body fat = 160 lbs lean mass
    expect(calculateLeanMass(200, 20)).toBe(160)

    // 180 lbs at 15% body fat = 153 lbs lean mass
    expect(calculateLeanMass(180, 15)).toBe(153)

    // 100 kg at 25% body fat = 75 kg lean mass
    expect(calculateLeanMass(100, 25)).toBe(75)
  })

  it('handles 0% body fat', () => {
    expect(calculateLeanMass(200, 0)).toBe(200)
  })
})

describe('calculateFatMass', () => {
  it('calculates fat mass correctly', () => {
    // 200 lbs at 20% body fat = 40 lbs fat
    expect(calculateFatMass(200, 20)).toBe(40)

    // 180 lbs at 15% body fat = 27 lbs fat
    expect(calculateFatMass(180, 15)).toBe(27)
  })
})

describe('calculateGoalWeight', () => {
  it('calculates goal weight correctly', () => {
    // 160 lbs lean mass wanting 10% body fat
    // Goal = 160 / (1 - 0.10) = 160 / 0.90 = 177.78
    expect(calculateGoalWeight(160, 10)).toBeCloseTo(177.78, 1)

    // 150 lbs lean mass wanting 12% body fat
    // Goal = 150 / 0.88 = 170.45
    expect(calculateGoalWeight(150, 12)).toBeCloseTo(170.45, 1)
  })

  it('handles edge case of 0% target body fat', () => {
    // At 0% body fat, goal weight equals lean mass
    expect(calculateGoalWeight(160, 0)).toBe(160)
  })

  it('handles edge case of 100% target body fat', () => {
    // Should return lean mass to prevent division by zero
    expect(calculateGoalWeight(160, 100)).toBe(160)
  })
})

describe('calculateFatLossRequired', () => {
  it('calculates full fat loss analysis', () => {
    const result = calculateFatLossRequired({
      currentWeight: 200,
      weightUnit: 'lbs',
      currentBodyFat: 25,
      targetBodyFat: 15,
    })

    expect(result.isValid).toBe(true)
    expect(result.leanMass).toBe(150)
    expect(result.currentFatMass).toBe(50)
    // Goal weight = 150 / 0.85 = 176.47
    expect(result.goalWeight).toBeCloseTo(176.5, 0)
    // Weight to lose = 200 - 176.47 = 23.53
    expect(result.weightToLose).toBeCloseTo(23.5, 0)
  })

  it('validates target lower than current', () => {
    const result = calculateFatLossRequired({
      currentWeight: 200,
      weightUnit: 'lbs',
      currentBodyFat: 15,
      targetBodyFat: 20,
    })

    expect(result.isValid).toBe(false)
    expect(result.error).toContain('lower than current')
  })

  it('validates minimum body fat percentage', () => {
    const result = calculateFatLossRequired({
      currentWeight: 200,
      weightUnit: 'lbs',
      currentBodyFat: 15,
      targetBodyFat: 2,
    })

    expect(result.isValid).toBe(false)
    expect(result.error).toContain('essential fat')
  })

  it('calculates fat to lose', () => {
    const result = calculateFatLossRequired({
      currentWeight: 180,
      weightUnit: 'lbs',
      currentBodyFat: 20,
      targetBodyFat: 12,
    })

    expect(result.isValid).toBe(true)
    // Current fat = 180 * 0.20 = 36 lbs
    expect(result.currentFatMass).toBe(36)
    // Lean mass = 180 - 36 = 144 lbs
    expect(result.leanMass).toBe(144)
    // Goal weight = 144 / 0.88 = 163.64 lbs
    expect(result.goalWeight).toBeCloseTo(163.6, 0)
    // Goal fat mass = 163.64 * 0.12 = 19.64 lbs
    expect(result.goalFatMass).toBeCloseTo(19.6, 0)
    // Fat to lose = 36 - 19.64 = 16.36 lbs
    expect(result.fatToLose).toBeCloseTo(16.4, 0)
  })

  it('works with kg units', () => {
    const result = calculateFatLossRequired({
      currentWeight: 90,
      weightUnit: 'kg',
      currentBodyFat: 20,
      targetBodyFat: 12,
    })

    expect(result.isValid).toBe(true)
    expect(result.weightUnit).toBe('kg')
    expect(result.leanMass).toBe(72)
    // Goal weight = 72 / 0.88 = 81.82 kg
    expect(result.goalWeight).toBeCloseTo(81.8, 0)
  })
})
