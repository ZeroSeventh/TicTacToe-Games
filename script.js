/**
 * 🎮 Tic Tac Toe - Galaxy Edition
 * Premium Game Logic with Unbeatable AI & Mode Switcher
 */

// DOM Elements
const cells = document.querySelectorAll('.cell');
const statusElement = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const winnerModal = document.getElementById('winner-modal');
const winnerText = document.getElementById('winner-text');
const playAgainBtn = document.getElementById('play-again-btn');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const aiModeToggle = document.getElementById('ai-mode-toggle'); // 🆕 ปุ่มสลับโหมด

// Game State
const gameState = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    isGameOver: false,
    scores: { X: 0, O: 0 },
    isVsComputer: true // ค่าเริ่มต้น (จะถูกอัปเดตตามปุ่มสวิตช์)
};

// Winning Combinations
const WIN_PATTERNS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Initialize Game
function init() {
    // Event Listeners for Cells
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    // Event Listeners for Buttons
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', () => {
        winnerModal.classList.remove('show');
        resetGame();
    });

    // 🆕 Event Listener สำหรับสวิตช์เลือกโหมด
    // เมื่อกดสลับโหมด ให้รีเซ็ตเกมทันทีเพื่อเริ่มใหม่ในโหมดนั้น
    if (aiModeToggle) {
        // Sync ค่าเริ่มต้นกับ HTML
        gameState.isVsComputer = aiModeToggle.checked;

        aiModeToggle.addEventListener('change', (e) => {
            gameState.isVsComputer = e.target.checked;
            resetGame(); // รีเซ็ตกระดานเมื่อเปลี่ยนโหมด
        });
    }

    updateStatus();
}

// Handle Cell Click (Main Logic)
function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.dataset.index);

    // 1. ตรวจสอบเงื่อนไขก่อนเดิน
    // ห้ามเดินทับ, ห้ามเดินถ้าจบเกม, ห้ามเดินถ้าเป็นตา AI
    if (gameState.board[index] !== '' || gameState.isGameOver) return;
    if (gameState.isVsComputer && gameState.currentPlayer === 'O') return;

    // 2. คนเดิน (Human Move)
    makeMove(cell, index);

    // 3. ตรวจสอบผลหลังคนเดิน
    if (!checkResultAfterMove()) {
        // ถ้าเกมยังไม่จบ และอยู่ในโหมดบอท -> ถึงตาบอทเดิน
        if (gameState.isVsComputer) {
            // หน่วงเวลาเล็กน้อยให้ดูเป็นธรรมชาติ
            setTimeout(() => {
                if (!gameState.isGameOver) bestMove();
            }, 500);
        }
    }
}

// Make Move (Update UI & State)
function makeMove(cell, index) {
    gameState.board[index] = gameState.currentPlayer;
    cell.textContent = gameState.currentPlayer;
    cell.classList.add(gameState.currentPlayer.toLowerCase(), 'taken');

    // Animation Effect
    cell.style.transform = 'scale(0)';
    requestAnimationFrame(() => {
        cell.style.transform = '';
    });
}

// Helper: Check Result & Switch Turn
function checkResultAfterMove() {
    const winResult = checkWinner();
    
    if (winResult) {
        handleWin(winResult);
        return true; // Game Over
    } else if (checkDraw()) {
        handleDraw();
        return true; // Game Over
    } else {
        switchPlayer();
        return false; // Continue
    }
}

// ==========================================
// 🧠 AI Logic (Minimax Algorithm)
// ==========================================

function bestMove() {
    // AI คือ Player O เสมอ
    let bestScore = -Infinity;
    let move;
    
    // วนลูปหาช่องเดินที่ดีที่สุด
    for (let i = 0; i < 9; i++) {
        if (gameState.board[i] === '') {
            gameState.board[i] = 'O'; // สมมติเดิน
            let score = minimax(gameState.board, 0, false);
            gameState.board[i] = ''; // ย้อนกลับ (Backtrack)
            
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    
    // สั่งให้เดินจริง
    if (move !== undefined) {
        const targetCell = document.querySelector(`.cell[data-index="${move}"]`);
        makeMove(targetCell, move);
        checkResultAfterMove();
    }
}

function minimax(board, depth, isMaximizing) {
    let result = checkWinnerForAI(board);
    if (result !== null) {
        return result;
    }

    if (isMaximizing) { // ตา AI (O) อยากได้คะแนนมากสุด
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else { // ตาคน (X) อยากให้ AI ได้คะแนนน้อยสุด
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Helper: AI Evaluation
function checkWinnerForAI(board) {
    for (const pattern of WIN_PATTERNS) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            if (board[a] === 'O') return 10;
            else if (board[a] === 'X') return -10;
        }
    }
    if (!board.includes('')) return 0; // Draw
    return null; // Not finished
}

// ==========================================
// 🎮 Standard Game Utilities
// ==========================================

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

function checkDraw() {
    return gameState.board.every(cell => cell !== '');
}

function handleWin(result) {
    gameState.isGameOver = true;
    
    // Highlight winning cells
    result.pattern.forEach(index => {
        cells[index].classList.add('win');
    });

    // Update Scores
    gameState.scores[result.winner]++;
    updateScores();

    // Show Modal
    setTimeout(() => {
        winnerText.innerHTML = `🎉 ผู้เล่น <span class="player-${result.winner.toLowerCase()}">${result.winner}</span> ชนะ! 🎉`;
        winnerModal.classList.add('show');
    }, 800);

    statusElement.innerHTML = `🏆 ผู้เล่น <span class="player-${result.winner.toLowerCase()}">${result.winner}</span> ชนะ!`;
}

function handleDraw() {
    gameState.isGameOver = true;
    setTimeout(() => {
        winnerText.textContent = '🤝 เสมอกัน! 🤝';
        winnerModal.classList.add('show');
    }, 500);
    statusElement.textContent = '🤝 เกมเสมอ!';
}

function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
}

function updateStatus() {
    if (gameState.isGameOver) return;

    let playerText = `<span class="player-${gameState.currentPlayer.toLowerCase()}">${gameState.currentPlayer}</span>`;
    
    // ถ้าเล่นกับบอท และเป็นตาบอท ให้ขึ้นข้อความว่ากำลังคิด...
    if (gameState.isVsComputer && gameState.currentPlayer === 'O') {
        statusElement.innerHTML = `🤖 บอทกำลังคิด...`;
    } else {
        statusElement.innerHTML = `ตาของผู้เล่น ${playerText}`;
    }
}

function updateScores() {
    scoreX.textContent = gameState.scores.X;
    scoreO.textContent = gameState.scores.O;

    const scoreElement = gameState.currentPlayer === 'X' ? scoreX : scoreO; // Highlight winner score logic needs adjustment if needed, but this works for now based on last move.
}

function resetGame() {
    gameState.board = ['', '', '', '', '', '', '', '', ''];
    gameState.currentPlayer = 'X';
    gameState.isGameOver = false;

    cells.forEach((cell, index) => {
        setTimeout(() => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'taken', 'win');
            cell.style.transform = 'scale(0)';
            requestAnimationFrame(() => {
                cell.style.transform = '';
            });
        }, index * 30); // เร่งความเร็ว animation ตอนรีเซ็ตนิดหน่อย
    });

    updateStatus();
}

// Start Game
init();