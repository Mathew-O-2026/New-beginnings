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

const levels = {
    easy: {
        gravity: 0.4,
        speed: 4,
        jump: -12,
        platforms: [
            {x: 0, y: 500, width: 800, height: 20},
            {x: 150, y: 420, width: 150, height: 20},
            {x: 360, y: 360, width: 120, height: 20},
            {x: 560, y: 300, width: 160, height: 20}
        ]
    },
    medium: {
        gravity: 0.55,
        speed: 5,
        jump: -10,
        platforms: [
            {x: 0, y: 500, width: 800, height: 20},
            {x: 220, y: 420, width: 100, height: 20},
            {x: 420, y: 360, width: 90, height: 20},
            {x: 600, y: 310, width: 90, height: 20}
        ]
    },
    hard: {
        gravity: 0.75,
        speed: 6,
        jump: -9,
        platforms: [
            {x: 0, y: 500, width: 800, height: 20},
            {x: 180, y: 440, width: 80, height: 20},
            {x: 330, y: 380, width: 70, height: 20},
            {x: 520, y: 320, width: 60, height: 20},
            {x: 700, y: 260, width: 60, height: 20}
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
    if (startBtn) startBtn.addEventListener('click', () => resetPlayer());
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

    // Draw player
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Ensure level is applied immediately (in case DOMContentLoaded already fired)
applyLevel(currentLevel);

gameLoop();