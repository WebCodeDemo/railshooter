const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bulletCountElement = document.getElementById('bulletCount');
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const zombieCountElement = document.getElementById('zombieCount');

let bullets = 100;
let score = 0;
let enemies = [];
let gameOver = false;
let startTime = Date.now();
let spawnInterval = 1000; // Start spawning every 1 second
let spawnTimer = 0;

class Enemy {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = 30;
        this.baseSpeed = 1 + Math.random() * 2;
        this.color = 'red';
        this.jitterTimer = 0;
        this.jitterInterval = 100 + Math.random() * 200; // Random interval between 100ms and 300ms
		this.color = `rgb(${128 + Math.random() * 128}, ${Math.random() * 128}, ${Math.random() * 128})`;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }

    update(deltaTime) {
        this.jitterTimer += deltaTime;
        if (this.jitterTimer >= this.jitterInterval) {
            this.jitterTimer = 0;
            this.jitterInterval = 100 + Math.random() * 200; // Reset jitter interval
        }

        const jitterFactor = Math.sin(this.jitterTimer / this.jitterInterval * Math.PI) * 2;
        const speed = this.baseSpeed + jitterFactor;

        this.x += (Math.random() - 0.5) * speed * (deltaTime / 16);
        this.y += (Math.random() - 0.5) * speed * (deltaTime / 16);

        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width) this.x = canvas.width;
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height) this.y = canvas.height;
    }
}

function spawnEnemy() {
    enemies.push(new Enemy());
}

function drawCrosshair(x, y) {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y + 10);
    ctx.stroke();
}

let lastTime = 0;
function gameLoop(currentTime) {
    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and spawn enemies
    spawnTimer += deltaTime;
    if (spawnTimer >= spawnInterval) {
        spawnEnemy();
        spawnTimer = 0;
        
        // Decrease spawn interval (increase difficulty)
        spawnInterval = Math.max(100, spawnInterval * 0.99);
    }

    enemies.forEach(enemy => {
        enemy.update(deltaTime);
        enemy.draw();
    });

    drawCrosshair(canvas.width / 2, canvas.height / 2);

    // Update time and zombie count
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timeElement.textContent = elapsedTime;
    zombieCountElement.textContent = enemies.length;

    // Check for game over condition
    if (enemies.length > 30) {
        gameOver = true;
    }

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (event) => {
    if (gameOver) return;

    bullets--;
    bulletCountElement.textContent = bullets;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = x - enemy.x;
        const dy = y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < enemy.size / 2) {
            enemies.splice(i, 1);
            score++;
            scoreElement.textContent = score;
            bullets++;
            bulletCountElement.textContent = bullets;
            break;
        }
    }
});

requestAnimationFrame(gameLoop);
