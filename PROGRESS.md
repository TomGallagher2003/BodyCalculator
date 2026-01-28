# PROGRESS.md - Development Progress

## High-Level Roadmap

### Phase 1: Setup
- [x] Initialize Vite + React project
- [x] Configure Tailwind CSS v4
- [x] Install dependencies (Lucide React, Vitest)
- [x] Create project constitution (CLAUDE.md)
- [x] Create progress tracker (PROGRESS.md)
- [x] Create implementation plan (PLAN.md)
- [x] Get plan approval from user

### Phase 2: Core Logic
- [x] Implement TDEE/BMR calculator math (Mifflin-St Jeor)
- [x] Write unit tests for TDEE/BMR
- [x] Implement Macro Splitter logic
- [x] Write unit tests for Macro Splitter
- [x] Implement Navy Body Fat calculator math
- [x] Write unit tests for Navy Body Fat

### Phase 3: UI Components
- [x] Create base layout (dark mode, responsive nav/sidebar)
- [x] Build reusable input components
- [x] Build reusable card/result display components
- [x] Create TDEE Calculator UI
- [x] Create Macro Splitter UI
- [x] Create Navy Body Fat Calculator UI

### Phase 4: CI/CD
- [x] Create GitHub Actions workflow for deployment
- [x] Configure gh-pages branch deployment
- [ ] Verify deployment works

### Phase 5: Polish
- [x] Add transitions and animations
- [x] Improve mobile responsiveness
- [ ] Add input validation feedback
- [ ] Final testing and QA

### Phase 7: Pro Feature Expansion
- [x] Refactor Macro Splitter with custom calorie adjustment slider
- [x] Add quick-select buttons for common adjustments (-500, -250, 0, +250, +500)
- [x] Add custom number input for precise calorie adjustment
- [x] Create Fat Loss Required calculator logic
- [x] Write unit tests for Fat Loss Required (13 tests)
- [x] Create Fat Loss Required calculator UI
- [x] Add new calculator to navigation (Sidebar + MobileNav)

### Phase 8: Custom Macro Rules
- [x] Add custom protein multiplier (0.6-1.5 g/lb) with live percentage display
- [x] Add custom fat percentage slider (15%-45%) with grams display
- [x] Implement bidirectional sync between g/lb and percentage values
- [x] Add expandable "Custom Macro Rules" section in UI
- [x] Add live P/C/F percentage breakdown visualization
- [x] Add reset to defaults button
- [x] Write unit tests for new helper functions (17 new tests, 93 total)

### Phase 9: Pro Features - Body Fat Enhanced TDEE
- [x] Add Katch-McArdle formula for body fat-based BMR calculation
- [x] Add calculateLeanMass utility function
- [x] Add optional body fat % input with collapsible "Advanced Options" section
- [x] Display formula indicator (Mifflin-St Jeor vs Katch-McArdle)
- [x] Show lean mass in results when body fat % is provided
- [x] Write unit tests for new body fat % logic (10 new tests, 103 total)
- [x] Create BACKLOG.md with 5 prioritized feature ideas

### Phase 10: Progress Tracking with Local Storage
- [x] Create progress storage utility (lib/progress.js) with localStorage operations
- [x] Implement save, update, delete, and query functions for entries
- [x] Add export/import functionality for data backup (JSON format)
- [x] Create Progress Dashboard view with line charts
- [x] Add statistics display (current, change, average, count)
- [x] Create SaveProgressButton component with date picker
- [x] Integrate Save Progress button into TDEE, Macro, and Body Fat calculators
- [x] Add Progress Tracker to navigation (Sidebar + MobileNav)
- [x] Write unit tests for progress storage functions (31 new tests)
- [x] Add danger/success Button variants for UI actions

---

## Completed Features Log

| Date | Feature | Commit |
|------|---------|--------|
| 2026-01-27 | Project initialization | fae511f |
| 2026-01-27 | Calculator math logic with 65 tests | 9c2879d |
| 2026-01-27 | Complete UI with all 3 calculators | dfa1e03 |
| 2026-01-27 | GitHub Actions deployment workflow | - |
| 2026-01-27 | Macro Splitter custom calorie adjustment | - |
| 2026-01-27 | Fat Loss Required calculator (78 total tests) | - |
| 2026-01-28 | Custom macro rules (protein g/lb, fat %) with 93 total tests | - |
| 2026-01-28 | Body fat % enhanced TDEE (Katch-McArdle) with 103 total tests | - |
| 2026-01-28 | Feature backlog (5 new feature ideas) | - |
| 2026-01-28 | Progress Tracking with localStorage, charts, export/import | - |
