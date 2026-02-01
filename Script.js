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

const gravity = 0.5;

const platforms = [
    {x: 0, y: 500, width: 800, height: 20},
    {x: 200, y: 400, width: 100, height: 20},
    {x: 400, y: 350, width: 100, height: 20},
    {x: 600, y: 300, width: 100, height: 20}
];

let keys = {};

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
        player.vx = 5;
    } else if (keys.left) {
        player.vx = -5;
    } else {
        player.vx = 0;
    }
    player.x += player.vx;

    // Handle jump
    if (keys.up && player.onGround) {
        player.vy = -10;
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

gameLoop();