# Plan

## Current Goal

The game is feature-complete and polished. Continue iterating with new ideas.

## Tasks

### Completed (v0.1.0 — v2.3.0)
- [x] All v2.2.0 features (see git history)
- [x] Player skins (6 skins, unlocked via achievements, [ ] to cycle, persists)

### Next Up — Future Ideas
- [ ] Refactor game.js into modules (audio, rendering, state, input)
- [ ] Performance optimization (object pooling for particles)
- [ ] Add a replay system (watch last death)
- [ ] Add seasonal events or daily challenges
- [ ] Add endless mode variants (speed-only, stars-only)
- [ ] Add multiplayer (split screen or network)
- [ ] Add procedural terrain (mountains, floating islands)
- [ ] Add a skin preview on start screen

## Status

v2.3.0 — 89 E2E tests. Player skins. 23 versions, 40 commits, ~2900 lines of game code.

## Learnings

- Achievement-gated unlocks add motivation to chase specific goals
- Rainbow skin with hue cycling needs both body + stripe to animate cohesively
- Fin color derived from body via lerpColor darkening works for all skin colors
- HSL-based rainbow needs special handling since lerpColor expects hex
