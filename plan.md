# Plan

## Current Goal

Continue improving — always making the game better.

## Tasks

### Completed (v0.1.0 — v2.1.0)
- [x] All v2.0.0 features (see git history)
- [x] Gamepad/controller support (stick + buttons, auto-detect, coexists with all input)

### Next Up
- [ ] Refactor game.js into modules (audio, rendering, state, input)
- [ ] Performance optimization (object pooling for particles)
- [ ] Add dynamic music (chord changes with theme/difficulty)
- [ ] Add player skins (unlock with achievements)
- [ ] Add a replay system (watch last death)
- [ ] Add seasonal events or daily challenges
- [ ] Add endless mode variants (speed-only, stars-only)
- [ ] Add multiplayer (split screen or network)

## Status

v2.1.0 — 83 E2E tests. Gamepad support. ~2700 lines of game code, 36 commits.

## Learnings

- navigator.getGamepads() must be polled each frame — no event-driven API
- Deadzone (0.3) prevents stick drift from triggering movement
- Start button needs debounce (held flag) to prevent rapid pause/unpause
- Coexisting input methods (keyboard + mouse + touch + gamepad) works by OR-ing all key flags
