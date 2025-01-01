// Initialize variables
let currentPlayer = 'red';  // Red starts
let board = Array(6).fill().map(() => Array(7).fill(null));  // Create a 6x7 grid
let gameOver = false;
let isAI = false;  // Determines if the current game is against AI
let difficulty = 'easy';  // Default difficulty

// Create the board on the screen
function createBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = ''; // Clear previous board if any

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
}

// Handle a click on a cell
function handleCellClick(event) {
    if (gameOver || (isAI && currentPlayer === 'yellow')) return;  // Block click during AI's turn

    const col = event.target.dataset.col;
    const row = getAvailableRow(col);

    if (row !== -1) {
        // Place the disc
        board[row][col] = currentPlayer;
        updateBoard();

        // Check for win
        if (checkWin(row, col)) {
            document.getElementById('turn').textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} wins!`;
            gameOver = true;
            return;
        }

        // Change turn
        currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';
        document.getElementById('turn').textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;

        // If AI's turn, simulate AI move with a cooldown
        if (isAI && currentPlayer === 'yellow') {
            aiMove();
        }
    }
}

// Get the lowest available row in a column
function getAvailableRow(col) {
    for (let row = 5; row >= 0; row--) {
        if (!board[row][col]) {
            return row;
        }
    }
    return -1;  // Column is full
}

// Update the board display
function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        const player = board[row][col];

        if (player) {
            cell.classList.add(player);
        } else {
            cell.classList.remove('red', 'yellow');
        }
    });
}

// Check if the current move is a winning move
function checkWin(row, col) {
    return checkDirection(row, col, 1, 0) ||  // Horizontal
           checkDirection(row, col, 0, 1) ||  // Vertical
           checkDirection(row, col, 1, 1) ||  // Diagonal \
           checkDirection(row, col, 1, -1);   // Diagonal /
}

// Check a specific direction for a win
function checkDirection(row, col, rowDir, colDir) {
    let count = 1;

    // Check in both directions (positive and negative)
    for (let i = 1; i <= 3; i++) {
        const r = row + i * rowDir;
        const c = col + i * colDir;
        if (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === currentPlayer) {
            count++;
        } else {
            break;
        }
    }

    for (let i = 1; i <= 3; i++) {
        const r = row - i * rowDir;
        const c = col - i * colDir;
        if (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === currentPlayer) {
            count++;
        } else {
            break;
        }
    }

    return count >= 4;
}

// AI's move (based on difficulty)
function aiMove() {
    console.log("AI is thinking...");

    // Display "AI is thinking..." message
    document.getElementById('turn').textContent = "AI is thinking...";

    // Wait 1.5 seconds before making a move
    setTimeout(() => {
        let availableColumns = [];
        for (let col = 0; col < 7; col++) {
            if (getAvailableRow(col) !== -1) {
                availableColumns.push(col);
            }
        }

        let aiCol = null;

        // Easy AI: Random column
        if (difficulty === 'easy') {
            aiCol = availableColumns[Math.floor(Math.random() * availableColumns.length)];
        }

        // Medium AI: Try to block if necessary
        else if (difficulty === 'medium') {
            aiCol = mediumAI(availableColumns);
        }

        // Hard AI: Block the player from winning and try to win
        else if (difficulty === 'hard') {
            aiCol = hardAI(availableColumns);
        }

        // Log AI's decision
        console.log(`AI chose column ${aiCol}`);

        const row = getAvailableRow(aiCol);
        board[row][aiCol] = 'yellow';
        updateBoard();

        if (checkWin(row, aiCol)) {
            document.getElementById('turn').textContent = "AI wins!";
            gameOver = true;
            return;
        }

        // Change turn back to player
        currentPlayer = 'red';
        document.getElementById('turn').textContent = "Player's Turn (Red)";
    }, 1500);  // 1.5-second delay
}

// Medium AI: Blocks winning move but also allows player to win some
function mediumAI(availableColumns) {
    // Try to block if the player is about to win
    for (let col of availableColumns) {
        const row = getAvailableRow(col);
        if (row !== -1) {
            board[row][col] = 'red';
            if (checkWin(row, col)) {
                board[row][col] = null;
                return col;
            }
            board[row][col] = null;
        }
    }
    return availableColumns[Math.floor(Math.random() * availableColumns.length)];
}

// Hard AI: Blocks the player from winning and tries to win
function hardAI(availableColumns) {
    for (let col of availableColumns) {
        const row = getAvailableRow(col);
        if (row !== -1) {
            board[row][col] = 'yellow';
            if (checkWin(row, col)) {
                return col;
            }
            board[row][col] = null;
        }
    }

    // Block the player's winning move
    for (let col of availableColumns) {
        const row = getAvailableRow(col);
        if (row !== -1) {
            board[row][col] = 'red';
            if (checkWin(row, col)) {
                board[row][col] = null;
                return col;
            }
            board[row][col] = null;
        }
    }

    // Pick random move if no immediate threat
    return availableColumns[Math.floor(Math.random() * availableColumns.length)];
}

// Restart the game
function restartGame() {
    board = Array(6).fill().map(() => Array(7).fill(null));
    currentPlayer = 'red';
    gameOver = false;
    document.getElementById('turn').textContent = "Player 1's Turn (Red)";
    createBoard();
}

// Select the game mode
function selectGameMode(mode) {
    isAI = (mode === 'ai');
    document.getElementById('game-mode').style.display = 'none';
    document.getElementById('difficulty-level').style.display = 'block';
}

// Set the difficulty level
function setDifficulty(level) {
    difficulty = level;
    document.getElementById('difficulty-level').style.display = 'none';
    createBoard();
}

// Initialize the game
createBoard();
