# Plan

## Current Goal

v1.0.0 is released! Continue iterating with new features and polish.

## Tasks

### Completed (v0.1.0 — v1.0.0)
- [x] Project scaffolding, canvas game loop, player with directional controls
- [x] Star collectibles (4 types: gold/silver/ruby/rainbow), scoring, side-scrolling
- [x] Obstacle pillars with difficulty curve (gaps narrow with distance)
- [x] Increasing difficulty, persistent high score, parallax background
- [x] E2E test suite (47 tests, all passing)
- [x] Sound effects (thrust/collect/death/start/power-up), SVG favicon
- [x] Combo/streak system with multipliers and popups
- [x] Screen shake on death, screen flash on power-up
- [x] Game version display (SemVer v1.0.0), leaderboard (top 5)
- [x] Power-ups (shield/magnet/slow-mo) with trail color changes
- [x] Pause menu (Escape), lighter gravity
- [x] Milestone notifications (every 10 stars, distance records)
- [x] Best distance tracker (separate from score, persists)
- [x] Background music (procedural ambient, toggleable with M)
- [x] Difficulty indicator (EASY/MEDIUM/HARD/INSANE/NIGHTMARE)

### Next Up
- [ ] Add mobile on-screen touch controls
- [ ] Add different obstacle types (moving up/down)
- [ ] Improve player visual (wing flap or animated rocket)
- [ ] Add a "how to play" tutorial overlay
- [ ] Add collectible coins between obstacles
- [ ] Add achievements system
- [ ] Add night/day cycle or themed backgrounds
- [ ] Add particle trail diversity (sparkles, smoke)

## Status

v1.0.0 RELEASED — 47 E2E tests, complete game with music, power-ups, star types, leaderboard, milestones, difficulty scaling.

## Learnings

- Procedural ambient music with detuned oscillators creates atmospheric sound
- Screen flash on power-up pickup gives satisfying visual feedback
- Difficulty labels give players a sense of progression
- v1.0.0 milestone: the game is fully playable and polished
