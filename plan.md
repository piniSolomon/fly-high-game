# Plan

## Current Goal

Continue improving — always making the game better.

## Tasks

### Completed (v0.1.0 — v1.5.0)
- [x] All v1.4.0 features (see git history)
- [x] Particle diversity: sparkles (four-pointed spinning stars) and smoke (expanding puffs)
- [x] Animated stars with gentle bobbing motion

### Next Up
- [ ] Add sound volume control (+ / - keys)
- [ ] Add smooth theme transitions (lerp between background colors)
- [ ] Add achievement gallery screen (press Tab to view all achievements)
- [ ] Add cloud/nebula parallax layer for visual depth
- [ ] Add daily challenge mode (fixed seed, compete for best score)
- [ ] Add screen edge bounce option
- [ ] Add a minimap or radar showing nearby stars/obstacles
- [ ] Add progressive obstacle coloring (darker at higher difficulty)

## Status

v1.5.0 — 67 E2E tests. Sparkle/smoke particles, bobbing stars.

## Learnings

- Particle type field is simple but effective for rendering variety
- Smoke particles that grow while fading (size * (2 - life)) look natural
- Star bobbing with unique phase offsets creates organic staggered motion
- Adding a type parameter with default value keeps backward compatibility clean
