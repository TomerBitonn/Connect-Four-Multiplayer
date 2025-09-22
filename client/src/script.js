// Global variables
let gameCode = null;
let playerNumber = null;
let currentTurn = null;

// Render the board on screen
function renderBoard(board) {
  const boardDiv = document.getElementById("boardDiv");
  boardDiv.innerHTML = ""; // clear previous board

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (board[i][j] == 1) cell.classList.add("player1");
      if (board[i][j] == 2) cell.classList.add("player2");

      // Add click event for making a move
      cell.addEventListener("click", () => makeMove(j));
      boardDiv.appendChild(cell);
    }
  }
}

// Create new game
async function createGame() {
  const res = await fetch("/create", { method: "POST" });
  const data = await res.json();

  if (data.success) {
    gameCode = data.game.code;
    playerNumber = 1;
    currentTurn = data.game.currentTurn;

    document.getElementById("gameCodeInput").value = gameCode;
    document.getElementById("status").innerText =
      `Game created. Code: ${gameCode}. You are Player 1. Waiting for Player 2...`;

    renderBoard(data.game.board);

    // start polling
    pollState();
  }
}

// Join existing game
async function joinGame() {
  const input = document.getElementById("gameCodeInput").value;
  const res = await fetch(`/join/${input}`, { method: "POST" });
  const data = await res.json();

  if (data.success) {
    gameCode = data.game.code;
    playerNumber = 2;
    currentTurn = data.game.currentTurn;

    document.getElementById("status").innerText =
      `Joined game ${gameCode}. You are Player 2.`;

    renderBoard(data.game.board);

    // start polling
    pollState();
  } else {
    alert(data.message);
  }
}

// Make a move
async function makeMove(column) {
  if (!gameCode) return;
  if (playerNumber !== currentTurn) return; // not your turn

  const res = await fetch(`/move/${gameCode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player: playerNumber, column })
  });
  const data = await res.json();

  if (!data.success) {
    alert(data.message);
  }
}

// Poll game state every 2 seconds (for both players)
async function pollState() {
  if (!gameCode) return;

  const res = await fetch(`/state/${gameCode}`);
  const data = await res.json();

  if (data.success) {
    renderBoard(data.game.board);
    currentTurn = data.game.currentTurn;

    if (data.game.status === "OVER") {
        if (data.game.winner === 0) {
            document.getElementById("status").innerText = "Draw!";
        } 
        else if (data.game.winner === playerNumber) {
            document.getElementById("status").innerText = "You win!";
        } 
        else {
            document.getElementById("status").innerText = "You lose!";
        }
        return; // stop polling
    }

    // Update turn status ONLY if both players joined and game is active
    if (data.game.status === "ACTIVE") {
      document.getElementById("status").innerText =
        currentTurn === playerNumber ? "Your turn" : "Opponent's turn";
    }
  }

  // keep polling
  setTimeout(pollState, 2000);
}
