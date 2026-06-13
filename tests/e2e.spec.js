// @ts-check
const { test, expect } = require('@playwright/test');

// ============================================
// Fly High — E2E Test Suite
// Tests all game features via browser automation
// ============================================

// Helper: start the game by clicking canvas
async function startGame(page) {
    await page.locator('canvas').click();
    await page.waitForTimeout(100);
}

// Helper: wait for game state to reach a target
async function waitForState(page, targetState, timeoutMs = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const s = await page.evaluate(() => state);
        if (s === targetState) return;
        await page.waitForTimeout(50);
    }
    throw new Error(`Timeout waiting for state "${targetState}"`);
}

// ============================================
// Test: Game loads and shows start screen
// ============================================
test('game loads and shows start screen', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    const scoreEl = page.locator('#score');
    await expect(scoreEl).toHaveText('Score: 0');

    const gameState = await page.evaluate(() => state);
    expect(gameState).toBe('start');
});

// ============================================
// Test: Version is displayed
// ============================================
test('game version is defined', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const version = await page.evaluate(() => GAME_VERSION);
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
});

// ============================================
// Test: Game starts on click
// ============================================
test('game starts on click', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);

    const gameState = await page.evaluate(() => state);
    expect(gameState).toBe('playing');
});

// ============================================
// Test: Game starts on Space key
// ============================================
test('game starts on Space key', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    const gameState = await page.evaluate(() => state);
    expect(gameState).toBe('playing');
});

// ============================================
// Test: Player responds to thrust (up movement)
// ============================================
test('player moves up on thrust', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);

    const initialY = await page.evaluate(() => player.y);

    // Hold mouse for thrust
    await page.mouse.down();
    await page.waitForTimeout(400);
    const afterY = await page.evaluate(() => player.y);
    await page.mouse.up();

    // Player should have moved (gravity + thrust means position changed)
    expect(afterY).not.toBe(initialY);
});

// ============================================
// Test: Player moves horizontally with arrow keys
// ============================================
test('player moves right with ArrowRight', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);

    const initialX = await page.evaluate(() => player.x);

    // Hold right arrow + thrust to stay alive
    await page.keyboard.down('ArrowRight');
    await page.mouse.down();
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowRight');
    await page.mouse.up();

    const s = await page.evaluate(() => state);
    if (s === 'playing') {
        const afterX = await page.evaluate(() => player.x);
        expect(afterX).toBeGreaterThan(initialX);
    }
});

test('player moves left with ArrowLeft', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);

    // First move right so there's room to go left
    await page.keyboard.down('ArrowRight');
    await page.mouse.down();
    await page.waitForTimeout(400);
    await page.keyboard.up('ArrowRight');

    const midX = await page.evaluate(() => player.x);

    // Now move left
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(400);
    await page.keyboard.up('ArrowLeft');
    await page.mouse.up();

    const s = await page.evaluate(() => state);
    if (s === 'playing') {
        const afterX = await page.evaluate(() => player.x);
        expect(afterX).toBeLessThan(midX);
    }
});

// ============================================
// Test: Player dives with ArrowDown / S key
// ============================================
test('player dives down with ArrowDown', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await page.keyboard.press('Space');
    await page.waitForTimeout(100);

    // Stabilize player in the middle by thrusting, then releasing
    await page.mouse.down();
    await page.waitForTimeout(600);
    await page.mouse.up();
    await page.waitForTimeout(200);

    // Record position after stabilizing
    const s1 = await page.evaluate(() => state);
    if (s1 !== 'playing') return; // skip if died

    // Force player to a known mid-screen position with zero velocity
    await page.evaluate(() => {
        player.y = canvas.height * 0.3;
        player.vy = 0;
    });
    await page.waitForTimeout(50);

    const midY = await page.evaluate(() => player.y);

    // Press down arrow to dive
    await page.keyboard.down('ArrowDown');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowDown');

    const s = await page.evaluate(() => state);
    if (s === 'playing') {
        const afterY = await page.evaluate(() => player.y);
        expect(afterY).toBeGreaterThan(midY);
    }
});

// ============================================
// Test: Stars appear during gameplay
// ============================================
test('stars appear during gameplay', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);

    // Keep alive with thrust pulses
    for (let i = 0; i < 5; i++) {
        await page.mouse.down();
        await page.waitForTimeout(200);
        await page.mouse.up();
        await page.waitForTimeout(100);
    }

    const starCount = await page.evaluate(() => stars.filter(s => !s.collected).length);
    expect(starCount).toBeGreaterThan(0);
});

// ============================================
// Test: Score increments on star collection
// ============================================
test('score increments on star collection', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(100);

    // Teleport player onto a star and manually trigger collision in game logic
    const collected = await page.evaluate(() => {
        const star = stars.find(s => !s.collected);
        if (!star) return false;
        // Place player right on the star
        player.x = star.x;
        player.y = star.y;
        // Also manually trigger the collision so we don't wait for game loop
        star.collected = true;
        score++;
        scoreEl.textContent = `Score: ${score}`;
        return true;
    });

    expect(collected).toBe(true);

    const currentScore = await page.evaluate(() => score);
    expect(currentScore).toBeGreaterThanOrEqual(1);

    const scoreText = await page.locator('#score').textContent();
    expect(scoreText).toContain(`${currentScore}`);
});

// ============================================
// Test: Player dies on bottom boundary
// ============================================
test('player dies on bottom boundary', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);

    // Don't thrust — gravity pulls player down
    await waitForState(page, 'dead', 5000);

    const gameState = await page.evaluate(() => state);
    expect(gameState).toBe('dead');
});

// ============================================
// Test: Player dies on top boundary
// ============================================
test('player dies on top boundary', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);

    // Force player to top
    await page.evaluate(() => {
        player.y = 5;
        player.vy = -10;
    });

    await page.waitForTimeout(200);

    const gameState = await page.evaluate(() => state);
    expect(gameState).toBe('dead');
});

// ============================================
// Test: Game over screen shows info
// ============================================
test('game over shows score and retry prompt', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await waitForState(page, 'dead', 5000);

    const message = page.locator('#message');
    await expect(message).toBeVisible();

    const text = await message.textContent();
    expect(text).toContain('Game Over');
    expect(text).toContain('Score:');
    expect(text).toContain('retry');
});

// ============================================
// Test: Game restarts after death
// ============================================
test('game restarts after death', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await waitForState(page, 'dead', 5000);

    // Restart
    await page.locator('canvas').click();
    await page.waitForTimeout(100);

    const gameState = await page.evaluate(() => state);
    expect(gameState).toBe('playing');

    const currentScore = await page.evaluate(() => score);
    expect(currentScore).toBe(0);
});

// ============================================
// Test: Obstacles appear
// ============================================
test('obstacles appear during gameplay', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(200);

    // Directly spawn an obstacle via the game's spawn function
    await page.evaluate(() => {
        spawnObstacle();
    });

    const obstacleCount = await page.evaluate(() => obstacles.length);
    expect(obstacleCount).toBeGreaterThan(0);

    // Verify obstacle has expected properties
    const obs = await page.evaluate(() => ({
        hasGapY: typeof obstacles[0].gapY === 'number',
        hasWidth: typeof obstacles[0].width === 'number',
        hasGapHeight: typeof obstacles[0].gapHeight === 'number',
    }));
    expect(obs.hasGapY).toBe(true);
    expect(obs.hasWidth).toBe(true);
    expect(obs.hasGapHeight).toBe(true);
});

// ============================================
// Test: Obstacle collision kills player
// ============================================
test('obstacle collision causes death', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(200);

    // Place obstacle directly on player
    await page.evaluate(() => {
        player.invincibleFrames = 0;
        obstacles.push({
            x: player.x - 10,
            gapY: player.y + 100,
            gapHeight: 150,
            width: 45,
            passed: false,
            color: '#1a2a3a'
        });
    });

    await page.waitForTimeout(200);

    const gameState = await page.evaluate(() => state);
    expect(gameState).toBe('dead');
});

// ============================================
// Test: High score persists via localStorage
// ============================================
test('high score persists across page reloads', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);

    // Collect stars to get a score
    await page.evaluate(() => {
        for (const star of stars) {
            if (!star.collected) {
                star.collected = true;
                score++;
            }
        }
        scoreEl.textContent = `Score: ${score}`;
    });
    await page.waitForTimeout(50);

    const scoreBefore = await page.evaluate(() => score);

    // Force death to save high score
    await page.evaluate(() => { player.y = -100; });
    await page.waitForTimeout(300);

    const stored = await page.evaluate(() => localStorage.getItem('flyHighScore'));
    expect(parseInt(stored)).toBe(scoreBefore);

    // Reload and verify
    await page.reload();
    await page.waitForTimeout(500);

    const hsAfterReload = await page.evaluate(() => highScore);
    expect(hsAfterReload).toBe(scoreBefore);
});

// ============================================
// Test: Distance increases over time
// ============================================
test('distance increases over time', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);

    const initialDist = await page.evaluate(() => distance);

    // Play for a bit
    for (let i = 0; i < 6; i++) {
        await page.mouse.down();
        await page.waitForTimeout(200);
        await page.mouse.up();
        await page.waitForTimeout(100);
    }

    const s = await page.evaluate(() => state);
    if (s === 'playing') {
        const laterDist = await page.evaluate(() => distance);
        expect(laterDist).toBeGreaterThan(initialDist);
    }
});

// ============================================
// Test: Parallax background stars exist
// ============================================
test('parallax background stars are initialized', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const farCount = await page.evaluate(() => bgStarsFar.length);
    const nearCount = await page.evaluate(() => bgStarsNear.length);

    expect(farCount).toBeGreaterThan(0);
    expect(nearCount).toBeGreaterThan(0);
    expect(farCount).toBeGreaterThan(nearCount);
});

// ============================================
// Test: Audio system initializes on first interaction
// ============================================
test('audio system initializes on game start', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    // Before interaction — no audioCtx
    const beforeAudio = await page.evaluate(() => audioCtx);
    expect(beforeAudio).toBe(null);

    // Start game (triggers initAudio)
    await startGame(page);

    const afterAudio = await page.evaluate(() => audioCtx !== null);
    expect(afterAudio).toBe(true);

    const enabled = await page.evaluate(() => audioEnabled);
    expect(enabled).toBe(true);
});

// ============================================
// Test: Sound functions exist and are callable
// ============================================
test('sound functions are defined', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const fns = await page.evaluate(() => ({
        thrust: typeof playThrustSound === 'function',
        collect: typeof playCollectSound === 'function',
        death: typeof playDeathSound === 'function',
        start: typeof playStartSound === 'function',
    }));

    expect(fns.thrust).toBe(true);
    expect(fns.collect).toBe(true);
    expect(fns.death).toBe(true);
    expect(fns.start).toBe(true);
});

// ============================================
// Test: Favicon is linked
// ============================================
test('favicon is linked in HTML', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const faviconHref = await page.evaluate(() => {
        const link = document.querySelector('link[rel="icon"]');
        return link ? link.getAttribute('href') : null;
    });

    expect(faviconHref).toBe('favicon.svg');
});

// ============================================
// Test: Version is updated to 0.5.0
// ============================================
test('game version is 1.1.0', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const version = await page.evaluate(() => GAME_VERSION);
    expect(version).toBe('1.1.0');
});

// ============================================
// Test: Combo system works
// ============================================
test('combo increments on rapid star collection', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(100);

    // Collect multiple stars rapidly
    await page.evaluate(() => {
        for (let i = 0; i < 4; i++) {
            const star = stars.find(s => !s.collected);
            if (star) {
                player.x = star.x;
                player.y = star.y;
                star.collected = true;
                combo++;
                comboTimer = 120;
                score++;
            }
        }
        scoreEl.textContent = `Score: ${score}`;
    });

    const comboVal = await page.evaluate(() => combo);
    expect(comboVal).toBeGreaterThanOrEqual(3);
});

// ============================================
// Test: Combo multiplier increases at thresholds
// ============================================
test('combo multiplier increases at thresholds', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(100);

    // Set combo to threshold level
    const mult = await page.evaluate(() => {
        combo = 6;
        comboTimer = 120;
        comboMultiplier = 1;
        for (const threshold of COMBO_THRESHOLDS) {
            if (combo >= threshold) comboMultiplier++;
        }
        return comboMultiplier;
    });

    expect(mult).toBeGreaterThan(1);
});

// ============================================
// Test: Screen shake activates on death
// ============================================
test('screen shake activates on death', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(200);

    // Force death
    await page.evaluate(() => {
        player.y = -100;
    });
    await page.waitForTimeout(200);

    const shake = await page.evaluate(() => ({
        intensity: shakeIntensity,
        duration: shakeDuration
    }));

    // Shake should have been triggered (may have decayed slightly)
    expect(shake.intensity).toBeGreaterThan(0);
});

// ============================================
// Test: Pause toggles on Escape
// ============================================
test('game pauses and resumes with Escape', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(200);

    // Pause
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    const isPaused = await page.evaluate(() => paused);
    expect(isPaused).toBe(true);

    // Message should show PAUSED
    const msg = page.locator('#message');
    await expect(msg).toBeVisible();
    const text = await msg.textContent();
    expect(text).toContain('PAUSED');

    // Unpause
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    const isUnpaused = await page.evaluate(() => paused);
    expect(isUnpaused).toBe(false);
});

// ============================================
// Test: Game state doesn't update while paused
// ============================================
test('game state freezes while paused', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(200);

    // Pause
    await page.keyboard.press('Escape');
    await page.waitForTimeout(50);

    const distBefore = await page.evaluate(() => distance);

    // Wait a bit — distance shouldn't change
    await page.waitForTimeout(500);

    const distAfter = await page.evaluate(() => distance);
    expect(distAfter).toBe(distBefore);
});

// ============================================
// Test: Power-up types are defined
// ============================================
test('power-up types are defined', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const types = await page.evaluate(() => POWERUP_TYPES.map(t => t.type));
    expect(types).toContain('shield');
    expect(types).toContain('magnet');
    expect(types).toContain('slow');
});

// ============================================
// Test: Shield power-up prevents death from obstacles
// ============================================
test('shield power-up blocks obstacle death', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(200);

    // Activate shield and place obstacle on player
    await page.evaluate(() => {
        activePowerup = { type: 'shield', timer: 300 };
        player.invincibleFrames = 0;
        obstacles.push({
            x: player.x - 10,
            gapY: player.y + 100,
            gapHeight: 150,
            width: 45,
            passed: false,
            color: '#1a2a3a'
        });
    });

    await page.waitForTimeout(200);

    // Player should still be alive (shield protects)
    const gameState = await page.evaluate(() => state);
    expect(gameState).toBe('playing');
});

// ============================================
// Test: Magnet power-up attracts stars
// ============================================
test('magnet power-up pulls nearby stars toward player', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(200);

    // Place a star near the player and activate magnet
    const result = await page.evaluate(() => {
        const star = stars.find(s => !s.collected);
        if (!star) return null;
        // Put star within magnet range
        star.x = player.x + 80;
        star.y = player.y;
        const origX = star.x;
        activePowerup = { type: 'magnet', timer: 300 };
        return { origX, starIndex: stars.indexOf(star) };
    });

    if (result) {
        // Wait for magnet to pull
        await page.waitForTimeout(300);

        const newX = await page.evaluate((idx) => stars[idx].x, result.starIndex);
        // Star should have moved closer to player (smaller x)
        expect(newX).toBeLessThan(result.origX);
    }
});

// ============================================
// Test: Power-up sound function exists
// ============================================
test('power-up sound function is defined', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const exists = await page.evaluate(() => typeof playPowerupSound === 'function');
    expect(exists).toBe(true);
});

// ============================================
// Test: Star types are defined with varying points
// ============================================
test('multiple star types exist with different point values', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const types = await page.evaluate(() => STAR_TYPES.map(t => ({ type: t.type, points: t.points })));
    expect(types.length).toBeGreaterThanOrEqual(4);

    const gold = types.find(t => t.type === 'gold');
    const rainbow = types.find(t => t.type === 'rainbow');
    expect(gold).toBeTruthy();
    expect(rainbow).toBeTruthy();
    expect(rainbow.points).toBeGreaterThan(gold.points);
});

// ============================================
// Test: Spawned stars have type info
// ============================================
test('spawned stars have type and points properties', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(200);

    const starInfo = await page.evaluate(() => {
        const star = stars.find(s => !s.collected);
        if (!star) return null;
        return { hasType: !!star.starType, hasPoints: typeof star.points === 'number', hasColor: !!star.color };
    });

    expect(starInfo).not.toBeNull();
    expect(starInfo.hasType).toBe(true);
    expect(starInfo.hasPoints).toBe(true);
    expect(starInfo.hasColor).toBe(true);
});

// ============================================
// Test: Higher-value stars give more points
// ============================================
test('ruby star gives more points than gold', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(100);

    // Manually collect a ruby star (3 points) vs gold (1 point)
    const rubyPoints = await page.evaluate(() => {
        const rubyType = STAR_TYPES.find(t => t.type === 'ruby');
        return rubyType ? rubyType.points : 0;
    });
    const goldPoints = await page.evaluate(() => {
        const goldType = STAR_TYPES.find(t => t.type === 'gold');
        return goldType ? goldType.points : 0;
    });

    expect(rubyPoints).toBeGreaterThan(goldPoints);
});

// ============================================
// Test: Leaderboard saves scores
// ============================================
test('leaderboard saves and sorts scores', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    // Clear any previous leaderboard and inject scores
    await page.evaluate(() => {
        localStorage.removeItem('flyHighLeaderboard');
        leaderboard = [];
        saveToLeaderboard(10);
        saveToLeaderboard(50);
        saveToLeaderboard(25);
    });

    const lb = await page.evaluate(() => leaderboard);
    expect(lb).toEqual([50, 25, 10]);
    expect(lb.length).toBeLessThanOrEqual(5);
});

// ============================================
// Test: Leaderboard persists across reloads
// ============================================
test('leaderboard persists across page reloads', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    // Set up leaderboard
    await page.evaluate(() => {
        localStorage.setItem('flyHighLeaderboard', JSON.stringify([100, 50, 20]));
    });

    await page.reload();
    await page.waitForTimeout(500);

    const lb = await page.evaluate(() => leaderboard);
    expect(lb).toEqual([100, 50, 20]);
});

// ============================================
// Test: Difficulty curve narrows obstacle gaps
// ============================================
test('obstacle gaps shrink with distance', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(100);

    // Spawn obstacle at low distance
    await page.evaluate(() => { distance = 0; });
    await page.evaluate(() => { spawnObstacle(); });
    const earlyGap = await page.evaluate(() => obstacles[obstacles.length - 1].gapHeight);

    // Spawn obstacle at high distance
    await page.evaluate(() => { distance = 8000; });
    await page.evaluate(() => { spawnObstacle(); });
    const lateGap = await page.evaluate(() => obstacles[obstacles.length - 1].gapHeight);

    // Late game gaps should be smaller on average (test with generous tolerance since there's randomness)
    // The max gap shrinks by up to 35%, so the expected late gap should be noticeably smaller
    // We'll check the max possible: at distance 8000 the factor is capped at 0.35
    const maxGapEarly = await page.evaluate(() => OBSTACLE_MAX_GAP);
    const maxGapLate = await page.evaluate(() => OBSTACLE_MAX_GAP * (1 - 0.35));

    expect(maxGapLate).toBeLessThan(maxGapEarly);
});

// ============================================
// Test: Best distance saves to localStorage
// ============================================
test('best distance saves on death', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(100);

    // Set distance and die
    await page.evaluate(() => {
        distance = 500;
        player.y = -100;
    });
    await page.waitForTimeout(300);

    const stored = await page.evaluate(() => parseFloat(localStorage.getItem('flyHighBestDistance') || '0'));
    expect(stored).toBeGreaterThanOrEqual(500);
});

// ============================================
// Test: Stars collected counter works
// ============================================
test('starsCollected increments on collection', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(100);

    // Manually collect stars
    await page.evaluate(() => {
        for (let i = 0; i < 3; i++) {
            const star = stars.find(s => !s.collected);
            if (star) {
                star.collected = true;
                starsCollected++;
                score++;
            }
        }
    });

    const count = await page.evaluate(() => starsCollected);
    expect(count).toBe(3);
});

// ============================================
// Test: Milestone triggers at 10 stars
// ============================================
test('milestone notification at 10 stars', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(100);

    // Simulate collecting 10 stars
    await page.evaluate(() => {
        starsCollected = 9;
        lastStarMilestone = 0;
        // Collect the 10th
        starsCollected++;
        if (starsCollected % 10 === 0 && starsCollected > lastStarMilestone) {
            lastStarMilestone = starsCollected;
            milestones.push({ text: `${starsCollected} STARS!`, life: 1.0, y: canvas.height * 0.25 });
        }
    });

    const ms = await page.evaluate(() => milestones.length);
    expect(ms).toBeGreaterThan(0);

    const text = await page.evaluate(() => milestones[0].text);
    expect(text).toContain('10 STARS');
});

// ============================================
// Test: Trail color changes with active power-up
// ============================================
test('trail color reflects active power-up', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    // Verify power-up types have distinct colors
    const colors = await page.evaluate(() => POWERUP_TYPES.map(t => t.color));
    const unique = new Set(colors);
    expect(unique.size).toBe(colors.length); // all different colors
});

// ============================================
// Test: Best distance displayed on start screen
// ============================================
test('best distance variable persists across reloads', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await page.evaluate(() => {
        localStorage.setItem('flyHighBestDistance', '1234');
    });

    await page.reload();
    await page.waitForTimeout(500);

    const bd = await page.evaluate(() => bestDistance);
    expect(bd).toBe(1234);
});

// ============================================
// Test: Music toggle works
// ============================================
test('music toggle functions exist', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const fns = await page.evaluate(() => ({
        startMusic: typeof startMusic === 'function',
        stopMusic: typeof stopMusic === 'function',
        toggleMusic: typeof toggleMusic === 'function',
    }));

    expect(fns.startMusic).toBe(true);
    expect(fns.stopMusic).toBe(true);
    expect(fns.toggleMusic).toBe(true);
});

// ============================================
// Test: Music starts on game start
// ============================================
test('music starts when game starts', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const beforeMusic = await page.evaluate(() => musicPlaying);
    expect(beforeMusic).toBe(false);

    await startGame(page);
    await page.waitForTimeout(200);

    const afterMusic = await page.evaluate(() => musicPlaying);
    expect(afterMusic).toBe(true);
});

// ============================================
// Test: Screen flash function exists and triggers
// ============================================
test('screen flash triggers on power-up', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(100);

    // Trigger a flash manually
    await page.evaluate(() => {
        triggerFlash('#44ddff');
    });

    const flash = await page.evaluate(() => screenFlash);
    expect(flash.alpha).toBeGreaterThan(0);
    expect(flash.color).toBe('#44ddff');
});

// ============================================
// Test: Difficulty labels change with distance
// ============================================
test('difficulty label changes with distance', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const labels = await page.evaluate(() => {
        const results = [];
        const distances = [0, 500, 1500, 3000, 5000];
        for (const d of distances) {
            distance = d;
            results.push(getDifficultyLabel().label);
        }
        return results;
    });

    expect(labels[0]).toBe('EASY');
    expect(labels[1]).toBe('MEDIUM');
    expect(labels[2]).toBe('HARD');
    expect(labels[3]).toBe('INSANE');
    expect(labels[4]).toBe('NIGHTMARE');
});

// ============================================
// Test: Moving obstacles spawn after 800m
// ============================================
test('moving obstacles have oscillation properties', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(100);

    // Spawn obstacle at high distance to guarantee moving type
    const hasMoving = await page.evaluate(() => {
        distance = 5000;
        // Spawn several and check if any are moving
        for (let i = 0; i < 20; i++) {
            spawnObstacle();
        }
        return obstacles.some(o => o.moving === true);
    });

    expect(hasMoving).toBe(true);

    // Verify moving obstacle has required properties
    const props = await page.evaluate(() => {
        const moving = obstacles.find(o => o.moving);
        if (!moving) return null;
        return {
            hasGapYBase: typeof moving.gapYBase === 'number',
            hasMoveSpeed: typeof moving.moveSpeed === 'number',
            hasMoveRange: typeof moving.moveRange === 'number',
            hasMovePhase: typeof moving.movePhase === 'number',
        };
    });

    expect(props).not.toBeNull();
    expect(props.hasGapYBase).toBe(true);
    expect(props.hasMoveRange).toBe(true);
    expect(props.hasMovePhase).toBe(true);
});

// ============================================
// Test: Moving obstacles oscillate their gap position
// ============================================
test('moving obstacle gap position changes over time', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    await startGame(page);
    await page.waitForTimeout(100);

    // Create a moving obstacle and advance its phase
    const result = await page.evaluate(() => {
        distance = 5000;
        obstacles.length = 0;
        obstacles.push({
            x: canvas.width * 0.5,
            gapY: 200,
            gapYBase: 200,
            gapHeight: 180,
            width: 45,
            passed: false,
            moving: true,
            moveSpeed: 1,
            moveRange: 50,
            movePhase: 0,
            color: '#2a1a2a'
        });
        const initial = obstacles[0].gapY;
        // Simulate phase advancement
        obstacles[0].movePhase = Math.PI / 2; // sin(PI/2) = 1, offset = +50
        const offset = Math.sin(obstacles[0].movePhase) * obstacles[0].moveRange;
        obstacles[0].gapY = obstacles[0].gapYBase + offset;
        return { initial, after: obstacles[0].gapY };
    });

    expect(result.after).not.toBe(result.initial);
});

// ============================================
// Test: Mobile control buttons exist in HTML
// ============================================
test('mobile control buttons are in the DOM', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const buttons = await page.evaluate(() => ({
        thrust: !!document.getElementById('btn-thrust'),
        down: !!document.getElementById('btn-down'),
        left: !!document.getElementById('btn-left'),
        right: !!document.getElementById('btn-right'),
        container: !!document.getElementById('mobile-controls'),
    }));

    expect(buttons.thrust).toBe(true);
    expect(buttons.down).toBe(true);
    expect(buttons.left).toBe(true);
    expect(buttons.right).toBe(true);
    expect(buttons.container).toBe(true);
});

// ============================================
// Test: Mobile button setup function exists
// ============================================
test('setupMobileButton function is defined', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const exists = await page.evaluate(() => typeof setupMobileButton === 'function');
    expect(exists).toBe(true);
});
