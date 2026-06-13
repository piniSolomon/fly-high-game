# Plan

## Current Goal

Continue improving — always making the game better.

## Tasks

### Completed (v0.1.0 — v0.9.0)
- [x] Project scaffolding, canvas game loop, player with directional controls
- [x] Star collectibles, scoring, side-scrolling, obstacle pillars
- [x] Increasing difficulty, persistent high score, parallax background
- [x] E2E test suite (43 tests, all passing)
- [x] Sound effects, SVG favicon, combo/streak system, screen shake
- [x] Game version display (SemVer), power-ups (shield/magnet/slow-mo)
- [x] Pause menu (Escape), lighter gravity
- [x] Multiple star types (gold/silver/ruby/rainbow)
- [x] Leaderboard (top 5), difficulty curve (narrowing gaps)
- [x] Trail color changes with power-ups
- [x] Milestone notifications (every 10 stars, distance records)
- [x] Best distance tracker (separate from score, persists)

### Next Up
- [ ] Improve player visual (wing flap or rocket detail animation)
- [ ] Add background music (ambient space theme, toggleable with M key)
- [ ] Add mobile on-screen touch controls (virtual joystick or swipe zones)
- [ ] Add different obstacle types (moving up/down, rotating)
- [ ] Add a "how to play" screen with controls diagram
- [ ] Add collectible coins between obstacles for bonus points
- [ ] Add screen flash effect on power-up activation
- [ ] Add difficulty indicator in HUD (easy/medium/hard/insane)

## Status

v0.9.0 — 43 E2E tests, full feature set with star types, power-ups, milestones, leaderboard, best distance.

## Learnings

- Weighted random for star types creates good variety
- Rainbow stars with hue cycling are visually striking
- Milestone notifications at regular intervals keep players motivated
- Best distance as separate metric from score adds replayability
- Trail color change is subtle but adds visual cohesion with power-ups
