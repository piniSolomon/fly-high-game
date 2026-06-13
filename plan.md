# Plan

## Current Goal

Continue improving — always making the game better.

## Tasks

### Completed (v0.1.0 — v1.1.0)
- [x] All v1.0.0 features (see git history)
- [x] Moving obstacles (oscillate vertically after 800m, frequency scales with distance)
- [x] Mobile on-screen touch controls (visible on touch devices only)

### Next Up
- [ ] Improve player visual (wing flap or animated rocket detail)
- [ ] Add a "how to play" tutorial overlay for first-time players
- [ ] Add collectible coins between obstacles for bonus points
- [ ] Add achievements system (first 100 stars, first 1000m, etc.)
- [ ] Add night/day cycle or themed backgrounds
- [ ] Add particle trail diversity (sparkles, smoke)
- [ ] Add obstacle warning indicator (arrow at right edge before obstacle appears)
- [ ] Add double-tap to activate a stored power-up

## Status

v1.1.0 — 51 E2E tests. Moving obstacles and mobile controls added.

## Learnings

- Sinusoidal oscillation for moving obstacles feels natural and readable
- CSS media query `(hover: none) and (pointer: coarse)` reliably detects touch devices
- Touch event preventDefault + stopPropagation avoids browser zoom/scroll interference
- Moving obstacle chance ramp (0% at <800m, up to 45%) creates smooth difficulty escalation
