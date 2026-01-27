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

---

## Completed Features Log

| Date | Feature | Commit |
|------|---------|--------|
| 2026-01-27 | Project initialization | fae511f |
| 2026-01-27 | Calculator math logic with 65 tests | 9c2879d |
| 2026-01-27 | Complete UI with all 3 calculators | dfa1e03 |
| 2026-01-27 | GitHub Actions deployment workflow | - |
