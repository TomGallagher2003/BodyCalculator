# PLAN.md - Implementation Plan

## Overview
Build a "Bodybuilding Calculator Suite" - a mobile-first React application with three calculators:
1. TDEE/BMR Calculator
2. Macro Splitter
3. Navy Body Fat Calculator

---

## Step-by-Step Implementation

### Step 1: Core Math Logic (No UI)
Create pure JavaScript functions for all calculator logic, fully tested before building any UI.

**1.1 TDEE/BMR Calculator Logic** (`src/lib/tdee.js`)
- Implement Mifflin-St Jeor formula:
  - Male: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
  - Female: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
- Activity multipliers:
  - Sedentary (1.2), Light (1.375), Moderate (1.55), Active (1.725), Very Active (1.9)
- Unit conversion helpers (lbs↔kg, in↔cm)

**1.2 Macro Splitter Logic** (`src/lib/macros.js`)
- Take TDEE input and goal (Cut/Bulk/Recomp)
- Calorie adjustments: Cut (-500), Bulk (+250), Recomp (+0)
- Macro split:
  - Protein: 1g per lb bodyweight (4 cal/g)
  - Fat: 25% of calories (9 cal/g)
  - Carbs: remaining calories (4 cal/g)

**1.3 Navy Body Fat Logic** (`src/lib/bodyfat.js`)
- Navy Body Fat formula:
  - Male: 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
  - Female: 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
- All measurements in inches/cm with conversion

---

### Step 2: Unit Tests
Create comprehensive tests for all math functions.

**Files:**
- `src/lib/tdee.test.js`
- `src/lib/macros.test.js`
- `src/lib/bodyfat.test.js`

**Test Cases:**
- Verify BMR calculations against known values
- Test unit conversions
- Test edge cases (minimum/maximum values)
- Verify macro calculations balance correctly

---

### Step 3: Base UI Layout

**3.1 App Shell** (`src/App.jsx`)
- Dark mode wrapper
- Responsive layout with sidebar (desktop) / bottom nav (mobile)
- Navigation between calculators

**3.2 Reusable Components** (`src/components/`)
- `Input.jsx` - Styled number input with label
- `Select.jsx` - Styled dropdown select
- `Card.jsx` - Container for calculator sections
- `Button.jsx` - Primary action button
- `ResultDisplay.jsx` - Styled output display
- `Sidebar.jsx` - Navigation sidebar
- `MobileNav.jsx` - Bottom navigation for mobile

---

### Step 4: Calculator UIs

**4.1 TDEE Calculator** (`src/calculators/TDEECalculator.jsx`)
- Inputs: Age, Weight (with unit toggle), Height (with unit toggle), Sex, Activity Level
- Outputs: BMR, TDEE
- "Use for Macros" button to pass TDEE to next calculator

**4.2 Macro Splitter** (`src/calculators/MacroCalculator.jsx`)
- Inputs: TDEE (auto-filled or manual), Bodyweight, Goal selector (Cut/Bulk/Recomp)
- Outputs: Target calories, Protein (g), Fat (g), Carbs (g)
- Visual breakdown (progress bars or pie chart)

**4.3 Body Fat Calculator** (`src/calculators/BodyFatCalculator.jsx`)
- Inputs: Sex, Neck circumference, Waist circumference, Hip (if female), Height
- Outputs: Body fat %, Fat mass, Lean mass
- Category indicator (essential/athletic/fit/average/obese)

---

### Step 5: GitHub Actions Deployment

**5.1 Workflow File** (`.github/workflows/deploy.yml`)
- Trigger on push to main branch
- Steps: Checkout → Setup Node → Install → Lint → Test → Build → Deploy to gh-pages

**5.2 Verify**
- Ensure `base` in vite.config.js matches repo name
- Test deployment pipeline

---

### Step 6: Polish & QA

- Add loading states and transitions
- Improve accessibility (ARIA labels, keyboard nav)
- Test on mobile devices
- Add subtle animations
- Final review of all calculators

---

## Commit Strategy

| Step | Commit Message |
|------|----------------|
| 1.1 | `feat: implement TDEE/BMR math logic` |
| 1.2 | `feat: implement macro splitter logic` |
| 1.3 | `feat: implement navy body fat logic` |
| 2 | `test: add unit tests for all calculators` |
| 3.1 | `feat: create app shell and dark mode layout` |
| 3.2 | `feat: add reusable UI components` |
| 4.1 | `feat: build TDEE calculator UI` |
| 4.2 | `feat: build macro splitter UI` |
| 4.3 | `feat: build body fat calculator UI` |
| 5 | `ci: add GitHub Actions deployment workflow` |
| 6 | `style: add polish and animations` |

---

## Estimated File Structure (Final)

```
BodyCalculator/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── components/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── MobileNav.jsx
│   │   ├── ResultDisplay.jsx
│   │   ├── Select.jsx
│   │   └── Sidebar.jsx
│   ├── calculators/
│   │   ├── TDEECalculator.jsx
│   │   ├── MacroCalculator.jsx
│   │   └── BodyFatCalculator.jsx
│   ├── lib/
│   │   ├── tdee.js
│   │   ├── tdee.test.js
│   │   ├── macros.js
│   │   ├── macros.test.js
│   │   ├── bodyfat.js
│   │   └── bodyfat.test.js
│   ├── test/
│   │   └── setup.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── CLAUDE.md
├── PLAN.md
├── PROGRESS.md
├── package.json
├── vite.config.js
└── index.html
```

---

---

## Phase 7: Pro Feature Expansion

### Step 7.1: Macro Splitter - Custom Calorie Adjustment

**Current State:** Fixed preset buttons (Cut -500, Bulk +250, etc.)

**New Requirement:** Add a dynamic slider/number input for custom calorie surplus/deficit

- Add a slider component with range -1000 to +1000 calories
- Add a number input for precise custom values
- Update macro math in real-time as value changes
- Keep preset buttons as quick-select options
- When custom value is used, highlight it in the UI

**Files to modify:**
- `src/lib/macros.js` - Add custom adjustment support
- `src/calculators/MacroCalculator.jsx` - Add slider/input UI

---

### Step 7.2: Fat Loss Required Calculator

**Objective:** Calculate how much weight a user needs to lose to reach a target body fat percentage

**Math Logic:**
```
Goal Weight = Current Lean Mass / (1 - Target BF%)
Weight to Lose = Current Weight - Goal Weight
```

Where:
- Current Lean Mass = Current Weight × (1 - Current BF%)
- All values in same unit (lbs or kg)

**Inputs:**
- Current Weight (with unit toggle)
- Current Body Fat % (slider or input)
- Target Body Fat % (slider or input)

**Outputs:**
- Current Lean Mass
- Goal Weight
- Total Weight to Lose

**Files to create:**
- `src/lib/fatloss.js` - Math logic
- `src/lib/fatloss.test.js` - Unit tests
- `src/calculators/FatLossCalculator.jsx` - UI component

**UI Requirements:**
- Match existing card wrappers, input styles, typography
- Add to navigation (Sidebar + MobileNav)
- Use Target icon from Lucide

---

## Commit Strategy (Phase 7)

| Step | Commit Message |
|------|----------------|
| 7.1 | `feat: add custom calorie adjustment to macro splitter` |
| 7.2 | `feat: add fat loss required calculator` |

---

## Phase 8: Custom Macro Rules

### Step 8.1: Custom Macro Percentages & Protein Multiplier

**Current State:** Fixed macro formula (Protein = 1g/lb, Fat = 25%, Carbs = remaining)

**New Requirement:** Allow users to customize macro distribution with two linked input modes:

1. **Custom Protein (g/lb):** Slider/input for protein multiplier (0.6 - 1.5 g/lb)
2. **Custom Fat (%):** Slider/input for fat percentage (15% - 45%)
3. **Carbs (%):** Automatically calculated as remaining calories

**Bidirectional Sync Logic:**
- When protein g/lb changes → Recalculate and display protein % of total calories
- When fat % changes → Update fat grams accordingly
- Carb % always equals 100% - protein% - fat%
- All percentages displayed live in the UI

**Math:**
```
Protein Calories = bodyweight_lbs × protein_g_per_lb × 4
Protein % = (Protein Calories / Target Calories) × 100
Fat Calories = Target Calories × fat_percentage
Carb Calories = Target Calories - Protein Calories - Fat Calories
```

**UI Updates:**
- Add "Custom Rules" expandable section
- Protein: slider (0.6-1.5 g/lb) with live percentage display
- Fat: slider (15%-45%) with grams display
- Live percentage breakdown showing P/C/F split
- Reset button to restore defaults (1g/lb, 25% fat)

**Files to modify:**
- `src/lib/macros.js` - Add conversion helpers
- `src/lib/macros.test.js` - Add tests for new helpers
- `src/calculators/MacroCalculator.jsx` - Add custom rules UI

---

## Commit Strategy (Phase 8)

| Step | Commit Message |
|------|----------------|
| 8.1 | `feat: add custom macro rules with adjustable protein/fat ratios` |

---

## Phase 9: Pro Features - Body Fat Enhanced TDEE

### Step 9.1: Optional Body Fat Percentage for TDEE Calculator

**Current State:** TDEE uses Mifflin-St Jeor formula (weight, height, age, sex)

**New Requirement:** Add optional body fat % field that switches to Katch-McArdle formula when provided

**Katch-McArdle Formula:**
```
Lean Body Mass (kg) = Weight (kg) × (1 - Body Fat %)
BMR = 370 + (21.6 × Lean Body Mass in kg)
```

This formula is more accurate for individuals who know their body fat %, especially for:
- Very lean individuals
- Those with above-average muscle mass

**UI Updates:**
- Add collapsible "Advanced" section after activity level
- Body fat % slider (5% - 50%) with number input
- Visual indicator when Katch-McArdle is active
- "Clear" button to revert to standard formula

**Files to modify:**
- `src/lib/tdee.js` - Add Katch-McArdle formula and lean mass calculation
- `src/lib/tdee.test.js` - Add tests for new formula
- `src/calculators/TDEECalculator.jsx` - Add body fat % input UI

---

### Step 9.2: Feature Backlog

**Objective:** Document 5 potential future features in BACKLOG.md

**File to create:**
- `BACKLOG.md` - Feature backlog with descriptions and priority

---

## Commit Strategy (Phase 9)

| Step | Commit Message |
|------|----------------|
| 9.1 | `feat: add optional body fat % for enhanced TDEE calculation` |
| 9.2 | `docs: add feature backlog with 5 new feature ideas` |
