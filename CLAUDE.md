# CLAUDE.md - Project Constitution

## Tech Stack
- **Framework:** React 19 with Vite 7
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Testing:** Vitest + React Testing Library
- **Deployment:** GitHub Pages via GitHub Actions

## Project Structure
```
src/
├── components/     # Reusable UI components
├── calculators/    # Calculator-specific components
├── lib/           # Math/logic utilities
├── test/          # Test setup and utilities
└── App.jsx        # Main application component
```

## Rules

### Before Committing
1. Always run `npm run lint` and fix any errors
2. Always run `npm run build` to verify production build succeeds
3. Run `npm run test` to ensure all calculator logic tests pass

### Code Style
- Use functional components with hooks
- Keep calculator math logic in separate utility files (testable)
- Use CSS variables defined in index.css for theming
- Mobile-first responsive design

### Documentation
- Update `PROGRESS.md` after every completed feature
- Keep commit messages descriptive: `feat:`, `fix:`, `style:`, `test:`, `docs:`

### Error Handling
- If a build fails, attempt to fix it twice
- If it fails a third time, stop and ask the user for guidance

## Design System
- **Background Primary:** #0a0a0a (near black)
- **Background Secondary:** #141414 (dark gray)
- **Background Tertiary:** #1f1f1f (lighter gray)
- **Text Primary:** #ffffff (white)
- **Text Secondary:** #a1a1aa (muted gray)
- **Accent:** #22d3ee (cyan/neon)
- **Success:** #22c55e (green)
- **Warning:** #eab308 (yellow)
- **Error:** #ef4444 (red)
