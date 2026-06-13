# Plan

## Current Goal

Continue improving — always making the game better.

## Tasks

### Completed (v0.1.0 — v0.8.0)
- [x] Project scaffolding, canvas game loop, player with directional controls
- [x] Star collectibles, scoring, side-scrolling, obstacle pillars
- [x] Increasing difficulty, persistent high score, parallax background
- [x] E2E test suite (38 tests, all passing)
- [x] Sound effects, SVG favicon, combo/streak system, screen shake
- [x] Game version display (SemVer), power-ups (shield/magnet/slow-mo)
- [x] Pause menu (Escape), lighter gravity
- [x] Multiple star types (gold/silver/ruby/rainbow with different point values)
- [x] Leaderboard (top 5 scores on start screen)
- [x] Difficulty curve (obstacle gaps narrow with distance)

### Next Up
- [ ] Add trail color changes based on active power-up
- [ ] Add milestone notifications (every 10 stars, distance records)
- [ ] Improve player visual (wing flap animation or rocket detail)
- [ ] Add background music (ambient space theme, toggleable)
- [ ] Add mobile on-screen touch controls
- [ ] Add different obstacle types (moving, rotating)
- [ ] Add collectible coins between obstacles for bonus points
- [ ] Add a "best distance" tracker separate from score

## Status

v0.8.0 — 38 E2E tests, 4 star types, leaderboard, difficulty curve.

## Open Questions

None.

## Learnings

- Weighted random selection for star types creates good variety
- Rainbow stars with hue cycling via HSL are visually striking
- Difficulty curve should be gradual — 35% max gap reduction over 5000+ distance
- Leaderboard top-5 with color medals adds replay motivation
