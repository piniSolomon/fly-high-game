// ============================================
// Fly High — Star Collector
// A side-scrolling browser game where you fly and collect stars
// ============================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');

// --- Background Stars (parallax decoration) ---
let bgStarsFar = [];
let bgStarsNear = [];

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
const GRAVITY = 0.4;
const THRUST = -0.7;
const MAX_VELOCITY = 9;
const PLAYER_SIZE = 20;
const STAR_SIZE = 14;
const BASE_SCROLL_SPEED = 2.5;
const SPEED_INCREASE_RATE = 0.0003; // per frame
const MAX_SCROLL_SPEED = 7;

// Obstacle settings
const OBSTACLE_MIN_GAP = 140;
const OBSTACLE_MAX_GAP = 220;
const OBSTACLE_WIDTH = 45;
const OBSTACLE_SPAWN_INTERVAL_MIN = 90;  // frames
const OBSTACLE_SPAWN_INTERVAL_MAX = 160;

// Star settings
const STAR_SPAWN_INTERVAL_MIN = 40;
const STAR_SPAWN_INTERVAL_MAX = 80;

// --- Persistent High Score ---
let highScore = parseInt(localStorage.getItem('flyHighScore') || '0', 10);

// --- Game State ---
let state = 'start'; // 'start', 'playing', 'dead'
let score = 0;
let distance = 0;
let scrollSpeed = BASE_SCROLL_SPEED;
let nextObstacleIn = 0;
let nextStarIn = 0;

// --- Player ---
const player = {
    x: 0,
    y: 0,
    vy: 0,
    angle: 0,
    trail: [],
    invincibleFrames: 0, // brief flash on start
    reset() {
        this.x = canvas.width * 0.18;
        this.y = canvas.height * 0.5;
        this.vy = 0;
        this.angle = 0;
        this.trail = [];
        this.invincibleFrames = 30;
    }
};

// --- Input ---
const keys = {};
let isThrusting = false;

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (state === 'start' || state === 'dead') {
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
        startGame();
    }
}, { passive: false });
window.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys['Mouse'] = false;
}, { passive: false });

// --- Stars (scrolling collectibles) ---
let stars = [];

function spawnScrollingStar() {
    const margin = 50;
    stars.push({
        x: canvas.width + 30,
        y: margin + Math.random() * (canvas.height - margin * 2),
        size: STAR_SIZE,
        pulse: Math.random() * Math.PI * 2,
        collected: false
    });
}

// --- Obstacles (rock pillars scrolling from right) ---
let obstacles = [];

function spawnObstacle() {
    const gap = OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP);
    const minY = 60;
    const maxY = canvas.height - gap - 60;
    const gapY = minY + Math.random() * (maxY - minY);

    obstacles.push({
        x: canvas.width + OBSTACLE_WIDTH,
        gapY: gapY,
        gapHeight: gap,
        width: OBSTACLE_WIDTH,
        passed: false,
        color: `hsl(${200 + Math.random() * 40}, 30%, ${15 + Math.random() * 10}%)`
    });
}

// --- Particles ---
let particles = [];

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
    nextObstacleIn = 60; // grace period before first obstacle
    nextStarIn = 20;
    scoreEl.textContent = 'Score: 0';
    messageEl.classList.add('hidden');
    player.reset();
    stars = [];
    obstacles = [];
    particles = [];

    // Spawn initial stars ahead
    for (let i = 0; i < 5; i++) {
        const margin = 50;
        stars.push({
            x: canvas.width * 0.3 + Math.random() * canvas.width * 0.6,
            y: margin + Math.random() * (canvas.height - margin * 2),
            size: STAR_SIZE,
            pulse: Math.random() * Math.PI * 2,
            collected: false
        });
    }
}

function die() {
    state = 'dead';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flyHighScore', String(highScore));
    }
    emitParticles(player.x, player.y, '#ff4444', 30);
    const distStr = Math.floor(distance).toLocaleString();
    showMessage(
        `Game Over!<br>` +
        `<span class="sub">Score: ${score} | Best: ${highScore}<br>` +
        `Distance: ${distStr}m<br>` +
        `Press Space or Tap to retry</span>`
    );
}

function showMessage(html) {
    messageEl.innerHTML = html;
    messageEl.classList.remove('hidden');
}

// --- Collision helpers ---

function rectCircleCollision(rx, ry, rw, rh, cx, cy, cr) {
    // Closest point on rect to circle center
    const closestX = Math.max(rx, Math.min(cx, rx + rw));
    const closestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) < (cr * cr);
}

// --- Update ---
let frameCount = 0;

function update() {
    frameCount++;

    if (state !== 'playing') return;

    // Decrease invincibility
    if (player.invincibleFrames > 0) player.invincibleFrames--;

    // Increase scroll speed over time
    scrollSpeed = Math.min(MAX_SCROLL_SPEED, BASE_SCROLL_SPEED + distance * SPEED_INCREASE_RATE);
    distance += scrollSpeed * 0.1;

    // Thrust
    isThrusting = keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || keys['Mouse'];

    if (isThrusting) {
        player.vy += THRUST;
    }

    // Gravity
    player.vy += GRAVITY;

    // Clamp velocity
    player.vy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, player.vy));

    // Move player
    player.y += player.vy;

    // Tilt angle based on velocity
    player.angle = player.vy * 0.05;

    // Trail
    player.trail.push({ x: player.x, y: player.y });
    if (player.trail.length > 20) player.trail.shift();

    // Thrust particles
    if (isThrusting && frameCount % 2 === 0) {
        emitParticles(player.x - 15, player.y + 5, '#ff8800', 2);
    }

    // Boundaries — die if hit top or bottom
    if (player.y - PLAYER_SIZE < 0 || player.y + PLAYER_SIZE > canvas.height) {
        die();
        return;
    }

    // --- Scroll stars ---
    for (let i = stars.length - 1; i >= 0; i--) {
        stars[i].x -= scrollSpeed;
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
            score++;
            scoreEl.textContent = `Score: ${score}`;
            emitParticles(star.x, star.y, '#ffd700', 12);
        }
    }

    // --- Scroll obstacles ---
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= scrollSpeed;

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
        // Decrease interval as speed increases (more frequent obstacles)
        nextObstacleIn = Math.max(60, nextObstacleIn * (BASE_SCROLL_SPEED / scrollSpeed));
    }

    // Obstacle collision (skip during invincibility)
    if (player.invincibleFrames <= 0) {
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

    // --- Scroll bg stars (parallax) ---
    for (const s of bgStarsFar) {
        s.x -= scrollSpeed * 0.15;
        if (s.x < 0) { s.x = canvas.width; s.y = Math.random() * canvas.height; }
    }
    for (const s of bgStarsNear) {
        s.x -= scrollSpeed * 0.4;
        if (s.x < 0) { s.x = canvas.width; s.y = Math.random() * canvas.height; }
    }

    // Update particles (also scroll them)
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx - scrollSpeed * 0.3;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// --- Draw ---

function drawBackground() {
    // Gradient sky
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0a0a2e');
    grad.addColorStop(0.5, '#1a1a4e');
    grad.addColorStop(1, '#0d0d35');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Far background stars
    for (const s of bgStarsFar) {
        const twinkle = Math.sin(frameCount * s.twinkleSpeed) * 0.3 + s.brightness;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    }
    // Near background stars (brighter, faster parallax)
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
        // Top pillar
        const topH = obs.gapY;
        // Bottom pillar
        const botY = obs.gapY + obs.gapHeight;
        const botH = canvas.height - botY;

        // Pillar body
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, 0, obs.width, topH);
        ctx.fillRect(obs.x, botY, obs.width, botH);

        // Pillar edge highlight
        ctx.fillStyle = 'rgba(100, 180, 255, 0.15)';
        ctx.fillRect(obs.x, 0, 3, topH);
        ctx.fillRect(obs.x, botY, 3, botH);

        // Pillar edge caps (rounded lips at gap)
        ctx.fillStyle = 'rgba(80, 140, 220, 0.3)';
        const capH = 8;
        ctx.fillRect(obs.x - 4, topH - capH, obs.width + 8, capH);
        ctx.fillRect(obs.x - 4, botY, obs.width + 8, capH);

        // Danger glow near gap edges
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
    }
}

function drawPlayer() {
    if (state !== 'playing') return;

    // Trail
    for (let i = 0; i < player.trail.length; i++) {
        const t = player.trail[i];
        const alpha = i / player.trail.length * 0.3;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = isThrusting ? '#ff8800' : '#4488ff';
        ctx.beginPath();
        ctx.arc(t.x, t.y, PLAYER_SIZE * 0.4 * (i / player.trail.length), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Invincibility flash
    if (player.invincibleFrames > 0 && frameCount % 4 < 2) {
        ctx.globalAlpha = 0.5;
    }

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Body (rocket shape)
    ctx.fillStyle = '#4488ff';
    ctx.beginPath();
    ctx.moveTo(PLAYER_SIZE, 0);
    ctx.lineTo(-PLAYER_SIZE * 0.7, -PLAYER_SIZE * 0.6);
    ctx.lineTo(-PLAYER_SIZE * 0.4, 0);
    ctx.lineTo(-PLAYER_SIZE * 0.7, PLAYER_SIZE * 0.6);
    ctx.closePath();
    ctx.fill();

    // Glow
    ctx.shadowColor = '#4488ff';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Window
    ctx.fillStyle = '#aaddff';
    ctx.beginPath();
    ctx.arc(PLAYER_SIZE * 0.2, 0, PLAYER_SIZE * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Thrust flame
    if (isThrusting) {
        const flameLen = 10 + Math.random() * 12;
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(-PLAYER_SIZE * 0.4, -PLAYER_SIZE * 0.25);
        ctx.lineTo(-PLAYER_SIZE * 0.4 - flameLen, 0);
        ctx.lineTo(-PLAYER_SIZE * 0.4, PLAYER_SIZE * 0.25);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(-PLAYER_SIZE * 0.4, -PLAYER_SIZE * 0.12);
        ctx.lineTo(-PLAYER_SIZE * 0.4 - flameLen * 0.6, 0);
        ctx.lineTo(-PLAYER_SIZE * 0.4, PLAYER_SIZE * 0.12);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
}

function drawStar(x, y, size, pulse) {
    const pulseFactor = 1 + Math.sin(frameCount * 0.05 + pulse) * 0.15;
    const s = size * pulseFactor;
    const spikes = 5;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(frameCount * 0.02 + pulse);

    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 20;

    ctx.fillStyle = '#ffd700';
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
            drawStar(star.x, star.y, star.size, star.pulse);
        }
    }
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

function drawHUD() {
    if (state !== 'playing') return;

    // Distance counter
    const distStr = Math.floor(distance).toLocaleString();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${distStr}m`, canvas.width - 20, 38);

    // Speed indicator
    const speedPct = ((scrollSpeed - BASE_SCROLL_SPEED) / (MAX_SCROLL_SPEED - BASE_SCROLL_SPEED) * 100).toFixed(0);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '13px Segoe UI, sans-serif';
    ctx.fillText(`Speed +${speedPct}%`, canvas.width - 20, 58);

    ctx.textAlign = 'left';
}

function drawStartScreen() {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 64px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 30;
    ctx.fillText('FLY HIGH', canvas.width / 2, canvas.height / 2 - 50);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#aaaacc';
    ctx.font = '22px Segoe UI, sans-serif';
    ctx.fillText('Dodge obstacles. Collect stars.', canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = '#666688';
    ctx.font = '16px Segoe UI, sans-serif';
    ctx.fillText('Press Space, Click, or Tap to start', canvas.width / 2, canvas.height / 2 + 40);

    if (highScore > 0) {
        ctx.fillStyle = '#ffd700';
        ctx.font = '18px Segoe UI, sans-serif';
        ctx.fillText(`Best: ${highScore}`, canvas.width / 2, canvas.height / 2 + 80);
    }

    ctx.textAlign = 'left';
}

// --- Main Loop ---

function gameLoop() {
    update();

    drawBackground();

    if (state === 'start') {
        drawStartScreen();
    } else {
        drawObstacles();
        drawStars();
        drawPlayer();
        drawHUD();
    }

    drawParticles();

    requestAnimationFrame(gameLoop);
}

// --- Init ---
showMessage('');
messageEl.classList.add('hidden');
gameLoop();
