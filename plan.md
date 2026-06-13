# Plan

## Current Goal

The game is feature-complete. Continue iterating on polish and new ideas.

## Tasks

### Completed (v0.1.0 — v2.2.0)
- [x] All v2.1.0 features (see git history)
- [x] Dynamic music (4 chord progressions matched to themes, smooth transitions)

### Next Up — Future Ideas
- [ ] Refactor game.js into modules (audio, rendering, state, input)
- [ ] Performance optimization (object pooling for particles)
- [ ] Add player skins (unlock with achievements)
- [ ] Add a replay system (watch last death)
- [ ] Add seasonal events or daily challenges
- [ ] Add endless mode variants (speed-only, stars-only)
- [ ] Add multiplayer (split screen or network)
- [ ] Add procedural terrain (mountains, floating islands)

## Status

v2.2.0 — 86 E2E tests. Dynamic music. 22 versions, 38 commits, ~2800 lines of game code.

## Learnings

- linearRampToValueAtTime creates smooth frequency transitions without audio pops
- Matching chord progressions to visual themes creates cohesive audiovisual experience
- Checking chord change every 60 frames (~1s) is responsive enough without CPU waste
- Four distinct chords (open fifth, major, dark fifth, warm) create varied emotional tones
