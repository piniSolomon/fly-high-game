# Plan

## Current Goal

Add sound effects and a favicon to polish the game experience.

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
- [x] Set up Playwright E2E test infrastructure (19 tests, all passing)
- [x] Add full directional controls (Arrow keys / WASD — up, down, left, right)
- [x] Lighter gravity for better flight feel
- [x] Add game version display on start screen (SemVer)

### In Progress
- [ ] Add sound effects (thrust, collect star, death)
- [ ] Add a simple favicon

### Next Up
- [ ] Add mobile-responsive touch controls (on-screen buttons or swipe zones)
- [ ] Improve player visual (animated sprite or better rocket)
- [ ] Add a combo/streak system for collecting stars quickly
- [ ] Add background music (ambient space theme)
- [ ] Add screen shake on death
- [ ] Add power-ups (shield, magnet, speed boost)

## Status

v0.4.0 complete. 19 E2E tests passing. Game is playable with full directional controls, obstacles, stars, scoring, and difficulty scaling. Moving to audio/polish phase.

## Open Questions

None.

## Learnings

- Canvas-based game loop with requestAnimationFrame works well
- Particle effects add a lot of visual polish for very little code
- Variable declaration order matters — `let` declarations called before init cause ReferenceError
- Need `var` for game state to be accessible in Playwright E2E tests via `page.evaluate()`
- Side-scrolling transforms the game feel significantly — much more engaging
- Lighter gravity (0.22) makes flight much more enjoyable and controllable
- E2E tests for games need deterministic setups (teleport player, force-spawn) rather than playing through
