// ============================================
// Fly High — Star Collector
// A side-scrolling browser game where you fly and collect stars
// ============================================

const GAME_VERSION = '1.2.0';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');

// --- Audio System (Web Audio API — procedural, no files needed) ---
var audioCtx = null;
var audioEnabled = false;

function initAudio() {
    if (audioCtx) return;
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioEnabled = true;
    } catch (e) {
        audioEnabled = false;
    }
}

function playThrustSound() {
    if (!audioEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function playCollectSound() {
    if (!audioEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
}

function playDeathSound() {
    if (!audioEnabled || !audioCtx) return;
    // Low rumble
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.5);
    gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.5);

    // Noise burst
    const bufferSize = audioCtx.sampleRate * 0.3;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = audioCtx.createBufferSource();
    const noiseGain = audioCtx.createGain();
    noise.buffer = buffer;
    noiseGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start();
}

function playStartSound() {
    if (!audioEnabled || !audioCtx) return;
    const notes = [400, 500, 700];
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        const t = audioCtx.currentTime + i * 0.08;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
    });
}

function playPowerupSound() {
    if (!audioEnabled || !audioCtx) return;
    const notes = [500, 700, 900, 1100];
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        const t = audioCtx.currentTime + i * 0.06;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
    });
}

// --- Background Music (procedural ambient) ---
var musicPlaying = false;
var musicGainNode = null;
var musicOscillators = [];

function startMusic() {
    if (!audioEnabled || !audioCtx || musicPlaying) return;
    musicPlaying = true;

    musicGainNode = audioCtx.createGain();
    musicGainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
    musicGainNode.connect(audioCtx.destination);

    // Ambient pad — two detuned oscillators for thickness
    const freqs = [110, 165, 220]; // A2, E3, A3 — open fifth drone
    freqs.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        const oscGain = audioCtx.createGain();
        oscGain.gain.setValueAtTime(i === 0 ? 0.5 : 0.3, audioCtx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(musicGainNode);
        osc.start();
        musicOscillators.push(osc);

        // Slightly detuned copy for width
        const osc2 = audioCtx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 1.003, audioCtx.currentTime);
        const osc2Gain = audioCtx.createGain();
        osc2Gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        osc2.connect(osc2Gain);
        osc2Gain.connect(musicGainNode);
        osc2.start();
        musicOscillators.push(osc2);
    });
}

function stopMusic() {
    if (!musicPlaying) return;
    musicPlaying = false;
    for (const osc of musicOscillators) {
        try { osc.stop(); } catch (e) { /* already stopped */ }
    }
    musicOscillators = [];
    musicGainNode = null;
}

function toggleMusic() {
    if (musicPlaying) {
        stopMusic();
    } else {
        initAudio();
        startMusic();
    }
}

// Screen flash
var screenFlash = { alpha: 0, color: '#ffffff' };

function triggerFlash(color) {
    screenFlash = { alpha: 0.4, color: color || '#ffffff' };
}

// --- Background Stars (parallax decoration) ---
var bgStarsFar = [];
var bgStarsNear = [];

function initBgStars() {
    bgStarsFar = [];
    bgStarsNear = [];
    for (let i = 0; i < 80; i++) {
        bgStarsFar.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.3,
            brightness: Math.random() * 0.4 + 0.2,
            twinkleSpeed: Math.random() * 0.02 + 0.005
        });
    }
    for (let i = 0; i < 40; i++) {
        bgStarsNear.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2.5 + 1,
            brightness: Math.random() * 0.5 + 0.3,
            twinkleSpeed: Math.random() * 0.015 + 0.003
        });
    }
}

// --- Canvas Setup ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initBgStars();
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// --- Game Constants ---
const GRAVITY = 0.22;
const THRUST_UP = -0.55;
const THRUST_DOWN = 0.5;
const HORIZONTAL_ACCEL = 0.5;
const HORIZONTAL_FRICTION = 0.92;
const MAX_VELOCITY_Y = 9;
const MAX_VELOCITY_X = 5;
const PLAYER_SIZE = 20;
const STAR_SIZE = 14;
const BASE_SCROLL_SPEED = 2.5;
const SPEED_INCREASE_RATE = 0.0003;
const MAX_SCROLL_SPEED = 7;

// Player movement bounds (how far left/right the player can go on screen)
const PLAYER_MIN_X_RATIO = 0.05;
const PLAYER_MAX_X_RATIO = 0.6;

// Obstacle settings
const OBSTACLE_MIN_GAP = 140;
const OBSTACLE_MAX_GAP = 220;
const OBSTACLE_WIDTH = 45;
const OBSTACLE_SPAWN_INTERVAL_MIN = 90;
const OBSTACLE_SPAWN_INTERVAL_MAX = 160;

// Star settings
const STAR_SPAWN_INTERVAL_MIN = 40;
const STAR_SPAWN_INTERVAL_MAX = 80;

// Star types — different values and visuals
const STAR_TYPES = [
    { type: 'gold',    color: '#ffd700', points: 1, weight: 60, size: 14 },
    { type: 'silver',  color: '#c0c0c0', points: 2, weight: 25, size: 12 },
    { type: 'ruby',    color: '#ff4466', points: 3, weight: 10, size: 13 },
    { type: 'rainbow', color: 'rainbow', points: 5, weight: 5,  size: 16 },
];

function pickStarType() {
    const totalWeight = STAR_TYPES.reduce((sum, t) => sum + t.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const st of STAR_TYPES) {
        roll -= st.weight;
        if (roll <= 0) return st;
    }
    return STAR_TYPES[0];
}

// Leaderboard
const LEADERBOARD_KEY = 'flyHighLeaderboard';
var leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');

function saveToLeaderboard(score) {
    leaderboard.push(score);
    leaderboard.sort((a, b) => b - a);
    leaderboard = leaderboard.slice(0, 5); // keep top 5
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}

// --- Persistent High Score ---
var highScore = parseInt(localStorage.getItem('flyHighScore') || '0', 10);

// --- Game State (var for test access via window) ---
var state = 'start'; // 'start', 'playing', 'dead'
var score = 0;
var distance = 0;
var scrollSpeed = BASE_SCROLL_SPEED;
var nextObstacleIn = 0;
var nextStarIn = 0;

// Screen shake
var shakeIntensity = 0;
var shakeDuration = 0;

// Combo system
var combo = 0;
var comboTimer = 0;
var comboMultiplier = 1;
const COMBO_TIMEOUT = 120; // frames (~2 seconds to keep combo alive)
const COMBO_THRESHOLDS = [3, 6, 10, 15]; // combo counts for multiplier levels
var comboPopups = []; // floating text popups

// Power-ups
var powerups = [];
var activePowerup = null; // { type, timer }
const POWERUP_DURATION = 300; // frames (~5 seconds)
const POWERUP_SPAWN_CHANCE = 0.003; // per frame chance
const POWERUP_TYPES = [
    { type: 'shield', color: '#44ddff', icon: 'S', desc: 'Shield — immune to obstacles' },
    { type: 'magnet', color: '#ff44ff', icon: 'M', desc: 'Magnet — attract nearby stars' },
    { type: 'slow', color: '#44ff88', icon: 'T', desc: 'Slow-mo — slows scroll speed' },
];
const MAGNET_RANGE = 150;

// Pause
var paused = false;

// Best distance
const BEST_DISTANCE_KEY = 'flyHighBestDistance';
var bestDistance = parseFloat(localStorage.getItem(BEST_DISTANCE_KEY) || '0');

// Milestone notifications
var milestones = []; // floating notifications
var lastStarMilestone = 0; // last star-count milestone reached
var starsCollected = 0; // total stars collected this run
var distanceRecord = false; // whether current run beat best distance

// --- Player ---
var player = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    trail: [],
    invincibleFrames: 0,
    reset() {
        this.x = canvas.width * 0.18;
        this.y = canvas.height * 0.5;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.trail = [];
        this.invincibleFrames = 30;
    }
};

// --- Input ---
var keys = {};
var isThrusting = false;

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
         'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Escape', 'KeyM'].includes(e.code)) {
        e.preventDefault();
    }
    // Music toggle
    if (e.code === 'KeyM') {
        toggleMusic();
        return;
    }
    // Pause toggle
    if (e.code === 'Escape' && state === 'playing') {
        paused = !paused;
        if (paused) {
            showMessage('PAUSED<br><span class="sub">Press Escape to resume</span>');
        } else {
            messageEl.classList.add('hidden');
        }
        return;
    }
    if (e.code === 'Escape' && state === 'dead') {
        // Allow escape to restart too
        startGame();
        return;
    }
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (state === 'start' || state === 'dead') {
            initAudio();
            startGame();
        }
    }
});
window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});
window.addEventListener('mousedown', () => {
    keys['Mouse'] = true;
    if (state === 'start' || state === 'dead') {
        initAudio();
        startGame();
    }
});
window.addEventListener('mouseup', () => {
    keys['Mouse'] = false;
});
window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys['Mouse'] = true;
    if (state === 'start' || state === 'dead') {
        initAudio();
        startGame();
    }
}, { passive: false });
window.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys['Mouse'] = false;
}, { passive: false });

// --- Mobile touch button controls ---
function setupMobileButton(id, keyCode) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        keys[keyCode] = true;
        btn.classList.add('pressed');
        if (keyCode === 'Space' && (state === 'start' || state === 'dead')) {
            initAudio();
            startGame();
        }
    }, { passive: false });
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        keys[keyCode] = false;
        btn.classList.remove('pressed');
    }, { passive: false });
    btn.addEventListener('touchcancel', (e) => {
        keys[keyCode] = false;
        btn.classList.remove('pressed');
    });
}

setupMobileButton('btn-thrust', 'Space');
setupMobileButton('btn-down', 'ArrowDown');
setupMobileButton('btn-left', 'ArrowLeft');
setupMobileButton('btn-right', 'ArrowRight');

// --- Stars (scrolling collectibles) ---
var stars = [];

function spawnScrollingStar() {
    const margin = 50;
    const st = pickStarType();
    stars.push({
        x: canvas.width + 30,
        y: margin + Math.random() * (canvas.height - margin * 2),
        size: st.size,
        pulse: Math.random() * Math.PI * 2,
        collected: false,
        starType: st.type,
        color: st.color,
        points: st.points
    });
}

// --- Obstacles (rock pillars scrolling from right) ---
var obstacles = [];

function spawnObstacle() {
    // Difficulty curve: gap shrinks as distance increases
    const difficultyFactor = Math.min(distance / 5000, 0.35); // max 35% reduction
    const adjustedMinGap = OBSTACLE_MIN_GAP * (1 - difficultyFactor * 0.3);
    const adjustedMaxGap = OBSTACLE_MAX_GAP * (1 - difficultyFactor);
    const gap = adjustedMinGap + Math.random() * (adjustedMaxGap - adjustedMinGap);

    const minY = 60;
    const maxY = canvas.height - gap - 60;
    const gapY = minY + Math.random() * (maxY - minY);

    // Moving obstacles appear after 800m, chance increases with distance
    const movingChance = Math.min((distance - 800) / 3000, 0.45);
    const isMoving = distance > 800 && Math.random() < movingChance;
    const moveSpeed = isMoving ? (0.5 + Math.random() * 1.0) * (Math.random() < 0.5 ? 1 : -1) : 0;
    const moveRange = isMoving ? 30 + Math.random() * 40 : 0;

    obstacles.push({
        x: canvas.width + OBSTACLE_WIDTH,
        gapY: gapY,
        gapYBase: gapY, // original position for oscillation center
        gapHeight: gap,
        width: OBSTACLE_WIDTH,
        passed: false,
        moving: isMoving,
        moveSpeed: moveSpeed,
        moveRange: moveRange,
        movePhase: Math.random() * Math.PI * 2,
        color: isMoving
            ? `hsl(${340 + Math.random() * 30}, 40%, ${18 + Math.random() * 8}%)`
            : `hsl(${200 + Math.random() * 40}, 30%, ${15 + Math.random() * 10}%)`
    });
}

// --- Particles ---
var particles = [];

function emitParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: Math.random() * 0.03 + 0.02,
            size: Math.random() * 4 + 2,
            color
        });
    }
}

// --- Game Functions ---

function startGame() {
    state = 'playing';
    score = 0;
    distance = 0;
    scrollSpeed = BASE_SCROLL_SPEED;
    nextObstacleIn = 60;
    nextStarIn = 20;
    scoreEl.textContent = 'Score: 0';
    messageEl.classList.add('hidden');
    player.reset();
    stars = [];
    obstacles = [];
    particles = [];
    combo = 0;
    comboTimer = 0;
    comboMultiplier = 1;
    comboPopups = [];
    shakeIntensity = 0;
    shakeDuration = 0;
    powerups = [];
    activePowerup = null;
    paused = false;
    milestones = [];
    lastStarMilestone = 0;
    starsCollected = 0;
    distanceRecord = false;
    playStartSound();
    if (!musicPlaying) startMusic();

    // Spawn initial stars ahead
    for (let i = 0; i < 5; i++) {
        const margin = 50;
        const st = pickStarType();
        stars.push({
            x: canvas.width * 0.3 + Math.random() * canvas.width * 0.6,
            y: margin + Math.random() * (canvas.height - margin * 2),
            size: st.size,
            pulse: Math.random() * Math.PI * 2,
            collected: false,
            starType: st.type,
            color: st.color,
            points: st.points
        });
    }
}

function die() {
    state = 'dead';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flyHighScore', String(highScore));
    }
    const isNewBestDist = distance > bestDistance;
    if (isNewBestDist) {
        bestDistance = distance;
        localStorage.setItem(BEST_DISTANCE_KEY, String(bestDistance));
    }
    saveToLeaderboard(score);
    emitParticles(player.x, player.y, '#ff4444', 30);
    playDeathSound();
    shakeIntensity = 12;
    shakeDuration = 20;
    const distStr = Math.floor(distance).toLocaleString();
    const bestDistStr = Math.floor(bestDistance).toLocaleString();
    const newRecordTag = isNewBestDist ? ' NEW RECORD!' : '';
    showMessage(
        `Game Over!<br>` +
        `<span class="sub">Score: ${score} | Best: ${highScore}<br>` +
        `Distance: ${distStr}m | Best: ${bestDistStr}m${newRecordTag}<br>` +
        `Stars: ${starsCollected}<br>` +
        `Press Space or Tap to retry</span>`
    );
}

function showMessage(html) {
    messageEl.innerHTML = html;
    messageEl.classList.remove('hidden');
}

// --- Collision helpers ---

function rectCircleCollision(rx, ry, rw, rh, cx, cy, cr) {
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (cr * cr);
}

// --- Update ---
var frameCount = 0;

function update() {
    frameCount++;

    if (state !== 'playing') return;
    if (paused) return;

    // Decrease invincibility
    if (player.invincibleFrames > 0) player.invincibleFrames--;

    // Increase scroll speed over time
    scrollSpeed = Math.min(MAX_SCROLL_SPEED, BASE_SCROLL_SPEED + distance * SPEED_INCREASE_RATE);
    // Apply slow-mo power-up
    var effectiveSpeed = (activePowerup && activePowerup.type === 'slow')
        ? scrollSpeed * 0.5 : scrollSpeed;
    distance += effectiveSpeed * 0.1;

    // Distance record notification (only once per run)
    if (!distanceRecord && bestDistance > 0 && distance > bestDistance) {
        distanceRecord = true;
        milestones.push({
            text: 'NEW DISTANCE RECORD!',
            life: 1.5,
            y: canvas.height * 0.2
        });
    }

    // --- Vertical movement ---
    const movingUp = keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || keys['Mouse'];
    const movingDown = keys['ArrowDown'] || keys['KeyS'];
    isThrusting = movingUp;

    if (movingUp) {
        player.vy += THRUST_UP;
    }
    if (movingDown) {
        player.vy += THRUST_DOWN;
    }

    // Gravity (reduced when actively diving for better control)
    player.vy += movingDown ? GRAVITY * 0.3 : GRAVITY;

    // Clamp vertical velocity
    player.vy = Math.max(-MAX_VELOCITY_Y, Math.min(MAX_VELOCITY_Y, player.vy));

    // Move player vertically
    player.y += player.vy;

    // --- Horizontal movement ---
    const movingRight = keys['ArrowRight'] || keys['KeyD'];
    const movingLeft = keys['ArrowLeft'] || keys['KeyA'];

    if (movingRight) {
        player.vx += HORIZONTAL_ACCEL;
    }
    if (movingLeft) {
        player.vx -= HORIZONTAL_ACCEL;
    }

    // Apply friction to horizontal velocity
    player.vx *= HORIZONTAL_FRICTION;

    // Clamp horizontal velocity
    player.vx = Math.max(-MAX_VELOCITY_X, Math.min(MAX_VELOCITY_X, player.vx));

    // Move player horizontally
    player.x += player.vx;

    // Clamp player X within screen bounds
    const minX = canvas.width * PLAYER_MIN_X_RATIO;
    const maxX = canvas.width * PLAYER_MAX_X_RATIO;
    if (player.x < minX) { player.x = minX; player.vx = 0; }
    if (player.x > maxX) { player.x = maxX; player.vx = 0; }

    // Tilt angle based on velocity (both axes contribute)
    player.angle = player.vy * 0.04 + player.vx * 0.02;

    // Trail
    player.trail.push({ x: player.x, y: player.y });
    if (player.trail.length > 20) player.trail.shift();

    // Thrust particles
    if (isThrusting && frameCount % 2 === 0) {
        emitParticles(player.x - 15, player.y + 5, '#ff8800', 2);
    }
    if (isThrusting && frameCount % 8 === 0) {
        playThrustSound();
    }

    // Boundaries — die if hit top or bottom
    if (player.y - PLAYER_SIZE < 0 || player.y + PLAYER_SIZE > canvas.height) {
        die();
        return;
    }

    // --- Scroll stars ---
    for (let i = stars.length - 1; i >= 0; i--) {
        stars[i].x -= effectiveSpeed;
        if (stars[i].x < -30) {
            stars.splice(i, 1);
        }
    }

    // Spawn new stars
    nextStarIn--;
    if (nextStarIn <= 0) {
        spawnScrollingStar();
        nextStarIn = STAR_SPAWN_INTERVAL_MIN + Math.random() * (STAR_SPAWN_INTERVAL_MAX - STAR_SPAWN_INTERVAL_MIN);
    }

    // Star collision
    for (const star of stars) {
        if (star.collected) continue;
        const dx = player.x - star.x;
        const dy = player.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PLAYER_SIZE + star.size) {
            star.collected = true;
            combo++;
            comboTimer = COMBO_TIMEOUT;
            // Calculate multiplier based on combo thresholds
            comboMultiplier = 1;
            for (const threshold of COMBO_THRESHOLDS) {
                if (combo >= threshold) comboMultiplier++;
            }
            const basePoints = star.points || 1;
            const points = basePoints * comboMultiplier;
            score += points;
            scoreEl.textContent = `Score: ${score}`;
            const particleColor = star.color === 'rainbow' ? '#ff44ff' : (star.color || '#ffd700');
            emitParticles(star.x, star.y, particleColor, 12);
            playCollectSound();
            starsCollected++;
            // Star milestone every 10 stars
            if (starsCollected > 0 && starsCollected % 10 === 0 && starsCollected > lastStarMilestone) {
                lastStarMilestone = starsCollected;
                milestones.push({
                    text: `${starsCollected} STARS!`,
                    life: 1.0,
                    y: canvas.height * 0.25
                });
            }
            // Combo popup
            if (comboMultiplier > 1) {
                comboPopups.push({
                    x: star.x,
                    y: star.y,
                    text: `x${comboMultiplier}`,
                    life: 1.0,
                    vy: -1.5
                });
            }
            if (combo > 1) {
                comboPopups.push({
                    x: star.x,
                    y: star.y - 20,
                    text: `+${points}`,
                    life: 1.0,
                    vy: -2
                });
            }
        }
    }

    // --- Scroll obstacles ---
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= effectiveSpeed;

        // Moving obstacles oscillate vertically
        if (obstacles[i].moving) {
            obstacles[i].movePhase += 0.03;
            const offset = Math.sin(obstacles[i].movePhase) * obstacles[i].moveRange;
            obstacles[i].gapY = obstacles[i].gapYBase + offset;
            // Clamp so gap stays on screen
            const minGapY = 40;
            const maxGapY = canvas.height - obstacles[i].gapHeight - 40;
            obstacles[i].gapY = Math.max(minGapY, Math.min(maxGapY, obstacles[i].gapY));
        }

        // Award point for passing obstacle
        if (!obstacles[i].passed && obstacles[i].x + obstacles[i].width < player.x) {
            obstacles[i].passed = true;
        }

        // Remove off-screen
        if (obstacles[i].x + obstacles[i].width < -10) {
            obstacles.splice(i, 1);
        }
    }

    // Spawn new obstacles
    nextObstacleIn--;
    if (nextObstacleIn <= 0) {
        spawnObstacle();
        nextObstacleIn = OBSTACLE_SPAWN_INTERVAL_MIN +
            Math.random() * (OBSTACLE_SPAWN_INTERVAL_MAX - OBSTACLE_SPAWN_INTERVAL_MIN);
        nextObstacleIn = Math.max(60, nextObstacleIn * (BASE_SCROLL_SPEED / effectiveSpeed));
    }

    // Obstacle collision (skip during invincibility or shield)
    const hasShield = activePowerup && activePowerup.type === 'shield';
    if (player.invincibleFrames <= 0 && !hasShield) {
        for (const obs of obstacles) {
            const topPillar = { x: obs.x, y: 0, w: obs.width, h: obs.gapY };
            const bottomPillar = {
                x: obs.x,
                y: obs.gapY + obs.gapHeight,
                w: obs.width,
                h: canvas.height - (obs.gapY + obs.gapHeight)
            };

            if (
                rectCircleCollision(topPillar.x, topPillar.y, topPillar.w, topPillar.h,
                    player.x, player.y, PLAYER_SIZE * 0.7) ||
                rectCircleCollision(bottomPillar.x, bottomPillar.y, bottomPillar.w, bottomPillar.h,
                    player.x, player.y, PLAYER_SIZE * 0.7)
            ) {
                die();
                return;
            }
        }
    }

    // --- Power-ups ---
    // Spawn power-ups randomly
    if (Math.random() < POWERUP_SPAWN_CHANCE && powerups.length < 2) {
        const typeInfo = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
        const margin = 80;
        powerups.push({
            x: canvas.width + 20,
            y: margin + Math.random() * (canvas.height - margin * 2),
            type: typeInfo.type,
            color: typeInfo.color,
            icon: typeInfo.icon,
            size: 18,
            pulse: Math.random() * Math.PI * 2,
            collected: false
        });
    }

    // Scroll and collect power-ups
    for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].x -= effectiveSpeed;
        if (powerups[i].x < -30) {
            powerups.splice(i, 1);
            continue;
        }

        if (powerups[i].collected) continue;

        const dx = player.x - powerups[i].x;
        const dy = player.y - powerups[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PLAYER_SIZE + powerups[i].size) {
            powerups[i].collected = true;
            activePowerup = { type: powerups[i].type, timer: POWERUP_DURATION };
            emitParticles(powerups[i].x, powerups[i].y, powerups[i].color, 15);
            playPowerupSound();
            triggerFlash(powerups[i].color);
            comboPopups.push({
                x: powerups[i].x,
                y: powerups[i].y - 15,
                text: powerups[i].icon === 'S' ? 'SHIELD!' : powerups[i].icon === 'M' ? 'MAGNET!' : 'SLOW-MO!',
                life: 1.0,
                vy: -1.5
            });
        }
    }

    // Active power-up timer
    if (activePowerup) {
        activePowerup.timer--;
        if (activePowerup.timer <= 0) {
            activePowerup = null;
        }
    }

    // Magnet effect — attract nearby stars
    if (activePowerup && activePowerup.type === 'magnet') {
        for (const star of stars) {
            if (star.collected) continue;
            const dx = player.x - star.x;
            const dy = player.y - star.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MAGNET_RANGE) {
                const pull = 0.08 * (1 - dist / MAGNET_RANGE);
                star.x += dx * pull;
                star.y += dy * pull;
            }
        }
    }

    // --- Scroll bg stars (parallax) ---
    for (const s of bgStarsFar) {
        s.x -= effectiveSpeed * 0.15;
        if (s.x < 0) { s.x = canvas.width; s.y = Math.random() * canvas.height; }
    }
    for (const s of bgStarsNear) {
        s.x -= effectiveSpeed * 0.4;
        if (s.x < 0) { s.x = canvas.width; s.y = Math.random() * canvas.height; }
    }

    // Update particles (also scroll them)
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx - effectiveSpeed * 0.3;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Combo timer decay
    if (comboTimer > 0) {
        comboTimer--;
        if (comboTimer <= 0) {
            combo = 0;
            comboMultiplier = 1;
        }
    }

    // Update combo popups
    for (let i = comboPopups.length - 1; i >= 0; i--) {
        const p = comboPopups[i];
        p.y += p.vy;
        p.x -= scrollSpeed * 0.5;
        p.life -= 0.02;
        if (p.life <= 0) {
            comboPopups.splice(i, 1);
        }
    }

    // Update milestones
    for (let i = milestones.length - 1; i >= 0; i--) {
        milestones[i].life -= 0.01;
        milestones[i].y -= 0.3;
        if (milestones[i].life <= 0) {
            milestones.splice(i, 1);
        }
    }

    // Screen shake decay
    if (shakeDuration > 0) {
        shakeDuration--;
        if (shakeDuration <= 0) {
            shakeIntensity = 0;
        }
    }

    // Screen flash decay
    if (screenFlash.alpha > 0) {
        screenFlash.alpha -= 0.02;
        if (screenFlash.alpha < 0) screenFlash.alpha = 0;
    }
}

// --- Draw ---

function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0a0a2e');
    grad.addColorStop(0.5, '#1a1a4e');
    grad.addColorStop(1, '#0d0d35');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const s of bgStarsFar) {
        const twinkle = Math.sin(frameCount * s.twinkleSpeed) * 0.3 + s.brightness;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    }
    for (const s of bgStarsNear) {
        const twinkle = Math.sin(frameCount * s.twinkleSpeed) * 0.3 + s.brightness;
        ctx.globalAlpha = twinkle * 0.7;
        ctx.fillStyle = '#aabbff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawObstacles() {
    for (const obs of obstacles) {
        const topH = obs.gapY;
        const botY = obs.gapY + obs.gapHeight;
        const botH = canvas.height - botY;

        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, 0, obs.width, topH);
        ctx.fillRect(obs.x, botY, obs.width, botH);

        ctx.fillStyle = 'rgba(100, 180, 255, 0.15)';
        ctx.fillRect(obs.x, 0, 3, topH);
        ctx.fillRect(obs.x, botY, 3, botH);

        ctx.fillStyle = 'rgba(80, 140, 220, 0.3)';
        const capH = 8;
        ctx.fillRect(obs.x - 4, topH - capH, obs.width + 8, capH);
        ctx.fillRect(obs.x - 4, botY, obs.width + 8, capH);

        const glowGrad = ctx.createLinearGradient(0, topH - 30, 0, topH);
        glowGrad.addColorStop(0, 'transparent');
        glowGrad.addColorStop(1, 'rgba(255, 100, 50, 0.1)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(obs.x - 4, topH - 30, obs.width + 8, 30);

        const glowGrad2 = ctx.createLinearGradient(0, botY, 0, botY + 30);
        glowGrad2.addColorStop(0, 'rgba(255, 100, 50, 0.1)');
        glowGrad2.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad2;
        ctx.fillRect(obs.x - 4, botY, obs.width + 8, 30);

        // Moving obstacle indicator — pulsing arrows
        if (obs.moving) {
            const pulse = Math.sin(frameCount * 0.08) * 0.3 + 0.5;
            ctx.globalAlpha = pulse;
            ctx.fillStyle = '#ff6688';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            // Arrow showing movement direction
            const arrowY = obs.gapY + obs.gapHeight / 2;
            ctx.fillText('↕', obs.x + obs.width / 2, arrowY);
            ctx.globalAlpha = 1;
            ctx.textAlign = 'left';
        }
    }
}

function drawPlayer() {
    if (state !== 'playing') return;

    // Trail
    for (let i = 0; i < player.trail.length; i++) {
        const t = player.trail[i];
        const alpha = i / player.trail.length * 0.3;
        ctx.globalAlpha = alpha;
        // Trail color changes with active power-up
        let trailColor;
        if (activePowerup) {
            const puInfo = POWERUP_TYPES.find(t => t.type === activePowerup.type);
            trailColor = puInfo ? puInfo.color : '#4488ff';
        } else {
            trailColor = isThrusting ? '#ff8800' : '#4488ff';
        }
        ctx.fillStyle = trailColor;
        ctx.beginPath();
        ctx.arc(t.x, t.y, PLAYER_SIZE * 0.4 * (i / player.trail.length), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (player.invincibleFrames > 0 && frameCount % 4 < 2) {
        ctx.globalAlpha = 0.5;
    }

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    const S = PLAYER_SIZE;

    // --- Fins (behind body) ---
    ctx.fillStyle = '#2266cc';
    // Top fin
    ctx.beginPath();
    ctx.moveTo(-S * 0.5, -S * 0.4);
    ctx.lineTo(-S * 0.9, -S * 0.85);
    ctx.lineTo(-S * 0.7, -S * 0.3);
    ctx.closePath();
    ctx.fill();
    // Bottom fin
    ctx.beginPath();
    ctx.moveTo(-S * 0.5, S * 0.4);
    ctx.lineTo(-S * 0.9, S * 0.85);
    ctx.lineTo(-S * 0.7, S * 0.3);
    ctx.closePath();
    ctx.fill();

    // --- Body (sleek rocket) ---
    ctx.fillStyle = '#4488ff';
    ctx.beginPath();
    ctx.moveTo(S * 1.1, 0);                    // nose tip
    ctx.quadraticCurveTo(S * 0.6, -S * 0.5, -S * 0.5, -S * 0.45);  // top curve
    ctx.lineTo(-S * 0.5, S * 0.45);            // rear
    ctx.quadraticCurveTo(S * 0.6, S * 0.5, S * 1.1, 0);             // bottom curve
    ctx.closePath();
    ctx.fill();

    // Body glow
    ctx.shadowColor = '#4488ff';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // --- Body stripe ---
    ctx.fillStyle = '#5599ff';
    ctx.beginPath();
    ctx.moveTo(S * 0.8, 0);
    ctx.quadraticCurveTo(S * 0.4, -S * 0.18, -S * 0.3, -S * 0.15);
    ctx.lineTo(-S * 0.3, S * 0.15);
    ctx.quadraticCurveTo(S * 0.4, S * 0.18, S * 0.8, 0);
    ctx.closePath();
    ctx.fill();

    // --- Cockpit window ---
    ctx.fillStyle = '#aaddff';
    ctx.shadowColor = '#aaddff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.ellipse(S * 0.35, 0, S * 0.18, S * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Window glare
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(S * 0.4, -S * 0.04, S * 0.06, S * 0.04, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // --- Nose tip highlight ---
    ctx.fillStyle = '#66aaff';
    ctx.beginPath();
    ctx.arc(S * 0.95, 0, S * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // --- Engine exhaust ---
    if (isThrusting) {
        // Outer flame (flickering)
        const flameLen = 14 + Math.random() * 16;
        const flameWobble = Math.sin(frameCount * 0.5) * 2;
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(-S * 0.5, -S * 0.3);
        ctx.quadraticCurveTo(-S * 0.6, flameWobble, -S * 0.5 - flameLen, flameWobble);
        ctx.lineTo(-S * 0.5, S * 0.3);
        ctx.closePath();
        ctx.fill();

        // Inner flame
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(-S * 0.5, -S * 0.15);
        ctx.quadraticCurveTo(-S * 0.55, flameWobble * 0.5, -S * 0.5 - flameLen * 0.55, flameWobble * 0.5);
        ctx.lineTo(-S * 0.5, S * 0.15);
        ctx.closePath();
        ctx.fill();

        // Core flame (white-hot)
        ctx.fillStyle = '#ffffcc';
        ctx.beginPath();
        ctx.moveTo(-S * 0.5, -S * 0.06);
        ctx.lineTo(-S * 0.5 - flameLen * 0.25, 0);
        ctx.lineTo(-S * 0.5, S * 0.06);
        ctx.closePath();
        ctx.fill();
    } else {
        // Idle exhaust — small flicker
        const idleLen = 4 + Math.random() * 4;
        ctx.fillStyle = 'rgba(255, 100, 0, 0.4)';
        ctx.beginPath();
        ctx.moveTo(-S * 0.5, -S * 0.1);
        ctx.lineTo(-S * 0.5 - idleLen, 0);
        ctx.lineTo(-S * 0.5, S * 0.1);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
}

function drawStar(x, y, size, pulse, color) {
    const pulseFactor = 1 + Math.sin(frameCount * 0.05 + pulse) * 0.15;
    const s = size * pulseFactor;
    const spikes = 5;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(frameCount * 0.02 + pulse);

    // Determine color
    let fillColor;
    if (color === 'rainbow') {
        const hue = (frameCount * 3 + pulse * 50) % 360;
        fillColor = `hsl(${hue}, 100%, 65%)`;
    } else {
        fillColor = color || '#ffd700';
    }

    ctx.shadowColor = fillColor;
    ctx.shadowBlur = 20;

    ctx.fillStyle = fillColor;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? s : s * 0.4;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawStars() {
    for (const star of stars) {
        if (!star.collected) {
            drawStar(star.x, star.y, star.size, star.pulse, star.color);
        }
    }
}

function drawPowerups() {
    for (const pu of powerups) {
        if (pu.collected) continue;

        const pulseFactor = 1 + Math.sin(frameCount * 0.06 + pu.pulse) * 0.15;
        const s = pu.size * pulseFactor;

        ctx.save();
        ctx.translate(pu.x, pu.y);

        // Outer glow
        ctx.shadowColor = pu.color;
        ctx.shadowBlur = 25;

        // Hexagon shape
        ctx.fillStyle = pu.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6 - Math.PI / 6;
            const px = Math.cos(angle) * s;
            const py = Math.sin(angle) * s;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Inner fill
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.9;
        ctx.font = `bold ${Math.floor(s * 0.9)}px Segoe UI, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pu.icon, 0, 1);

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

function drawObstacleWarnings() {
    if (state !== 'playing') return;

    for (const obs of obstacles) {
        // Only show warning for obstacles approaching from offscreen or near edge
        if (obs.x > canvas.width - 60 && obs.x < canvas.width + OBSTACLE_WIDTH) {
            const gapCenter = obs.gapY + obs.gapHeight / 2;
            const arrowX = canvas.width - 15;

            // Fade in as obstacle approaches
            const fadeProgress = 1 - (obs.x - (canvas.width - 60)) / (60 + OBSTACLE_WIDTH);
            ctx.globalAlpha = Math.max(0, Math.min(0.6, fadeProgress));

            // Warning arrow
            ctx.fillStyle = obs.moving ? '#ff6688' : '#ffaa44';
            ctx.beginPath();
            ctx.moveTo(arrowX + 8, gapCenter);
            ctx.lineTo(arrowX - 4, gapCenter - 8);
            ctx.lineTo(arrowX - 4, gapCenter + 8);
            ctx.closePath();
            ctx.fill();

            // Gap zone indicator (thin line)
            ctx.strokeStyle = obs.moving ? 'rgba(255, 102, 136, 0.3)' : 'rgba(255, 170, 68, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(arrowX - 6, obs.gapY);
            ctx.lineTo(arrowX - 6, obs.gapY + obs.gapHeight);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.globalAlpha = 1;
        }
    }
}

function drawActivePowerupHUD() {
    if (!activePowerup || state !== 'playing') return;

    const info = POWERUP_TYPES.find(t => t.type === activePowerup.type);
    if (!info) return;

    const barWidth = 120;
    const barHeight = 6;
    const barX = canvas.width - barWidth - 20;
    const barY = 70;
    const fillRatio = activePowerup.timer / POWERUP_DURATION;

    // Label
    ctx.fillStyle = info.color;
    ctx.font = 'bold 14px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(info.type.toUpperCase(), canvas.width - 20, barY - 6);

    // Background bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Fill bar
    ctx.fillStyle = info.color;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(barX, barY, barWidth * fillRatio, barHeight);
    ctx.globalAlpha = 1;

    // Shield visual on player
    if (activePowerup.type === 'shield') {
        ctx.strokeStyle = info.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4 + Math.sin(frameCount * 0.1) * 0.2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, PLAYER_SIZE * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    ctx.textAlign = 'left';
}

function drawParticles() {
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function getDifficultyLabel() {
    if (distance < 500) return { label: 'EASY', color: '#44ff88' };
    if (distance < 1500) return { label: 'MEDIUM', color: '#ffdd44' };
    if (distance < 3000) return { label: 'HARD', color: '#ff8844' };
    if (distance < 5000) return { label: 'INSANE', color: '#ff4444' };
    return { label: 'NIGHTMARE', color: '#ff00ff' };
}

function drawHUD() {
    if (state !== 'playing') return;

    const distStr = Math.floor(distance).toLocaleString();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${distStr}m`, canvas.width - 20, 38);

    const speedPct = ((scrollSpeed - BASE_SCROLL_SPEED) / (MAX_SCROLL_SPEED - BASE_SCROLL_SPEED) * 100).toFixed(0);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '13px Segoe UI, sans-serif';
    ctx.fillText(`Speed +${speedPct}%`, canvas.width - 20, 58);

    // Difficulty indicator
    const diff = getDifficultyLabel();
    ctx.fillStyle = diff.color;
    ctx.globalAlpha = 0.6;
    ctx.font = 'bold 11px Segoe UI, sans-serif';
    ctx.fillText(diff.label, canvas.width - 20, 75);
    ctx.globalAlpha = 1;

    // Music indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.fillText(musicPlaying ? '♪ M' : '♪ off', canvas.width - 20, 92);

    ctx.textAlign = 'left';
}

function drawScreenFlash() {
    if (screenFlash.alpha <= 0) return;
    ctx.globalAlpha = screenFlash.alpha;
    ctx.fillStyle = screenFlash.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
}

function drawStartScreen() {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 64px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 30;
    ctx.fillText('FLY HIGH', canvas.width / 2, canvas.height / 2 - 60);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#aaaacc';
    ctx.font = '22px Segoe UI, sans-serif';
    ctx.fillText('Dodge obstacles. Collect stars.', canvas.width / 2, canvas.height / 2 - 10);

    ctx.fillStyle = '#8888aa';
    ctx.font = '16px Segoe UI, sans-serif';
    ctx.fillText('Arrow Keys / WASD to move', canvas.width / 2, canvas.height / 2 + 25);
    ctx.fillText('Space / Click / Tap to thrust up', canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText('M = Music  |  Esc = Pause', canvas.width / 2, canvas.height / 2 + 72);

    if (highScore > 0) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '18px Segoe UI, sans-serif';
        ctx.fillText(`Best: ${highScore}`, canvas.width / 2, canvas.height / 2 + 105);

        if (bestDistance > 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '15px Segoe UI, sans-serif';
            ctx.fillText(`Farthest: ${Math.floor(bestDistance).toLocaleString()}m`, canvas.width / 2, canvas.height / 2 + 127);
        }
    }

    // Leaderboard
    if (leaderboard.length > 0) {
        const lbX = canvas.width / 2;
        let lbY = canvas.height / 2 + 150;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = 'bold 14px Segoe UI, sans-serif';
        ctx.fillText('TOP SCORES', lbX, lbY);
        lbY += 5;

        ctx.font = '13px Segoe UI, monospace';
        for (let i = 0; i < Math.min(leaderboard.length, 5); i++) {
            lbY += 20;
            const medal = i === 0 ? '  ' : i === 1 ? '  ' : i === 2 ? '  ' : '    ';
            ctx.fillStyle = i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.35)';
            ctx.fillText(`${medal}${i + 1}. ${leaderboard[i].toLocaleString()}`, lbX, lbY);
        }
    }

    // Version
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = '12px Segoe UI, sans-serif';
    ctx.fillText(`v${GAME_VERSION}`, canvas.width / 2, canvas.height - 30);

    ctx.textAlign = 'left';
}

// --- Main Loop ---

function drawMilestones() {
    for (const m of milestones) {
        ctx.globalAlpha = Math.min(m.life, 1);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15;
        ctx.fillText(m.text, canvas.width / 2, m.y);
        ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
}

function drawComboPopups() {
    for (const p of comboPopups) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 22px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.fillText(p.text, p.x, p.y);
        ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
}

function drawComboHUD() {
    if (state !== 'playing' || combo < 2) return;

    // Combo counter
    const comboText = `Combo: ${combo}`;
    const multText = comboMultiplier > 1 ? ` (x${comboMultiplier})` : '';

    ctx.fillStyle = comboTimer < 30 ? `rgba(255, 215, 0, ${0.3 + (comboTimer / 30) * 0.7})` : '#ffd700';
    ctx.font = 'bold 20px Segoe UI, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(comboText + multText, 20, 70);

    // Combo timer bar
    const barWidth = 100;
    const barHeight = 4;
    const barX = 20;
    const barY = 78;
    const fillRatio = comboTimer / COMBO_TIMEOUT;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const barColor = fillRatio > 0.5 ? '#ffd700' : fillRatio > 0.2 ? '#ff8800' : '#ff4444';
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barWidth * fillRatio, barHeight);
}

function gameLoop() {
    update();

    // Apply screen shake
    if (shakeDuration > 0 && shakeIntensity > 0) {
        ctx.save();
        const sx = (Math.random() - 0.5) * shakeIntensity * (shakeDuration / 20);
        const sy = (Math.random() - 0.5) * shakeIntensity * (shakeDuration / 20);
        ctx.translate(sx, sy);
    }

    drawBackground();

    if (state === 'start') {
        drawStartScreen();
    } else {
        drawObstacles();
        drawObstacleWarnings();
        drawStars();
        drawPowerups();
        drawPlayer();
        drawActivePowerupHUD();
        drawHUD();
        drawComboHUD();
        drawComboPopups();
        drawMilestones();
    }

    drawParticles();
    drawScreenFlash();

    if (shakeDuration > 0 && shakeIntensity > 0) {
        ctx.restore();
    }

    requestAnimationFrame(gameLoop);
}

// --- Init ---
showMessage('');
messageEl.classList.add('hidden');
gameLoop();
