# Plan

## Current Goal

Continue improving — always making the game better.

## Tasks

### Completed (v0.1.0 — v1.3.0)
- [x] All v1.2.0 features (see git history)
- [x] Achievements system (13 achievements, localStorage persistence, popup notifications)
- [x] Themed backgrounds (4 themes cycling every 1500m: space/nebula/deep/aurora)

### Next Up
- [ ] Add a "how to play" tutorial overlay for first-time players
- [ ] Add collectible coins between obstacles for bonus points
- [ ] Add particle trail diversity (sparkles, smoke)
- [ ] Add double-tap to activate a stored power-up
- [ ] Add animated stars (spinning, bobbing)
- [ ] Add sound volume control
- [ ] Add smooth theme transitions (lerp between colors)
- [ ] Add achievement gallery screen

## Status

v1.3.0 — 58 E2E tests. Achievements and themed backgrounds.

## Learnings

- Achievements need both check-on-tick and check-on-death to avoid missing edge cases
- Themed backgrounds cycling with distance creates a sense of journey/progression
- Achievement popup with a rounded pill background reads better than floating text
- sessionPowerupsUsed as a Set cleanly tracks unique power-up types collected
