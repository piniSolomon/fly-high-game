# Plan

## Current Goal

Continue polishing and adding features to make the game more engaging.

## Tasks

### Completed
- [x] Set up project scaffolding (index.html, style.css, game.js)
- [x] Create a canvas-based game loop (requestAnimationFrame)
- [x] Add a player character that flies (responds to keyboard/mouse input)
- [x] Add gravity and upward thrust mechanics
- [x] Add star collectibles with collision detection
- [x] Add score counter displayed on screen
- [x] Add basic visual polish (background, colors, simple animations)
- [x] Make the game restart-able on boundary hit
- [x] Initialize git repo and make first commit
- [x] Add horizontal scrolling / side-scroller feel
- [x] Add obstacles (rock pillars with gaps)
- [x] Add increasing difficulty (speed over time)
- [x] Add persistent high score (localStorage)
- [x] Add distance counter HUD
- [x] Add parallax background (two-layer star field)
- [x] Set up Playwright E2E tests (26 tests, all passing)
- [x] Add full directional controls (Arrow keys / WASD)
- [x] Lighter gravity for better flight feel
- [x] Add game version display (SemVer)
- [x] Add sound effects (thrust, collect, death, start)
- [x] Add SVG favicon
- [x] Add combo/streak system with multipliers
- [x] Add screen shake on death

### Next Up
- [ ] Add mobile on-screen touch controls (virtual D-pad or swipe zones)
- [ ] Add power-ups (shield, magnet, speed boost)
- [ ] Add background music (ambient space theme)
- [ ] Improve player visual (animated wings or better rocket detail)
- [ ] Add different star types (gold, silver, rare rainbow worth more)
- [ ] Add a pause menu (press Escape)
- [ ] Add smooth difficulty curve (obstacle gap narrows gradually)
- [ ] Add leaderboard display on start screen (top 5 scores)

## Status

v0.6.0 complete. Full-featured side-scroller with directional controls, obstacles, combo system, screen shake, sound effects, 26 E2E tests all green.

## Open Questions

None.

## Learnings

- Canvas game loop with requestAnimationFrame works well
- Particle effects add visual polish for minimal code
- `var` needed for E2E test access via `page.evaluate()`
- Lighter gravity (0.22) feels much better
- E2E tests need deterministic setups for reliability
- Web Audio API procedural sounds work great without any files
- Combo systems need visible feedback (popups, HUD bar) to feel rewarding
- Screen shake adds excellent game feel for death impact
