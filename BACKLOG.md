# BACKLOG.md - Feature Backlog

## Priority Legend
- **P1** - High priority, high user value
- **P2** - Medium priority, nice to have
- **P3** - Low priority, future consideration

---

## Feature 1: Progress Tracking with Local Storage
**Priority:** P1

**Description:**
Allow users to save their body stats over time and visualize progress with charts. Store data in localStorage for privacy.

**User Value:**
Users can track their weight, body fat %, and calculated metrics over weeks/months without creating accounts.

**Implementation Notes:**
- Add "Save Progress" button to each calculator result
- Create a Progress Dashboard view with line charts
- Use localStorage with JSON serialization
- Include date picker for historical entries
- Add export/import functionality for data backup

---

## Feature 2: Meal Plan Generator from Macro Targets
**Priority:** P1

**Description:**
Generate sample meal plans based on calculated macro targets. Provide breakfast, lunch, dinner, and snack suggestions that fit the user's protein, carbs, and fat requirements.

**User Value:**
Bridges the gap between knowing your macros and actually eating to meet them.

**Implementation Notes:**
- Create a food database with common items and their macros
- Algorithm to combine foods to hit macro targets
- Allow dietary preferences (vegetarian, keto-friendly, etc.)
- Show multiple meal plan options
- Include serving size adjustments

---

## Feature 3: One Rep Max (1RM) Calculator
**Priority:** P2

**Description:**
Calculate estimated one-rep max for major lifts (squat, bench, deadlift) based on weight and reps performed. Include multiple formulas (Epley, Brzycki, Lander).

**User Value:**
Helps lifters track strength progress and program their training without testing true maxes.

**Implementation Notes:**
- Input: weight lifted, reps completed
- Output: estimated 1RM using multiple formulas
- Show percentage chart (what weight for 3 reps, 5 reps, etc.)
- Add exercise selector with common lifts
- Optional: store and track 1RM history

---

## Feature 4: Water Intake Calculator
**Priority:** P2

**Description:**
Calculate recommended daily water intake based on body weight, activity level, and climate. Account for exercise duration and intensity.

**User Value:**
Hydration is often overlooked but crucial for performance and recovery.

**Implementation Notes:**
- Base formula: 0.5-1 oz per pound of body weight
- Adjust for activity level and exercise duration
- Add climate/temperature factor
- Show intake schedule suggestions (glasses per hour)
- Visual hydration tracker with reminders option

---

## Feature 5: Body Recomposition Timeline Estimator
**Priority:** P3

**Description:**
Estimate how long it will take to reach body composition goals (target weight, target body fat %) based on realistic weekly fat loss/muscle gain rates.

**User Value:**
Sets realistic expectations and helps users plan their fitness journey with achievable milestones.

**Implementation Notes:**
- Inputs: current weight, current BF%, target BF%, goal type (cut/recomp/lean bulk)
- Assume realistic rates: 0.5-1% body weight loss per week for cutting
- Factor in expected muscle retention/gain
- Show weekly/monthly milestones
- Display estimated timeline with confidence range
- Warning if goals are unrealistic

---

## Completed Features (Reference)

For context, the following features have already been implemented:
- TDEE/BMR Calculator (Mifflin-St Jeor + Katch-McArdle)
- Macro Splitter with custom calorie adjustment
- Custom Macro Rules (protein g/lb, fat %)
- Navy Body Fat Calculator
- Fat Loss Required Calculator

---

*Last updated: 2026-01-28*
