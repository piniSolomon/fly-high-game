// ============================================
// Fly High — Star Collector
// A browser game where you fly and collect stars
// ============================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');

// --- Canvas Setup ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// --- Game Constants ---
const GRAVITY = 0.35;
const THRUST = -0.65;
const MAX_VELOCITY = 8;
const PLAYER_SIZE = 20;
const STAR_SIZE = 15;
const STAR_COUNT = 8;
const STAR_RESPAWN_DELAY = 60; // frames

// --- Game State ---
let state = 'start'; // 'start', 'playing', 'dead'
let score = 0;
let highScore = 0;

// --- Player ---
const player = {
    x: 0,
    y: 0,
    vy: 0,
    angle: 0,
    trail: [],
    reset() {
        this.x = canvas.width * 0.2;
        this.y = canvas.height * 0.5;
        this.vy = 0;
        this.angle = 0;
        this.trail = [];
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
window.addEventListener('mousedown', (e) => {
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

// --- Stars ---
let stars = [];

function spawnStar() {
    const margin = 60;
    return {
        x: margin + Math.random() * (canvas.width - margin * 2),
        y: margin + Math.random() * (canvas.height - margin * 2),
        size: STAR_SIZE,
        pulse: Math.random() * Math.PI * 2, // offset for pulsing animation
        collected: false,
        respawnTimer: 0
    };
}

function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(spawnStar());
    }
}

// --- Background Stars (parallax decoration) ---
let bgStars = [];

function initBgStars() {
    bgStars = [];
    for (let i = 0; i < 120; i++) {
        bgStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            brightness: Math.random() * 0.5 + 0.3,
            twinkleSpeed: Math.random() * 0.02 + 0.005
        });
    }
}
initBgStars();

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
    scoreEl.textContent = 'Score: 0';
    messageEl.classList.add('hidden');
    player.reset();
    initStars();
}

function die() {
    state = 'dead';
    if (score > highScore) highScore = score;
    emitParticles(player.x, player.y, '#ff4444', 30);
    showMessage(`Game Over!<br><span class="sub">Score: ${score} | Best: ${highScore}<br>Press Space or Tap to retry</span>`);
}

function showMessage(html) {
    messageEl.innerHTML = html;
    messageEl.classList.remove('hidden');
}

// --- Update ---
let frameCount = 0;

function update() {
    frameCount++;

    if (state !== 'playing') return;

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
        emitParticles(
            player.x - 15,
            player.y + 5,
            '#ff8800',
            2
        );
    }

    // Boundaries — die if hit top or bottom
    if (player.y - PLAYER_SIZE < 0 || player.y + PLAYER_SIZE > canvas.height) {
        die();
        return;
    }

    // Star collision
    for (const star of stars) {
        if (star.collected) continue;

        const dx = player.x - star.x;
        const dy = player.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < PLAYER_SIZE + star.size) {
            star.collected = true;
            star.respawnTimer = STAR_RESPAWN_DELAY;
            score++;
            scoreEl.textContent = `Score: ${score}`;
            emitParticles(star.x, star.y, '#ffd700', 12);
        }
    }

    // Star respawn
    for (const star of stars) {
        if (star.collected) {
            star.respawnTimer--;
            if (star.respawnTimer <= 0) {
                const newStar = spawnStar();
                star.x = newStar.x;
                star.y = newStar.y;
                star.collected = false;
                star.pulse = newStar.pulse;
            }
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
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

    // Background stars (twinkling)
    for (const s of bgStars) {
        const twinkle = Math.sin(frameCount * s.twinkleSpeed) * 0.3 + s.brightness;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
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

    // Player body
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Body (rocket shape)
    ctx.fillStyle = '#4488ff';
    ctx.beginPath();
    ctx.moveTo(PLAYER_SIZE, 0);                  // nose
    ctx.lineTo(-PLAYER_SIZE * 0.7, -PLAYER_SIZE * 0.6);  // top-left
    ctx.lineTo(-PLAYER_SIZE * 0.4, 0);           // indent
    ctx.lineTo(-PLAYER_SIZE * 0.7, PLAYER_SIZE * 0.6);   // bottom-left
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
        const flameLen = 10 + Math.random() * 10;
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(-PLAYER_SIZE * 0.4, -PLAYER_SIZE * 0.25);
        ctx.lineTo(-PLAYER_SIZE * 0.4 - flameLen, 0);
        ctx.lineTo(-PLAYER_SIZE * 0.4, PLAYER_SIZE * 0.25);
        ctx.closePath();
        ctx.fill();

        // Inner flame
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(-PLAYER_SIZE * 0.4, -PLAYER_SIZE * 0.12);
        ctx.lineTo(-PLAYER_SIZE * 0.4 - flameLen * 0.6, 0);
        ctx.lineTo(-PLAYER_SIZE * 0.4, PLAYER_SIZE * 0.12);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}

function drawStar(x, y, size, pulse) {
    const pulseFactor = 1 + Math.sin(frameCount * 0.05 + pulse) * 0.15;
    const s = size * pulseFactor;
    const spikes = 5;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(frameCount * 0.01 + pulse);

    // Glow
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

function drawStartScreen() {
    // Title
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 64px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 30;
    ctx.fillText('FLY HIGH', canvas.width / 2, canvas.height / 2 - 40);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.fillStyle = '#aaaacc';
    ctx.font = '22px Segoe UI, sans-serif';
    ctx.fillText('Collect the stars!', canvas.width / 2, canvas.height / 2 + 10);

    // Instruction
    ctx.fillStyle = '#666688';
    ctx.font = '16px Segoe UI, sans-serif';
    ctx.fillText('Press Space, Click, or Tap to start', canvas.width / 2, canvas.height / 2 + 50);

    ctx.textAlign = 'left';
}

// --- Main Loop ---

function gameLoop() {
    update();

    drawBackground();

    if (state === 'start') {
        drawStartScreen();
    } else {
        drawStars();
        drawPlayer();
    }

    drawParticles();

    requestAnimationFrame(gameLoop);
}

// --- Init ---
showMessage('');
messageEl.classList.add('hidden');
gameLoop();
