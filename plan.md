# Plan

## Current Goal

Continue improving — always making the game better.

## Tasks

### Completed (v0.1.0 — v1.9.0)
- [x] All v1.8.0 features (see git history)
- [x] Zen mode (Z key — no obstacles, screen wrap, peaceful play)
- [x] Progressive obstacle coloring (darker + more saturated with distance)

### Next Up
- [ ] Add cloud/nebula parallax layer for visual depth
- [ ] Refactor game.js into modules (audio, rendering, state, input)
- [ ] Performance optimization (object pooling for particles)
- [ ] Add controller/gamepad support
- [ ] Add dynamic music (chord changes with theme/difficulty)
- [ ] Add seasonal events or daily challenges
- [ ] Add player skins (unlock with achievements)
- [ ] Add a replay system (watch last death)

## Status

v1.9.0 — 80 E2E tests. Zen mode, progressive coloring. ~2500 lines of game code.

## Learnings

- Zen mode with screen wrap creates a completely different feel — relaxing vs intense
- Progressive coloring (HSL lightness + saturation) creates subtle visual danger cues
- Boundary wrapping (y → opposite edge) needs careful PLAYER_SIZE offset
- Testing wrap behavior needs multiple frame ticks — single-frame assertions are flaky
