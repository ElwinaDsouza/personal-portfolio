document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. NAVIGATION & TAB SWITCHING WITH SKELETON LOADING
    // =========================================================
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active-tab'));

            btn.classList.add('active');
            const activeSection = document.getElementById(`tab-${targetTab}`);
            if (activeSection) {
                activeSection.classList.add('active-tab');
            }

            // Trigger skeleton loading animation when switching to Projects tab
            if (targetTab === 'projects') {
                const skeleton = document.getElementById('skeleton-container');
                const realProjects = document.getElementById('real-projects-container');

                if (skeleton && realProjects) {
                    skeleton.classList.remove('hidden');
                    realProjects.classList.add('hidden');

                    setTimeout(() => {
                        skeleton.classList.add('hidden');
                        realProjects.classList.remove('hidden');
                    }, 600);
                }
            }
        });
    });

    // View Project 1 Trigger
    const viewProject1Btn = document.getElementById('view-project1-btn');
    if (viewProject1Btn) {
        viewProject1Btn.addEventListener('click', (e) => {
            e.preventDefault();
            const launchBtn = document.getElementById('launch-game-btn');
            if (launchBtn) launchBtn.click();
        });
    }

    // =========================================================
    // 2. THEME SWITCHER (DARK / LIGHT TOGGLE)
    // =========================================================
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // =========================================================
    // 3. GAMIFIED PORTFOLIO: "ERROR CATCHER" CANVAS GAME
    // =========================================================
    const launchBtn = document.getElementById('launch-game-btn');
    const closeBtn = document.getElementById('close-game-btn');
    const gameModal = document.getElementById('game-modal');
    const canvas = document.getElementById('gameCanvas');

    if (!canvas) return; // Safety check
    const ctx = canvas.getContext('2d');

    const startBtn = document.getElementById('start-game-btn');
    const gameOverlay = document.getElementById('game-overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayDesc = document.getElementById('overlay-desc');
    const livesDisplay = document.getElementById('lives-display');
    const scoreDisplay = document.getElementById('score-display');

    // Game state variables
    let animationId = null;
    let score = 0;
    let lives = 3;
    let isPlaying = false;
    let baseSpeed = 1.5;

    // Paddle / Debugger Tool
    const paddle = {
        width: 70,
        height: 12,
        x: canvas.width / 2 - 35,
        y: canvas.height - 25,
        speed: 6,
        dx: 0
    };

    // Error Labels
    const errorTypes = ['404', 'NaN', 'Null', 'SyntaxErr', '500'];
    let errors = [];

    function createError() {
        const randomLabel = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        const radius = 16;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        errors.push({
            x: x,
            y: -radius,
            radius: radius,
            label: randomLabel,
            speed: baseSpeed + Math.random() * 0.1
        });
    }

    // Controls Handling (Touchpad, Mouse, Touch, Keyboard)
    function movePaddleTo(xPos) {
        const rect = canvas.getBoundingClientRect();
        const relativeX = xPos - rect.left;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddle.x = relativeX - paddle.width / 2;
        }
    }

    canvas.addEventListener('mousemove', (e) => movePaddleTo(e.clientX));
    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) movePaddleTo(e.touches[0].clientX);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') paddle.dx = -paddle.speed;
        if (e.key === 'ArrowRight' || e.key === 'd') paddle.dx = paddle.speed;
    });

    document.addEventListener('keyup', (e) => {
        if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) paddle.dx = 0;
    });

    function updateLivesDisplay() {
        if (livesDisplay) {
            livesDisplay.textContent = '❤️'.repeat(Math.max(0, lives));
        }
    }

    function stopGameLoop() {
        isPlaying = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    function endGame() {
        stopGameLoop();
        
        // Calculate total bugs fixed based on score (10 points per error)
        const bugsFixed = Math.floor(score / 10);

        if (overlayTitle) overlayTitle.textContent = 'GAME OVER';
        if (overlayDesc) overlayDesc.textContent = `Fixed ${bugsFixed} errors and scored ${score} points!`;
        if (startBtn) startBtn.textContent = 'RETRY';
        if (gameOverlay) gameOverlay.classList.remove('hidden');
    }

    // Main Canvas Render Loop
    function gameLoop() {
        if (!isPlaying) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Paddle Movement
        paddle.x += paddle.dx;
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;

        // Draw Debugger Paddle
        ctx.fillStyle = '#00d2ff';
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        ctx.fillStyle = '#000000';
        ctx.font = '8px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText('DEBUGGER', paddle.x + 5, paddle.y + 9);

        // Spawn Error Circles
        if (Math.random() < 0.022) createError();

        // Process Falling Error Circles
        for (let i = errors.length - 1; i >= 0; i--) {
            let err = errors[i];
            err.y += err.speed;

            // Draw Red Circular Glowing Badge
            ctx.beginPath();
            ctx.arc(err.x, err.y, err.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ff4757';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw Error Name Inside Circle
            ctx.fillStyle = '#ffffff';
            ctx.font = '7px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(err.label, err.x, err.y + 3);

            // Catch Collision Check
            if (
                err.y + err.radius >= paddle.y &&
                err.y - err.radius <= paddle.y + paddle.height &&
                err.x >= paddle.x &&
                err.x <= paddle.x + paddle.width
            ) {
                errors.splice(i, 1);
                score += 10;
                if (scoreDisplay) scoreDisplay.textContent = String(score).padStart(4, '0');
                
                // Gradually increase falling speed for new & existing errors
                baseSpeed += 0.02;
                errors.forEach(e => e.speed += 0.02);
                
                continue;
            }

            // Missed Error Check
            if (err.y - err.radius > canvas.height) {
                errors.splice(i, 1);
                lives--;
                updateLivesDisplay();

                if (lives <= 0) {
                    endGame();
                    return;
                }
            }
        }

        animationId = requestAnimationFrame(gameLoop);
    }

    function resetAndStartGame() {
        score = 0;
        lives = 3;
        baseSpeed = 1.8;
        errors = [];
        isPlaying = true;

        if (scoreDisplay) scoreDisplay.textContent = '0000';
        updateLivesDisplay();
        if (gameOverlay) gameOverlay.classList.add('hidden');

        stopGameLoop();
        isPlaying = true;
        gameLoop();
    }

    // Modal Control Event Listeners
    if (launchBtn) {
        launchBtn.addEventListener('click', () => {
            if (gameModal) gameModal.classList.remove('hidden');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (gameModal) gameModal.classList.add('hidden');
            stopGameLoop();
        });
    }

    if (startBtn) {
        startBtn.addEventListener('click', resetAndStartGame);
    }
});