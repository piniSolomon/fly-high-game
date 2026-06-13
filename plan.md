# Plan

## Current Goal

Continue improving — always making the game better.

## Tasks

### Completed (v0.1.0 — v1.4.0)
- [x] All v1.3.0 features (see git history)
- [x] Tutorial overlay for first-time players (controls, collectibles, dangers)
- [x] Collectible coins in obstacle gaps (spinning 3D, 3 bonus points)

### Next Up
- [ ] Add particle trail diversity (sparkles when collecting, smoke on damage)
- [ ] Add animated stars (gentle bobbing motion)
- [ ] Add sound volume control (+ / - keys)
- [ ] Add smooth theme transitions (lerp between background colors)
- [ ] Add achievement gallery screen (press Tab to view all achievements)
- [ ] Add daily challenge mode (fixed seed, compete for best score)
- [ ] Add screen edge bounce option (instead of death on top/bottom)
- [ ] Add cloud/nebula parallax layer for visual depth

## Status

v1.4.0 — 64 E2E tests. Tutorial, coins, achievements, themes.

## Learnings

- Tutorial must be gated properly — existing tests break if it intercepts clicks
- startGame helper needs to skip tutorial for deterministic testing
- Coins in obstacle gaps reward precision and risk-taking
- Spinning coin via cosine X-scale creates convincing 3D rotation
