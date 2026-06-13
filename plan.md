# Plan

## Current Goal

Continue adding features and polish — the game should always get better.

## Tasks

### Completed
- [x] Project scaffolding and canvas game loop
- [x] Player with gravity/thrust and directional controls (WASD/arrows)
- [x] Star collectibles with collision detection and scoring
- [x] Side-scrolling with obstacle pillars
- [x] Increasing difficulty (speed over time)
- [x] Persistent high score (localStorage)
- [x] Parallax two-layer background
- [x] E2E test suite (32 tests, all passing)
- [x] Sound effects (thrust, collect, death, start, power-up)
- [x] SVG favicon
- [x] Combo/streak system with multipliers and popups
- [x] Screen shake on death
- [x] Game version display (SemVer — v0.7.0)
- [x] Power-ups: shield, magnet, slow-mo
- [x] Pause menu (Escape key)
- [x] Lighter gravity for better flight feel

### Next Up
- [ ] Add different star types (gold, silver, rare rainbow worth more)
- [ ] Add smooth difficulty curve (obstacle gap narrows gradually)
- [ ] Add leaderboard display on start screen (top 5 scores from localStorage)
- [ ] Improve player visual (wing flap animation or rocket detail)
- [ ] Add background music (ambient space theme, toggleable)
- [ ] Add mobile on-screen touch controls
- [ ] Add trail color changes based on active power-up
- [ ] Add milestone notifications (every 10 stars, distance records)

## Status

v0.7.0 — full-featured game with power-ups, pause, combo system, 32 E2E tests.

## Open Questions

None.

## Learnings

- `var` scope needed for E2E test access
- Web Audio API procedural sounds work great
- Combo systems need visible feedback (popups + timer bar)
- Screen shake adds excellent game feel
- Power-up effectiveSpeed multiplier cleanly slows everything
- Pause requires checking `paused` flag at top of update loop
- E2E test determinism: force-spawn and teleport > playing through
