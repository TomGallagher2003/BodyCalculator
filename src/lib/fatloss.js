/**
 * Fat Loss Required Calculator
 * Calculates how much weight needs to be lost to reach a target body fat percentage
 */

/**
 * Convert kg to lbs
 * @param {number} kg - Weight in kilograms
 * @returns {number} Weight in pounds
 */
export function kgToLbs(kg) {
  return kg / 0.453592
}

/**
 * Convert lbs to kg
 * @param {number} lbs - Weight in pounds
 * @returns {number} Weight in kilograms
 */
export function lbsToKg(lbs) {
  return lbs * 0.453592
}

/**
 * Calculate lean body mass from total weight and body fat percentage
 * @param {number} weight - Total body weight
 * @param {number} bodyFatPercentage - Current body fat as percentage (0-100)
 * @returns {number} Lean body mass in same unit as weight
 */
export function calculateLeanMass(weight, bodyFatPercentage) {
  const leanMassRatio = 1 - (bodyFatPercentage / 100)
  return weight * leanMassRatio
}

/**
 * Calculate fat mass from total weight and body fat percentage
 * @param {number} weight - Total body weight
 * @param {number} bodyFatPercentage - Current body fat as percentage (0-100)
 * @returns {number} Fat mass in same unit as weight
 */
export function calculateFatMass(weight, bodyFatPercentage) {
  return weight * (bodyFatPercentage / 100)
}

/**
 * Calculate goal weight to reach target body fat while preserving lean mass
 * Formula: Goal Weight = Lean Mass / (1 - Target BF%)
 * @param {number} leanMass - Current lean body mass
 * @param {number} targetBodyFatPercentage - Target body fat as percentage (0-100)
 * @returns {number} Goal weight in same unit as lean mass
 */
export function calculateGoalWeight(leanMass, targetBodyFatPercentage) {
  const targetLeanRatio = 1 - (targetBodyFatPercentage / 100)

  // Prevent division by zero
  if (targetLeanRatio <= 0) {
    return leanMass
  }

  return leanMass / targetLeanRatio
}

/**
 * Full fat loss calculation
 * @param {Object} params - Input parameters
 * @param {number} params.currentWeight - Current body weight
 * @param {'lbs'|'kg'} params.weightUnit - Weight unit
 * @param {number} params.currentBodyFat - Current body fat percentage (0-100)
 * @param {number} params.targetBodyFat - Target body fat percentage (0-100)
 * @returns {Object} Complete fat loss analysis
 */
export function calculateFatLossRequired({
  currentWeight,
  weightUnit,
  currentBodyFat,
  targetBodyFat,
}) {
  // Validate inputs
  if (targetBodyFat >= currentBodyFat) {
    return {
      isValid: false,
      error: 'Target body fat must be lower than current body fat',
      currentWeight,
      weightUnit,
    }
  }

  if (targetBodyFat < 3) {
    return {
      isValid: false,
      error: 'Target body fat cannot be below 3% (essential fat)',
      currentWeight,
      weightUnit,
    }
  }

  // Calculate values
  const leanMass = calculateLeanMass(currentWeight, currentBodyFat)
  const currentFatMass = calculateFatMass(currentWeight, currentBodyFat)
  const goalWeight = calculateGoalWeight(leanMass, targetBodyFat)
  const weightToLose = currentWeight - goalWeight
  const goalFatMass = calculateFatMass(goalWeight, targetBodyFat)

  // Round values for display
  const round = (val) => Math.round(val * 10) / 10

  return {
    isValid: true,
    currentWeight: round(currentWeight),
    weightUnit,
    currentBodyFat,
    targetBodyFat,
    leanMass: round(leanMass),
    currentFatMass: round(currentFatMass),
    goalWeight: round(goalWeight),
    goalFatMass: round(goalFatMass),
    weightToLose: round(weightToLose),
    fatToLose: round(currentFatMass - goalFatMass),
  }
}
