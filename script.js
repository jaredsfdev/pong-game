// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = true;
let playerScore = 0;
let computerScore = 0;

// Paddle properties
const paddleWidth = 10;
const paddleHeight = 80;
const paddleSpeed = 6;

// Player paddle (left)
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    moving: false
};

// Computer paddle (right)
const computerPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    maxSpeed: 8
};

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

// Keyboard events
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // Space to toggle pause
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse movement for player paddle control
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle position based on input
function updatePlayerPaddle() {
    // Arrow keys
    if (keys['ArrowUp']) {
        playerPaddle.y -= paddleSpeed;
    }
    if (keys['ArrowDown']) {
        playerPaddle.y += paddleSpeed;
    }

    // Mouse control
    const targetY = mouseY - paddleHeight / 2;
    playerPaddle.y += (targetY - playerPaddle.y) * 0.2; // Smooth movement

    // Boundary collision for player paddle
    if (playerPaddle.y < 0) {
        playerPaddle.y = 0;
    }
    if (playerPaddle.y + paddleHeight > canvas.height) {
        playerPaddle.y = canvas.height - paddleHeight;
    }
}

// Update computer paddle with AI
function updateComputerPaddle() {
    const computerPaddleCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;

    // AI difficulty - computer follows ball with slight delay
    const difficulty = 0.08;

    if (computerPaddleCenter < ballCenter - 35) {
        computerPaddle.y += paddleSpeed * difficulty;
    } else if (computerPaddleCenter > ballCenter + 35) {
        computerPaddle.y -= paddleSpeed * difficulty;
    }

    // Boundary collision for computer paddle
    if (computerPaddle.y < 0) {
        computerPaddle.y = 0;
    }
    if (computerPaddle.y + paddleHeight > canvas.height) {
        computerPaddle.y = canvas.height - paddleHeight;
    }
}

// Update ball position
function updateBall() {
    if (!gameRunning) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.dy *= -1;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.dy *= -1;
    }

    // Collision with player paddle
    if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
        ball.dx *= -1;

        // Add spin based on where the ball hits the paddle
        const deltaY = ball.y - (playerPaddle.y + playerPaddle.height / 2);
        ball.dy = deltaY * 0.2;

        // Increase ball speed slightly
        if (Math.abs(ball.dx) < ball.maxSpeed) {
            ball.dx *= 1.02;
        }
    }

    // Collision with computer paddle
    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.x = computerPaddle.x - ball.radius;
        ball.dx *= -1;

        // Add spin based on where the ball hits the paddle
        const deltaY = ball.y - (computerPaddle.y + computerPaddle.height / 2);
        ball.dy = deltaY * 0.2;

        // Increase ball speed slightly
        if (Math.abs(ball.dx) < ball.maxSpeed) {
            ball.dx *= 1.02;
        }
    }

    // Scoring
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
        updateScore();
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
        updateScore();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() - 0.5) * 5;
    gameRunning = false;

    // Auto-start after 2 seconds
    setTimeout(() => {
        gameRunning = true;
    }, 2000);
}

// Update scoreboard
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw paddle
function drawPaddle(paddle, color = '#4ef744') {
    ctx.fillStyle = color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Draw ball
function drawBall() {
    ctx.fillStyle = '#4ef744';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Ball glow effect
    ctx.strokeStyle = 'rgba(78, 247, 68, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
}

// Draw center line
function drawCenterLine() {
    ctx.strokeStyle = 'rgba(78, 247, 68, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Draw pause text
function drawPauseText() {
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(78, 247, 68, 0.7)';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawCenterLine();
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();

    // Update game state
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();

    // Draw pause text if game is paused
    drawPauseText();

    requestAnimationFrame(gameLoop);
}

// Start the game
gameRunning = false; // Wait for first space press
gameLoop();