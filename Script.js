const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: 100,
    y: 300,
    width: 20,
    height: 20,
    vx: 0,
    vy: 0,
    onGround: false
};

let gravity = 0.5;
let playerSpeed = 5;
let jumpStrength = -10;

let platforms = [];

let levelStartTime = null;
let levelFinished = false;
let finishX = null;

const levels = {
    easy: {
        gravity: 0.4,
        speed: 4,
        jump: -12,
        finishX: 720,
        platforms: [
            {x: 0, y: 500, width: 1000, height: 20},
            {x: 150, y: 420, width: 250, height: 20},
            {x: 420, y: 360, width: 180, height: 20},
            {x: 640, y: 300, width: 260, height: 20}
        ]
    },
    medium: {
        gravity: 0.55,
        speed: 5,
        jump: -10,
        finishX: 740,
        platforms: [
            {x: 0, y: 500, width: 1100, height: 20},
            {x: 220, y: 420, width: 160, height: 20},
            {x: 420, y: 360, width: 140, height: 20},
            {x: 600, y: 310, width: 180, height: 20}
        ]
    },
    hard: {
        gravity: 0.75,
        speed: 6,
        jump: -9,
        finishX: 760,
        platforms: [
            {x: 0, y: 500, width: 1200, height: 20},
            {x: 180, y: 440, width: 140, height: 20},
            {x: 360, y: 380, width: 120, height: 20},
            {x: 560, y: 320, width: 110, height: 20},
            {x: 760, y: 260, width: 120, height: 20}
        ]
    }
};

let keys = {};
let currentLevel = 'easy';

function applyLevel(levelName) {
    const lvl = levels[levelName];
    if (!lvl) return;
    gravity = lvl.gravity;
    playerSpeed = lvl.speed;
    jumpStrength = lvl.jump;
    // deep copy platforms so runtime changes don't affect the templates
    platforms = JSON.parse(JSON.stringify(lvl.platforms));
    currentLevel = levelName;
    const levelLabel = document.getElementById('currentLevel');
    if (levelLabel) levelLabel.textContent = 'Level: ' + levelName.charAt(0).toUpperCase() + levelName.slice(1);
    // update selected button styles
    ['easy','medium','hard'].forEach(n => {
        const btn = document.getElementById(n + 'Btn');
        if (btn) btn.classList.toggle('selected', n === levelName);
    });
    resetPlayer();
    // setup finish line and timer
    finishX = lvl.finishX || (canvas.width - 40);
    levelStartTime = performance.now();
    levelFinished = false;
    const timeLabel = document.getElementById('timeDisplay');
    if (timeLabel) timeLabel.textContent = 'Time: --';
}

function resetPlayer() {
    player.x = 100;
    player.y = 300;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowUp') keys.up = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowUp') keys.up = false;
});

// Level control buttons
document.addEventListener('DOMContentLoaded', () => {
    const easyBtn = document.getElementById('easyBtn');
    const mediumBtn = document.getElementById('mediumBtn');
    const hardBtn = document.getElementById('hardBtn');
    const startBtn = document.getElementById('startBtn');
    if (easyBtn) easyBtn.addEventListener('click', () => applyLevel('easy'));
    if (mediumBtn) mediumBtn.addEventListener('click', () => applyLevel('medium'));
    if (hardBtn) hardBtn.addEventListener('click', () => applyLevel('hard'));
    if (startBtn) startBtn.addEventListener('click', () => { resetPlayer(); levelStartTime = performance.now(); levelFinished = false; const timeLabel = document.getElementById('timeDisplay'); if (timeLabel) timeLabel.textContent = 'Time: --'; });
    applyLevel(currentLevel);
});

function update() {
    // Apply gravity
    player.vy += gravity;
    player.y += player.vy;

    // Reset onGround
    player.onGround = false;

    // Check collision with platforms
    for (let p of platforms) {
        if (player.x < p.x + p.width &&
            player.x + player.width > p.x &&
            player.y < p.y + p.height &&
            player.y + player.height > p.y) {
            // Collision detected
            if (player.vy > 0) { // Player is falling
                player.y = p.y - player.height;
                player.vy = 0;
                player.onGround = true;
            }
        }
    }

    // Check finish crossing
    if (!levelFinished && finishX !== null && (player.x + player.width) >= finishX) {
        levelFinished = true;
        const t = ((performance.now() - levelStartTime) / 1000).toFixed(2);
        const timeLabel = document.getElementById('timeDisplay');
        if (timeLabel) timeLabel.textContent = 'Time: ' + t + 's';
    }

    // Handle horizontal movement
    if (keys.right) {
        player.vx = playerSpeed;
    } else if (keys.left) {
        player.vx = -playerSpeed;
    } else {
        player.vx = 0;
    }
    player.x += player.vx;

    // Handle jump
    if (keys.up && player.onGround) {
        player.vy = jumpStrength;
        player.onGround = false;
    }

    // Prevent player from going off screen (simple bounds)
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = 'green';
    for (let p of platforms) {
        ctx.fillRect(p.x, p.y, p.width, p.height);
    }

    // Draw finish line
    if (finishX !== null) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(finishX, 0, 8, canvas.height);
        // small flag near the ground level
        let flagY = canvas.height - 120;
        if (platforms.length) flagY = platforms[0].y - 36;
        ctx.fillStyle = 'yellow';
        ctx.fillRect(finishX + 8, flagY, 14, 10);
        // label
        ctx.fillStyle = 'black';
        ctx.font = '14px sans-serif';
        ctx.fillText('FINISH', finishX - 10, Math.max(20, flagY - 6));
    }

    // Draw player
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Update running timer display while playing
    if (!levelFinished && levelStartTime !== null) {
        const elapsed = ((performance.now() - levelStartTime) / 1000).toFixed(2);
        const timeLabel = document.getElementById('timeDisplay');
        if (timeLabel) timeLabel.textContent = 'Time: ' + elapsed + 's';
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Ensure level is applied immediately (in case DOMContentLoaded already fired)
applyLevel(currentLevel);

gameLoop();