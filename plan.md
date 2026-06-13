# Plan

## Current Goal

Continue improving — always making the game better.

## Tasks

### Completed (v0.1.0 — v1.2.0)
- [x] All v1.1.0 features (see git history)
- [x] Improved player rocket visual (curved body, fins, stripe, cockpit, 3-layer flame)
- [x] Obstacle warning indicators (arrows at right edge showing gap position)

### Next Up
- [ ] Add a "how to play" tutorial overlay for first-time players
- [ ] Add collectible coins between obstacles for bonus points
- [ ] Add achievements system (first 100 stars, first 1000m, etc.)
- [ ] Add night/day cycle or themed backgrounds
- [ ] Add particle trail diversity (sparkles, smoke)
- [ ] Add double-tap to activate a stored power-up
- [ ] Add animated stars (spinning, bobbing)
- [ ] Add sound volume control

## Status

v1.2.0 — 53 E2E tests. Improved rocket, obstacle warnings.

## Learnings

- Quadratic bezier curves create much smoother rocket shape than flat polygons
- Three-layer flame (orange → yellow → white) creates convincing thrust visual
- Idle exhaust flicker adds life when not thrusting
- Obstacle warnings reduce frustration without reducing challenge
- Warning fade-in tied to obstacle x-position is more natural than sudden appear
