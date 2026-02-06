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
let basePlayerSpeed = 5; // Store base speed to restore after powerup
let jumpStrength = -10;

let platforms = [];
let hazards = [];
let powerups = []; // Array to store powerup objects
let speedBoost = null; // Current speed boost {multiplier: 1.5, duration: 5000, startTime: ...}
let groundHazardLevel = 500; // Y-level where the ground hazard exists

let levelStartTime = null;
let levelFinished = false;
let finishX = null;

const levels = {
    easy: {
        gravity: 0.4,
        speed: 4,
        jump: -12,
        finishX: 5200,
        worldWidth: 5400,
        platforms: [
            {x: 0, y: 500, width: 5400, height: 20, isGround: true},
            {x: 150, y: 420, width: 250, height: 20},
            {x: 420, y: 360, width: 180, height: 20},
            {x: 640, y: 300, width: 260, height: 20},
            {x: 950, y: 400, width: 200, height: 20},
            {x: 1200, y: 320, width: 180, height: 20},
            {x: 1450, y: 380, width: 220, height: 20},
            {x: 1750, y: 280, width: 200, height: 20},
            {x: 2000, y: 350, width: 190, height: 20},
            {x: 2250, y: 320, width: 220, height: 20},
            {x: 2500, y: 380, width: 180, height: 20},
            {x: 2800, y: 300, width: 200, height: 20},
            {x: 3100, y: 380, width: 190, height: 20},
            {x: 3400, y: 320, width: 180, height: 20},
            {x: 3700, y: 360, width: 220, height: 20},
            {x: 4000, y: 280, width: 200, height: 20},
            {x: 4300, y: 350, width: 190, height: 20},
            {x: 4600, y: 320, width: 220, height: 20}
        ],
        powerups: [
            {x: 480, y: 345, width: 15, height: 15, type: 'speed'},
            {x: 1260, y: 305, width: 15, height: 15, type: 'speed'},
            {x: 2060, y: 335, width: 15, height: 15, type: 'speed'},
            {x: 3160, y: 365, width: 15, height: 15, type: 'speed'},
            {x: 4060, y: 265, width: 15, height: 15, type: 'speed'}
        ]
    },
    medium: {
        gravity: 0.55,
        speed: 5,
        jump: -10,
        finishX: 5400,
        worldWidth: 5600,
        platforms: [
            {x: 0, y: 500, width: 5600, height: 20, isGround: true},
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
            {x: 2600, y: 360, width: 150, height: 20},
            {x: 2850, y: 310, width: 140, height: 20},
            {x: 3100, y: 380, width: 170, height: 20},
            {x: 3350, y: 290, width: 150, height: 20},
            {x: 3600, y: 340, width: 140, height: 20},
            {x: 3850, y: 270, width: 160, height: 20},
            {x: 4100, y: 360, width: 150, height: 20},
            {x: 4350, y: 310, width: 140, height: 20},
            {x: 4600, y: 350, width: 170, height: 20}
        ],
        powerups: [
            {x: 480, y: 345, width: 15, height: 15, type: 'speed'},
            {x: 1110, y: 325, width: 15, height: 15, type: 'speed'},
            {x: 1810, y: 345, width: 15, height: 15, type: 'speed'},
            {x: 2440, y: 285, width: 15, height: 15, type: 'speed'},
            {x: 3410, y: 275, width: 15, height: 15, type: 'speed'},
            {x: 4160, y: 345, width: 15, height: 15, type: 'speed'}
        ]
    },
    hard: {
        gravity: 0.75,
        speed: 6,
        jump: -9,
        finishX: 5600,
        worldWidth: 5800,
        platforms: [
            {x: 0, y: 500, width: 5800, height: 20, isGround: true},
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
            {x: 2750, y: 300, width: 150, height: 20},
            {x: 2980, y: 380, width: 140, height: 20},
            {x: 3200, y: 260, width: 120, height: 20},
            {x: 3450, y: 340, width: 130, height: 20},
            {x: 3650, y: 290, width: 110, height: 20},
            {x: 3900, y: 360, width: 140, height: 20},
            {x: 4120, y: 310, width: 120, height: 20},
            {x: 4350, y: 380, width: 130, height: 20},
            {x: 4600, y: 280, width: 140, height: 20},
            {x: 4850, y: 320, width: 120, height: 20}
        ],
        powerups: [
            {x: 420, y: 365, width: 15, height: 15, type: 'speed'},
            {x: 820, y: 245, width: 15, height: 15, type: 'speed'},
            {x: 1160, y: 265, width: 15, height: 15, type: 'speed'},
            {x: 1760, y: 365, width: 15, height: 15, type: 'speed'},
            {x: 2210, y: 185, width: 15, height: 15, type: 'speed'},
            {x: 2810, y: 285, width: 15, height: 15, type: 'speed'},
            {x: 3510, y: 325, width: 15, height: 15, type: 'speed'},
            {x: 4410, y: 365, width: 15, height: 15, type: 'speed'}
        ]
    }
};

// Function to randomize platform positions (jumps only, not the ground)
function randomizePlatforms(levelName) {
    const lvl = levels[levelName];
    if (!lvl) return [];
    
    const randomized = [];
    const groundPlatform = lvl.platforms[0];
    
    // Always keep the ground platform
    randomized.push({...groundPlatform});
    
    // Keep first jumping platform fixed to spawn under player (guarantee safe spawn)
    randomized.push({
        x: 50,
        y: 420,
        width: 200,
        height: 20
    });
    
    // Physics: max jump height for this difficulty
    const jumpVel = Math.abs(lvl.jump);
    const gravity = lvl.gravity;
    const playerSpeed = lvl.speed;
    
    // Max height the player can reach
    const maxJumpHeight = (jumpVel * jumpVel) / (2 * gravity);
    
    // Randomize other platforms with safe constraints
    let prevX = 50 + 200; // End of spawn platform
    let prevY = 420;
    
    for (let i = 2; i < lvl.platforms.length; i++) {
        const platform = lvl.platforms[i];
        
        // Small horizontal randomization to stay within jumping range
        const baseX = platform.x;
        const randomVariation = Math.random() * 80 - 40; // Range: -40 to +40
        const newX = Math.max(prevX + 80, Math.min(baseX + randomVariation, lvl.worldWidth - platform.width - 50));
        
        // Horizontal gap between platforms
        const horizontalGap = newX - prevX;
        
        // Vertical constraint based on horizontal distance
        // Farther gaps need lower platforms (easier to reach)
        // Close gaps can have higher platforms
        const gapRatio = Math.max(0.3, Math.min(1.0, 300 / horizontalGap));
        const allowedVerticalRange = Math.floor(maxJumpHeight * gapRatio * 0.8);
        
        // Platforms can go up by allowedVerticalRange or down significantly
        const minY = Math.max(250, prevY - allowedVerticalRange);
        const maxY = Math.min(480, prevY + 60); // Can go down more freely
        
        const newY = minY < maxY ? 
            Math.floor(minY + Math.random() * (maxY - minY)) : 
            minY;
        
        randomized.push({
            x: newX,
            y: newY,
            width: platform.width,
            height: platform.height
        });
        
        prevX = newX + platform.width;
        prevY = newY;
    }
    
    return randomized;
}

// Function to load powerups for the current level
function loadPowerups(levelName) {
    const lvl = levels[levelName];
    if (!lvl || !lvl.powerups) return [];
    
    // Return a copy of the powerups
    return lvl.powerups.map(p => ({...p, collected: false}));
}

let keys = {};
let currentLevel = 'easy';

function applyLevel(levelName) {
    const lvl = levels[levelName];
    if (!lvl) return;
    gravity = lvl.gravity;
    playerSpeed = lvl.speed;
    basePlayerSpeed = lvl.speed; // Store base speed
    jumpStrength = lvl.jump;
    // Get randomized platforms
    platforms = randomizePlatforms(levelName);
    // Load powerups for this level
    powerups = loadPowerups(levelName);
    // Reset speed boost
    speedBoost = null;
    // Store ground hazard level (the y-position of the ground platform)
    groundHazardLevel = platforms[0].y;
    // No more floating hazards - ground is the hazard
    hazards = [];
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

    // Check collision with all platforms
    for (let i = 0; i < platforms.length; i++) {
        let p = platforms[i];
        if (player.x < p.x + p.width &&
            player.x + player.width > p.x &&
            player.y < p.y + p.height &&
            player.y + player.height > p.y) {
            // Collision detected
            if (player.vy > 0) { // Player is falling
                if (i === 0) {
                    // Hit ground hazard - restart level
                    resetPlayer();
                    levelStartTime = performance.now();
                    levelFinished = false;
                    const timeLabel = document.getElementById('timeDisplay');
                    if (timeLabel) timeLabel.textContent = 'Time: --';
                    return; // Exit immediately to prevent further processing
                } else {
                    // Safe platform - land on it
                    player.y = p.y - player.height;
                    player.vy = 0;
                    player.onGround = true;
                }
            }
        }
    }

    // Check powerup collisions
    for (let i = 0; i < powerups.length; i++) {
        let pu = powerups[i];
        if (!pu.collected &&
            player.x < pu.x + pu.width &&
            player.x + player.width > pu.x &&
            player.y < pu.y + pu.height &&
            player.y + player.height > pu.y) {
            // Powerup collected
            pu.collected = true;
            if (pu.type === 'speed') {
                // Activate speed boost for 5 seconds
                speedBoost = {
                    multiplier: 1.8,
                    duration: 5000,
                    startTime: performance.now()
                };
            }
        }
    }

    // Handle speed boost duration
    if (speedBoost !== null) {
        const elapsed = performance.now() - speedBoost.startTime;
        if (elapsed >= speedBoost.duration) {
            speedBoost = null;
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
    const effectiveSpeed = speedBoost ? basePlayerSpeed * speedBoost.multiplier : playerSpeed;
    if (keys.right) {
        player.vx = effectiveSpeed;
    } else if (keys.left) {
        player.vx = -effectiveSpeed;
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
    // Ground platform as a hazard (red/orange color)
    if (platforms.length > 0) {
        const groundPlatform = platforms[0];
        ctx.fillStyle = '#FF6B6B'; // Red hazard color for ground
        ctx.fillRect(groundPlatform.x - camera.x, groundPlatform.y, groundPlatform.width, groundPlatform.height);
    }
    
    // Draw jumping platforms (safe platforms in green)
    ctx.fillStyle = 'green';
    for (let i = 1; i < platforms.length; i++) {
        let p = platforms[i];
        ctx.fillRect(p.x - camera.x, p.y, p.width, p.height);
    }

    // Draw powerups
    for (let i = 0; i < powerups.length; i++) {
        let pu = powerups[i];
        if (!pu.collected) {
            ctx.fillStyle = '#FFD700'; // Gold color for speed powerups
            ctx.beginPath();
            ctx.arc(pu.x + pu.width / 2 - camera.x, pu.y + pu.height / 2, pu.width / 2, 0, Math.PI * 2);
            ctx.fill();
            // Draw a star or lightning bolt pattern
            ctx.fillStyle = '#FFA500';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚡', pu.x + pu.width / 2 - camera.x, pu.y + pu.height / 2);
        }
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
    ctx.fillStyle = speedBoost ? '#FF1493' : 'red'; // Pink if boosted
    ctx.fillRect(player.x - camera.x, player.y, player.width, player.height);

    // Draw speed boost indicator
    if (speedBoost) {
        const remainingTime = Math.max(0, speedBoost.duration - (performance.now() - speedBoost.startTime));
        const remainingSeconds = (remainingTime / 1000).toFixed(1);
        ctx.fillStyle = '#FF1493';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('⚡ BOOST: ' + remainingSeconds + 's', 10, 30);
    }

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