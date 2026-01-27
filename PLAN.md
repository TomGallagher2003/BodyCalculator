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

## Awaiting Approval

**Please review this plan and confirm before I proceed with implementation.**

Key decisions for your approval:
1. Is the Mifflin-St Jeor formula acceptable for BMR?
2. Are the macro splits (1g protein/lb, 25% fat) appropriate?
3. Is the file structure acceptable?
4. Any additional features or calculators to include?
