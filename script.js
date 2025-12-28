/**
 * 🎮 Tic Tac Toe - Galaxy Edition
 * Premium Game Logic with Smooth Animations
 */

// Game State
const gameState = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    isGameOver: false,
    scores: { X: 0, O: 0 }
};

// Winning Combinations
const WIN_PATTERNS = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal \
    [2, 4, 6]  // Diagonal /
];

// DOM Elements
const cells = document.querySelectorAll('.cell');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const winnerModal = document.getElementById('winner-modal');
const winnerText = document.getElementById('winner-text');
const playAgainBtn = document.getElementById('play-again-btn');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');

// Initialize Game
function init() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', () => {
        winnerModal.classList.remove('show');
        resetGame();
    });

    updateStatus();
}

// Handle Cell Click
function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.dataset.index);

    // Check if cell is already taken or game is over
    if (gameState.board[index] !== '' || gameState.isGameOver) {
        return;
    }

    // Make move
    makeMove(cell, index);

    // Check for winner
    const winResult = checkWinner();

    if (winResult) {
        handleWin(winResult);
    } else if (checkDraw()) {
        handleDraw();
    } else {
        // Switch player
        switchPlayer();
    }
}

// Make Move
function makeMove(cell, index) {
    gameState.board[index] = gameState.currentPlayer;
    cell.textContent = gameState.currentPlayer;
    cell.classList.add(gameState.currentPlayer.toLowerCase(), 'taken');

    // Play sound effect (optional visual feedback)
    cell.style.transform = 'scale(0)';
    requestAnimationFrame(() => {
        cell.style.transform = '';
    });
}

// Check Winner
function checkWinner() {
    for (const pattern of WIN_PATTERNS) {
        const [a, b, c] = pattern;
        if (
            gameState.board[a] &&
            gameState.board[a] === gameState.board[b] &&
            gameState.board[a] === gameState.board[c]
        ) {
            return {
                winner: gameState.board[a],
                pattern: pattern
            };
        }
    }
    return null;
}

// Check Draw
function checkDraw() {
    return gameState.board.every(cell => cell !== '');
}

// Handle Win
function handleWin(result) {
    gameState.isGameOver = true;

    // Highlight winning cells
    result.pattern.forEach(index => {
        cells[index].classList.add('win');
    });

    // Update score
    gameState.scores[result.winner]++;
    updateScores();

    // Show winner modal after delay
    setTimeout(() => {
        winnerText.innerHTML = `🎉 ผู้เล่น <span class="player-${result.winner.toLowerCase()}">${result.winner}</span> ชนะ! 🎉`;
        winnerModal.classList.add('show');
    }, 800);

    statusElement.innerHTML = `🏆 ผู้เล่น <span class="player-${result.winner.toLowerCase()}">${result.winner}</span> ชนะ!`;
}

// Handle Draw
function handleDraw() {
    gameState.isGameOver = true;

    setTimeout(() => {
        winnerText.textContent = '🤝 เสมอกัน! 🤝';
        winnerModal.classList.add('show');
    }, 500);

    statusElement.textContent = '🤝 เกมเสมอ!';
}

// Switch Player
function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
}

// Update Status
function updateStatus() {
    statusElement.innerHTML = `ตาของผู้เล่น <span class="player-${gameState.currentPlayer.toLowerCase()}">${gameState.currentPlayer}</span>`;
}

// Update Scores
function updateScores() {
    scoreX.textContent = gameState.scores.X;
    scoreO.textContent = gameState.scores.O;

    // Animate score change
    const scoreElement = gameState.currentPlayer === 'X' ? scoreX : scoreO;
    scoreElement.style.transform = 'scale(1.5)';
    setTimeout(() => {
        scoreElement.style.transform = '';
    }, 300);
}

// Reset Game
function resetGame() {
    // Reset state
    gameState.board = ['', '', '', '', '', '', '', '', ''];
    gameState.currentPlayer = 'X';
    gameState.isGameOver = false;

    // Reset cells with animation
    cells.forEach((cell, index) => {
        setTimeout(() => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'taken', 'win');
            cell.style.transform = 'scale(0)';
            requestAnimationFrame(() => {
                cell.style.transform = '';
            });
        }, index * 50);
    });

    updateStatus();
}

// Start the game!
init();
