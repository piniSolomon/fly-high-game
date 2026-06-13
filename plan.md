# Plan

## Current Goal

v2.0.0 released! Continue iterating.

## Tasks

### Completed (v0.1.0 — v2.0.0)
- [x] All v1.9.0 features (see git history)
- [x] Nebula cloud parallax layer (6 drifting radial-gradient blobs, deepest parallax)

### Next Up
- [ ] Refactor game.js into modules (audio, rendering, state, input)
- [ ] Performance optimization (object pooling for particles)
- [ ] Add controller/gamepad support
- [ ] Add dynamic music (chord changes with theme/difficulty)
- [ ] Add player skins (unlock with achievements)
- [ ] Add a replay system (watch last death)
- [ ] Add seasonal events or daily challenges
- [ ] Add endless mode variants (speed-only, stars-only)

## Status

v2.0.0 RELEASED — 81 E2E tests. Nebula clouds, 3-layer parallax background. ~2600 lines of game code.

## Learnings

- Radial gradients with low alpha create convincing nebula effects
- Three parallax layers (clouds, far stars, near stars) give real depth
- Wobble with sinusoidal offset makes clouds feel organic
- Recycling off-screen objects with new random properties keeps the view fresh
