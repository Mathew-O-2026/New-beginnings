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

let camera = {
    x: 0,
    y: 0
};

let gravity = 0.5;
let playerSpeed = 5;
let jumpStrength = -10;

let platforms = [];
let hazards = [];

let levelStartTime = null;
let levelFinished = false;
let finishX = null;

const levels = {
    easy: {
        gravity: 0.4,
        speed: 4,
        jump: -12,
        finishX: 2600,
        worldWidth: 2800,
        platforms: [
            {x: 0, y: 500, width: 2800, height: 20},
            {x: 150, y: 420, width: 250, height: 20},
            {x: 420, y: 360, width: 180, height: 20},
            {x: 640, y: 300, width: 260, height: 20},
            {x: 950, y: 400, width: 200, height: 20},
            {x: 1200, y: 320, width: 180, height: 20},
            {x: 1450, y: 380, width: 220, height: 20},
            {x: 1750, y: 280, width: 200, height: 20},
            {x: 2000, y: 350, width: 190, height: 20},
            {x: 2250, y: 320, width: 220, height: 20},
            {x: 2500, y: 380, width: 180, height: 20}
        ],
        hazards: [
            {x: 550, y: 480, width: 40, height: 20},
            {x: 900, y: 460, width: 40, height: 20},
            {x: 1350, y: 440, width: 40, height: 20},
            {x: 1600, y: 440, width: 40, height: 20},
            {x: 2150, y: 450, width: 40, height: 20}
        ]
    },
    medium: {
        gravity: 0.55,
        speed: 5,
        jump: -10,
        finishX: 2700,
        worldWidth: 2900,
        platforms: [
            {x: 0, y: 500, width: 2900, height: 20},
            {x: 220, y: 420, width: 160, height: 20},
            {x: 420, y: 360, width: 140, height: 20},
            {x: 600, y: 310, width: 180, height: 20},
            {x: 850, y: 400, width: 150, height: 20},
            {x: 1050, y: 340, width: 140, height: 20},
            {x: 1270, y: 250, width: 160, height: 20},
            {x: 1500, y: 320, width: 150, height: 20},
            {x: 1750, y: 360, width: 180, height: 20},
            {x: 1980, y: 280, width: 130, height: 20},
            {x: 2170, y: 350, width: 140, height: 20},
            {x: 2380, y: 300, width: 160, height: 20},
            {x: 2600, y: 360, width: 150, height: 20}
        ],
        hazards: [
            {x: 500, y: 480, width: 40, height: 20},
            {x: 800, y: 460, width: 40, height: 20},
            {x: 1100, y: 440, width: 40, height: 20},
            {x: 1400, y: 420, width: 40, height: 20},
            {x: 1700, y: 460, width: 40, height: 20},
            {x: 2050, y: 440, width: 40, height: 20},
            {x: 2300, y: 450, width: 40, height: 20}
        ]
    },
    hard: {
        gravity: 0.75,
        speed: 6,
        jump: -9,
        finishX: 2800,
        worldWidth: 3000,
        platforms: [
            {x: 0, y: 500, width: 3000, height: 20},
            {x: 180, y: 440, width: 140, height: 20},
            {x: 360, y: 380, width: 120, height: 20},
            {x: 560, y: 320, width: 110, height: 20},
            {x: 760, y: 260, width: 120, height: 20},
            {x: 950, y: 340, width: 100, height: 20},
            {x: 1100, y: 280, width: 130, height: 20},
            {x: 1300, y: 360, width: 110, height: 20},
            {x: 1480, y: 300, width: 120, height: 20},
            {x: 1700, y: 380, width: 140, height: 20},
            {x: 1920, y: 320, width: 130, height: 20},
            {x: 2150, y: 200, width: 140, height: 20},
            {x: 2350, y: 280, width: 120, height: 20},
            {x: 2550, y: 360, width: 130, height: 20},
            {x: 2750, y: 300, width: 150, height: 20}
        ],
        hazards: [
            {x: 480, y: 460, width: 40, height: 20},
            {x: 700, y: 440, width: 40, height: 20},
            {x: 880, y: 420, width: 40, height: 20},
            {x: 1050, y: 440, width: 40, height: 20},
            {x: 1250, y: 460, width: 40, height: 20},
            {x: 1550, y: 440, width: 40, height: 20},
            {x: 1800, y: 450, width: 40, height: 20},
            {x: 2050, y: 440, width: 40, height: 20},
            {x: 2300, y: 460, width: 40, height: 20},
            {x: 2500, y: 450, width: 40, height: 20}
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
    hazards = JSON.parse(JSON.stringify(lvl.hazards || []));
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

    // Check collision with hazards (red obstacles)
    for (let h of hazards) {
        if (player.x < h.x + h.width &&
            player.x + player.width > h.x &&
            player.y < h.y + h.height &&
            player.y + player.height > h.y) {
            // Hit hazard - restart level
            resetPlayer();
            levelStartTime = performance.now();
            levelFinished = false;
            const timeLabel = document.getElementById('timeDisplay');
            if (timeLabel) timeLabel.textContent = 'Time: --';
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

    // Update camera to follow player (keep player centered horizontally)
    const cameraTargetX = player.x - canvas.width / 2 + player.width / 2;
    camera.x = Math.max(0, Math.min(cameraTargetX, levels[currentLevel].worldWidth - canvas.width));
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw platforms with camera offset
    ctx.fillStyle = 'green';
    for (let p of platforms) {
        ctx.fillRect(p.x - camera.x, p.y, p.width, p.height);
    }

    // Draw hazards (red obstacles) with camera offset
    ctx.fillStyle = '#FF3333';
    for (let h of hazards) {
        ctx.fillRect(h.x - camera.x, h.y, h.width, h.height);
    }

    // Draw finish line with camera offset
    if (finishX !== null) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(finishX - camera.x, 0, 8, canvas.height);
        // small flag near the ground level
        let flagY = canvas.height - 120;
        if (platforms.length) flagY = platforms[0].y - 36;
        ctx.fillStyle = 'yellow';
        ctx.fillRect(finishX - camera.x + 8, flagY, 14, 10);
        // label
        ctx.fillStyle = 'black';
        ctx.font = '14px sans-serif';
        ctx.fillText('FINISH', finishX - camera.x - 10, Math.max(20, flagY - 6));
    }

    // Draw player with camera offset
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x - camera.x, player.y, player.width, player.height);

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