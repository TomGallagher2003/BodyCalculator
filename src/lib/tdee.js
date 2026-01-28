/**
 * TDEE/BMR Calculator using Mifflin-St Jeor Formula
 */

// Activity level multipliers
export const ACTIVITY_LEVELS = {
  sedentary: { value: 1.2, label: 'Sedentary', description: 'Little or no exercise' },
  light: { value: 1.375, label: 'Light', description: 'Light exercise 1-3 days/week' },
  moderate: { value: 1.55, label: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
  active: { value: 1.725, label: 'Active', description: 'Hard exercise 6-7 days/week' },
  veryActive: { value: 1.9, label: 'Very Active', description: 'Very hard exercise, physical job' },
}

/**
 * Convert pounds to kilograms
 * @param {number} lbs - Weight in pounds
 * @returns {number} Weight in kilograms
 */
export function lbsToKg(lbs) {
  return lbs * 0.453592
}

/**
 * Convert kilograms to pounds
 * @param {number} kg - Weight in kilograms
 * @returns {number} Weight in pounds
 */
export function kgToLbs(kg) {
  return kg / 0.453592
}

/**
 * Convert inches to centimeters
 * @param {number} inches - Height in inches
 * @returns {number} Height in centimeters
 */
export function inchesToCm(inches) {
  return inches * 2.54
}

/**
 * Convert centimeters to inches
 * @param {number} cm - Height in centimeters
 * @returns {number} Height in inches
 */
export function cmToInches(cm) {
  return cm / 2.54
}

/**
 * Convert feet and inches to total inches
 * @param {number} feet - Feet portion
 * @param {number} inches - Inches portion
 * @returns {number} Total inches
 */
export function feetInchesToInches(feet, inches) {
  return feet * 12 + inches
}

/**
 * Calculate lean body mass from total weight and body fat percentage
 * @param {number} weightKg - Total weight in kilograms
 * @param {number} bodyFatPercent - Body fat percentage (0-100)
 * @returns {number} Lean body mass in kilograms
 */
export function calculateLeanMass(weightKg, bodyFatPercent) {
  return weightKg * (1 - bodyFatPercent / 100)
}

/**
 * Calculate BMR using Mifflin-St Jeor formula
 * @param {Object} params - Input parameters
 * @param {number} params.weightKg - Weight in kilograms
 * @param {number} params.heightCm - Height in centimeters
 * @param {number} params.age - Age in years
 * @param {'male'|'female'} params.sex - Biological sex
 * @returns {number} Basal Metabolic Rate in calories
 */
export function calculateBMR({ weightKg, heightCm, age, sex }) {
  // Mifflin-St Jeor Formula:
  // Male: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
  // Female: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161

  const baseBMR = (10 * weightKg) + (6.25 * heightCm) - (5 * age)

  if (sex === 'male') {
    return Math.round(baseBMR + 5)
  } else {
    return Math.round(baseBMR - 161)
  }
}

/**
 * Calculate BMR using Katch-McArdle formula (requires body fat %)
 * More accurate for individuals who know their body fat percentage
 * @param {number} leanMassKg - Lean body mass in kilograms
 * @returns {number} Basal Metabolic Rate in calories
 */
export function calculateBMRKatchMcArdle(leanMassKg) {
  // Katch-McArdle Formula: BMR = 370 + (21.6 × lean mass in kg)
  return Math.round(370 + (21.6 * leanMassKg))
}

/**
 * Calculate TDEE from BMR and activity level
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level key from ACTIVITY_LEVELS
 * @returns {number} Total Daily Energy Expenditure in calories
 */
export function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_LEVELS[activityLevel]?.value || 1.2
  return Math.round(bmr * multiplier)
}

/**
 * Full TDEE calculation from raw inputs
 * @param {Object} params - Input parameters
 * @param {number} params.weight - Weight value
 * @param {'kg'|'lbs'} params.weightUnit - Weight unit
 * @param {number} params.height - Height value (in cm or inches)
 * @param {'cm'|'in'} params.heightUnit - Height unit
 * @param {number} params.age - Age in years
 * @param {'male'|'female'} params.sex - Biological sex
 * @param {string} params.activityLevel - Activity level key
 * @param {number} [params.bodyFatPercent] - Optional body fat percentage (uses Katch-McArdle if provided)
 * @returns {Object} Object containing BMR, TDEE, formula used, and optionally lean mass
 */
export function calculateFullTDEE({ weight, weightUnit, height, heightUnit, age, sex, activityLevel, bodyFatPercent }) {
  // Convert to metric if needed
  const weightKg = weightUnit === 'lbs' ? lbsToKg(weight) : weight
  const heightCm = heightUnit === 'in' ? inchesToCm(height) : height

  let bmr
  let formula
  let leanMassKg = null

  // Use Katch-McArdle formula if body fat percentage is provided
  if (bodyFatPercent !== undefined && bodyFatPercent !== null && bodyFatPercent > 0) {
    leanMassKg = calculateLeanMass(weightKg, bodyFatPercent)
    bmr = calculateBMRKatchMcArdle(leanMassKg)
    formula = 'katch-mcardle'
  } else {
    bmr = calculateBMR({ weightKg, heightCm, age, sex })
    formula = 'mifflin-st-jeor'
  }

  const tdee = calculateTDEE(bmr, activityLevel)

  return { bmr, tdee, formula, leanMassKg }
}
