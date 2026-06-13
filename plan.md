# Plan

## Current Goal

Add E2E test suite for all existing features, then continue polishing the game.

## Tasks

### Completed
- [x] Set up project scaffolding (index.html, style.css, game.js)
- [x] Create a canvas-based game loop (requestAnimationFrame)
- [x] Add a player character that flies (responds to keyboard/mouse input)
- [x] Add gravity and upward thrust mechanics (tap/hold to fly up, gravity pulls down)
- [x] Add star collectibles that spawn at random positions
- [x] Add collision detection between player and stars
- [x] Add a score counter displayed on screen
- [x] Add basic visual polish (background, colors, simple animations)
- [x] Make the game restart-able when the player hits the ground/ceiling
- [x] Initialize git repo and make first commit
- [x] Add horizontal scrolling / forward movement (side-scroller feel)
- [x] Add obstacles to avoid (rock pillars with gaps)
- [x] Add increasing difficulty (speed increases over time)
- [x] Add persistent high score (localStorage)
- [x] Add distance counter HUD
- [x] Add parallax background (two-layer star field)

### In Progress — E2E Testing
- [ ] Set up Playwright test infrastructure (package.json, config, test directory)
- [ ] Write E2E tests for all existing features:
  - [ ] Game loads and shows start screen with title
  - [ ] Game starts on click/space/tap input
  - [ ] Player responds to thrust (moves upward when holding)
  - [ ] Stars appear and score increments on collection
  - [ ] Obstacles appear and cause death on collision
  - [ ] Game over screen shows score and high score
  - [ ] Game restarts correctly after death
  - [ ] High score persists across page reloads (localStorage)
  - [ ] Speed/distance increases over time
  - [ ] Parallax background scrolls

### Next Up — More Features
- [ ] Add sound effects (thrust, collect star, death)
- [ ] Add mobile-responsive controls and sizing
- [ ] Add a simple favicon
- [ ] Improve player visual (animated sprite or better rocket)
- [ ] Add a combo/streak system for collecting stars quickly

## Status

Side-scroller prototype complete with obstacles, scrolling, and difficulty scaling. Now adding mandatory E2E tests per new project requirement.

## Open Questions

None.

## Learnings

- Canvas-based game loop with requestAnimationFrame works well
- Particle effects add a lot of visual polish for very little code
- Variable declaration order matters — `let` declarations called before init cause ReferenceError
- Need to be careful about parallax bg star re-init on resize vs initial load
- Side-scrolling transforms the game feel significantly — much more engaging
