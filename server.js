const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the public directory
app.use(express.static('public'));

// Game state
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';

// Function to check for a winning condition
function checkWinner(board, player) {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    return winConditions.some((condition) =>
        condition.every((index) => board[index] === player)
    );
}

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Emit the current game board to the newly connected user
    socket.emit('updateBoard', gameBoard);

    // Handle player moves
    socket.on('move', (position) => {
        if (gameBoard[position] === '' && currentPlayer === 'X') {
            gameBoard[position] = 'X';
            if (checkWinner(gameBoard, 'X')) {
                io.emit('gameOver', 'X');
            } else {
                currentPlayer = 'O';
                io.emit('updateBoard', gameBoard);
            }
        } else if (gameBoard[position] === '' && currentPlayer === 'O') {
            gameBoard[position] = 'O';
            if (checkWinner(gameBoard, 'O')) {
                io.emit('gameOver', 'O');
            } else {
                currentPlayer = 'X';
                io.emit('updateBoard', gameBoard);
            }
        }
    });

    // Handle game reset
    socket.on('resetGame', () => {
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        io.emit('updateBoard', gameBoard);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});