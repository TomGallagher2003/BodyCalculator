/**
 * Navy Body Fat Calculator
 * Uses the U.S. Navy circumference method
 */

// Body fat categories
export const BODY_FAT_CATEGORIES = {
  male: [
    { min: 0, max: 5, label: 'Essential Fat', color: 'warning' },
    { min: 6, max: 13, label: 'Athletic', color: 'success' },
    { min: 14, max: 17, label: 'Fitness', color: 'success' },
    { min: 18, max: 24, label: 'Average', color: 'warning' },
    { min: 25, max: 100, label: 'Obese', color: 'error' },
  ],
  female: [
    { min: 0, max: 13, label: 'Essential Fat', color: 'warning' },
    { min: 14, max: 20, label: 'Athletic', color: 'success' },
    { min: 21, max: 24, label: 'Fitness', color: 'success' },
    { min: 25, max: 31, label: 'Average', color: 'warning' },
    { min: 32, max: 100, label: 'Obese', color: 'error' },
  ],
}

/**
 * Convert inches to centimeters
 * @param {number} inches - Measurement in inches
 * @returns {number} Measurement in centimeters
 */
export function inchesToCm(inches) {
  return inches * 2.54
}

/**
 * Convert centimeters to inches
 * @param {number} cm - Measurement in centimeters
 * @returns {number} Measurement in inches
 */
export function cmToInches(cm) {
  return cm / 2.54
}

/**
 * Calculate body fat percentage for males using Navy formula
 * Formula: 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
 * All measurements in inches
 * @param {number} waistInches - Waist circumference in inches
 * @param {number} neckInches - Neck circumference in inches
 * @param {number} heightInches - Height in inches
 * @returns {number} Body fat percentage
 */
export function calculateMaleBodyFat(waistInches, neckInches, heightInches) {
  // Guard against invalid measurements (neck >= waist would give NaN)
  if (waistInches <= neckInches) {
    return 0
  }

  const bodyFat =
    86.01 * Math.log10(waistInches - neckInches) -
    70.041 * Math.log10(heightInches) +
    36.76

  return Math.max(0, Math.round(bodyFat * 10) / 10)
}

/**
 * Calculate body fat percentage for females using Navy formula
 * Formula: 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
 * All measurements in inches
 * @param {number} waistInches - Waist circumference in inches
 * @param {number} hipInches - Hip circumference in inches
 * @param {number} neckInches - Neck circumference in inches
 * @param {number} heightInches - Height in inches
 * @returns {number} Body fat percentage
 */
export function calculateFemaleBodyFat(waistInches, hipInches, neckInches, heightInches) {
  const bodyFat =
    163.205 * Math.log10(waistInches + hipInches - neckInches) -
    97.684 * Math.log10(heightInches) -
    78.387

  return Math.max(0, Math.round(bodyFat * 10) / 10)
}

/**
 * Get body fat category based on percentage and sex
 * @param {number} bodyFatPercentage - Body fat percentage
 * @param {'male'|'female'} sex - Biological sex
 * @returns {Object} Category object with label and color
 */
export function getBodyFatCategory(bodyFatPercentage, sex) {
  const categories = BODY_FAT_CATEGORIES[sex] || BODY_FAT_CATEGORIES.male

  for (const category of categories) {
    if (bodyFatPercentage >= category.min && bodyFatPercentage <= category.max) {
      return category
    }
  }

  return { label: 'Unknown', color: 'secondary' }
}

/**
 * Calculate fat mass and lean mass
 * @param {number} bodyFatPercentage - Body fat percentage
 * @param {number} weightLbs - Total body weight in pounds
 * @returns {Object} Object containing fatMass and leanMass in pounds
 */
export function calculateMassComposition(bodyFatPercentage, weightLbs) {
  const fatMass = Math.round((bodyFatPercentage / 100) * weightLbs * 10) / 10
  const leanMass = Math.round((weightLbs - fatMass) * 10) / 10

  return { fatMass, leanMass }
}

/**
 * Full body fat calculation from inputs
 * @param {Object} params - Input parameters
 * @param {'male'|'female'} params.sex - Biological sex
 * @param {number} params.weight - Body weight
 * @param {'lbs'|'kg'} params.weightUnit - Weight unit
 * @param {number} params.height - Height value
 * @param {'in'|'cm'} params.heightUnit - Height unit
 * @param {number} params.neck - Neck circumference
 * @param {number} params.waist - Waist circumference
 * @param {number} [params.hip] - Hip circumference (required for females)
 * @param {'in'|'cm'} params.measurementUnit - Circumference measurement unit
 * @returns {Object} Full body fat analysis
 */
export function calculateBodyFat({
  sex,
  weight,
  weightUnit,
  height,
  heightUnit,
  neck,
  waist,
  hip,
  measurementUnit,
}) {
  // Convert all measurements to inches
  const heightInches = heightUnit === 'cm' ? cmToInches(height) : height
  const neckInches = measurementUnit === 'cm' ? cmToInches(neck) : neck
  const waistInches = measurementUnit === 'cm' ? cmToInches(waist) : waist
  const hipInches = hip ? (measurementUnit === 'cm' ? cmToInches(hip) : hip) : 0

  // Convert weight to pounds
  const weightLbs = weightUnit === 'kg' ? weight / 0.453592 : weight

  // Calculate body fat percentage based on sex
  let bodyFatPercentage
  if (sex === 'male') {
    bodyFatPercentage = calculateMaleBodyFat(waistInches, neckInches, heightInches)
  } else {
    bodyFatPercentage = calculateFemaleBodyFat(waistInches, hipInches, neckInches, heightInches)
  }

  // Get category and mass composition
  const category = getBodyFatCategory(bodyFatPercentage, sex)
  const { fatMass, leanMass } = calculateMassComposition(bodyFatPercentage, weightLbs)

  return {
    bodyFatPercentage,
    category,
    fatMass,
    leanMass,
    weightLbs,
  }
}
