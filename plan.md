# Plan

## Current Goal

Continue improving — always making the game better.

## Tasks

### Completed (v0.1.0 — v1.7.0)
- [x] All v1.6.0 features (see git history)
- [x] Settings persistence (volume + music preference saved to localStorage)
- [x] Screen edge warnings (red vignette gradient near top/bottom boundaries)

### Next Up
- [ ] Add smooth theme transitions (lerp between background colors)
- [ ] Add cloud/nebula parallax layer for visual depth
- [ ] Add progressive obstacle coloring (darker at higher difficulty)
- [ ] Refactor game.js into modules (audio, rendering, state, input)
- [ ] Performance optimization (object pooling for particles)
- [ ] Add a "stats" screen (total games played, total stars, time played)
- [ ] Add controller/gamepad support
- [ ] Add a "zen mode" (no obstacles, just flying and collecting)

## Status

v1.7.0 — 73 E2E tests. Settings persistence, edge warnings. ~2200 lines of game code.

## Learnings

- Settings persistence needs both a general settings object and individual keys for different consumers
- musicAutoStart flag cleanly separates "should music play" from "is music playing"
- Edge vignettes give a subtle but effective danger warning without HUD clutter
- Gradient alpha tied to distance from edge gives natural intensity scaling
