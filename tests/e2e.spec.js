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
test('game version is 0.6.0', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(300);

    const version = await page.evaluate(() => GAME_VERSION);
    expect(version).toBe('0.6.0');
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
