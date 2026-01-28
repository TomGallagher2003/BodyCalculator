/**
 * Macro Splitter Calculator
 */

// Calorie adjustments for different goals
export const GOALS = {
  cut: { adjustment: -500, label: 'Cut', description: 'Lose fat (-500 cal)' },
  maintain: { adjustment: 0, label: 'Maintain', description: 'Maintain weight' },
  recomp: { adjustment: 0, label: 'Recomp', description: 'Body recomposition' },
  lean_bulk: { adjustment: 250, label: 'Lean Bulk', description: 'Gain muscle slowly (+250 cal)' },
  bulk: { adjustment: 500, label: 'Bulk', description: 'Gain muscle (+500 cal)' },
}

// Calories per gram of each macro
export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
}

/**
 * Calculate target calories based on TDEE and goal or custom adjustment
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} goal - Goal key from GOALS
 * @param {number} [customAdjustment] - Optional custom calorie adjustment (overrides goal)
 * @returns {number} Target daily calories
 */
export function calculateTargetCalories(tdee, goal, customAdjustment) {
  const adjustment = customAdjustment !== undefined ? customAdjustment : (GOALS[goal]?.adjustment || 0)
  return tdee + adjustment
}

/**
 * Calculate protein target
 * Standard recommendation: 1g per pound of bodyweight
 * @param {number} bodyweightLbs - Bodyweight in pounds
 * @param {number} [multiplier=1] - Protein multiplier (g per lb)
 * @returns {number} Protein in grams
 */
export function calculateProtein(bodyweightLbs, multiplier = 1) {
  return Math.round(bodyweightLbs * multiplier)
}

/**
 * Calculate fat target
 * Standard recommendation: 25% of total calories
 * @param {number} targetCalories - Target daily calories
 * @param {number} [percentage=0.25] - Fat percentage of total calories
 * @returns {number} Fat in grams
 */
export function calculateFat(targetCalories, percentage = 0.25) {
  const fatCalories = targetCalories * percentage
  return Math.round(fatCalories / CALORIES_PER_GRAM.fat)
}

/**
 * Calculate carbs from remaining calories
 * @param {number} targetCalories - Target daily calories
 * @param {number} proteinGrams - Protein in grams
 * @param {number} fatGrams - Fat in grams
 * @returns {number} Carbs in grams
 */
export function calculateCarbs(targetCalories, proteinGrams, fatGrams) {
  const proteinCalories = proteinGrams * CALORIES_PER_GRAM.protein
  const fatCalories = fatGrams * CALORIES_PER_GRAM.fat
  const remainingCalories = targetCalories - proteinCalories - fatCalories
  return Math.max(0, Math.round(remainingCalories / CALORIES_PER_GRAM.carbs))
}

/**
 * Calculate full macro split
 * @param {Object} params - Input parameters
 * @param {number} params.tdee - Total Daily Energy Expenditure
 * @param {number} params.bodyweightLbs - Bodyweight in pounds
 * @param {string} params.goal - Goal key from GOALS
 * @param {number} [params.customAdjustment] - Custom calorie adjustment (overrides goal)
 * @param {number} [params.proteinMultiplier=1] - Protein g per lb bodyweight
 * @param {number} [params.fatPercentage=0.25] - Fat percentage of calories
 * @returns {Object} Macro breakdown
 */
export function calculateMacros({
  tdee,
  bodyweightLbs,
  goal,
  customAdjustment,
  proteinMultiplier = 1,
  fatPercentage = 0.25,
}) {
  const targetCalories = calculateTargetCalories(tdee, goal, customAdjustment)
  const protein = calculateProtein(bodyweightLbs, proteinMultiplier)
  const fat = calculateFat(targetCalories, fatPercentage)
  const carbs = calculateCarbs(targetCalories, protein, fat)

  // Calculate actual calories from macros (may differ slightly due to rounding)
  const actualCalories =
    protein * CALORIES_PER_GRAM.protein +
    fat * CALORIES_PER_GRAM.fat +
    carbs * CALORIES_PER_GRAM.carbs

  return {
    targetCalories,
    actualCalories,
    protein,
    fat,
    carbs,
    breakdown: {
      proteinCalories: protein * CALORIES_PER_GRAM.protein,
      fatCalories: fat * CALORIES_PER_GRAM.fat,
      carbCalories: carbs * CALORIES_PER_GRAM.carbs,
      proteinPercentage: Math.round((protein * CALORIES_PER_GRAM.protein / actualCalories) * 100),
      fatPercentage: Math.round((fat * CALORIES_PER_GRAM.fat / actualCalories) * 100),
      carbPercentage: Math.round((carbs * CALORIES_PER_GRAM.carbs / actualCalories) * 100),
    },
  }
}

/**
 * Convert kg to lbs for macro calculations
 * @param {number} kg - Weight in kilograms
 * @returns {number} Weight in pounds
 */
export function kgToLbs(kg) {
  return kg / 0.453592
}
