# Plan

## Current Goal

Continue improving — always making the game better.

## Tasks

### Completed (v0.1.0 — v1.8.0)
- [x] All v1.7.0 features (see git history)
- [x] Smooth theme transitions (hex lerp in last 20% of each zone)
- [x] Stats screen (I key, 10 lifetime metrics, persisted to localStorage)

### Next Up
- [ ] Add cloud/nebula parallax layer for visual depth
- [ ] Add progressive obstacle coloring (darker at higher difficulty)
- [ ] Refactor game.js into modules (audio, rendering, state, input)
- [ ] Performance optimization (object pooling for particles)
- [ ] Add controller/gamepad support
- [ ] Add a "zen mode" (no obstacles, just flying and collecting)
- [ ] Add dynamic music (chord changes with theme/difficulty)
- [ ] Add seasonal events or daily challenges

## Status

v1.8.0 — 77 E2E tests. Theme transitions, stats screen, lifetime tracking. ~2400 lines of game code.

## Learnings

- Hex color lerp via RGB decomposition creates smooth gradients between themes
- Transition in the last 20% of a zone (not abrupt) feels natural and non-jarring
- Lifetime stats with avg-per-game give players insight into improvement over time
- sessionStartTime tracking requires careful Date.now() handling on death
