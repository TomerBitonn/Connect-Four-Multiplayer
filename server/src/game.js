// "Connect Four" game Logic made by Tomer Biton

const games = {}; // {'game_code' : 'game_status', ...}

// Creates a 6*7 game board
function createEmptyBoard() {
  const rows = 6;
  const cols = 7;
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

// Creates new game using game code and empty game board
function createGame(code) {
  games[code] = {
    code,
    board: createEmptyBoard(),
    currentTurn: 1,
    players: 1,
    status: "WAITING",
    winner: 0
  };

  return games[code];
}

// Searching for a game with the game code, and if it is possible (less than 2 players) you join the game
function joinGame(code) {
  const game = games[code];
  if (!game) return null;
  if (game.players >= 2) return null;

  game.players++;
  game.status = "ACTIVE";
  return game;
}

function getState(code) {
  return games[code] || null;
}

function findAvailableRow(board, column) {
    let j = column;
    for(let i = board.length - 1; i >= 0; i--) {
        if(board[i][j] == 0) {
            return i;
        }
    }
    return -1;
}

// Checks if there is a Winner
function checkWin(board, row, col, player) {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]; // [row, column]

    for(let [i, j] of directions) {
        let count = 1;

        // num of rows (H) = 6, num of cols (W) = 7
        const H = board.length;
        const W = board[0].length;

        // Forward check
        let r = row + i;
        let c = col + j;
        while(r >= 0 && r < H && c >= 0 && c < W && board[r][c] == player) {
            count++;
            r += i;
            c += j;
        }

        // Backward check
        r = row - i;
        c = col - j;
        while(r >= 0 && r < H && c >= 0 && c < W && board[r][c] == player) {
            count++;
            r -= i;
            c -= j;
        }

        // 4 in a row...
        if(count >= 4) return true;
    }

    return false;
}

function isBoardFull(board) {
    for(let j = 0; j < board[0].length; j++) {
        if(board[0][j] == 0) {
            return false;
        }
    }

    return true;
}

function makeMove(code, player, column) {
    const game = games[code];
    if(!game) return null;

    if(game.status != 'ACTIVE') return null;
    if(player != game.currentTurn) return null;
    if(column < 0 || column > 6) return null;

    const row = findAvailableRow(game.board,column);
    if(row == -1) return null; // The row is full
    game.board[row][column] = player;

    // Winner check
    if(checkWin(game.board, row, column, player)) {
        game.status = "OVER";
        game.winner = player;
        return game;
    }

    // Draw check
    if(isBoardFull(game.board)) {
        game.status = 'OVER';
        game.winner = 0;
        return game;
    }

    let playerTurn = (player == 1 ? 2 : 1);
    game.currentTurn = playerTurn;
    return game;
}

module.exports = { createEmptyBoard, createGame, joinGame, getState, findAvailableRow, checkWin, isBoardFull, makeMove };
