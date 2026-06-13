# Plan

## Current Goal

Continue improving — always making the game better.

## Tasks

### Completed (v0.1.0 — v1.6.0)
- [x] All v1.5.0 features (see git history)
- [x] Sound volume control (+/- keys, master gain node, HUD display)
- [x] Achievement gallery screen (Tab key, full list, unlock/lock display)

### Next Up
- [ ] Add smooth theme transitions (lerp between background colors at boundaries)
- [ ] Add cloud/nebula parallax layer for visual depth
- [ ] Add progressive obstacle coloring (darker at higher difficulty)
- [ ] Add a minimap showing nearby stars
- [ ] Add screen edge warning (vignette when near top/bottom)
- [ ] Refactor game.js into modules (separate files for audio, rendering, state)
- [ ] Add a settings persistence system (volume, music on/off saved to localStorage)
- [ ] Performance optimization (object pooling for particles)

## Status

v1.6.0 — 70 E2E tests. Volume control, achievement gallery. ~2100 lines of game code.

## Learnings

- Master gain node pattern cleanly controls all audio with one knob
- Achievement gallery needs both locked and unlocked visual states to motivate
- Tab key is a good non-conflicting key for menus on start screen
- Volume clamping to 0-1 prevents audio distortion
