import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Colors as per requirement.
 */
const COLORS = {
  primary: "#1976d2",
  accent: "#ffab00",
  secondary: "#424242",
  background: "#fff",
  boardBase: "#F7F9FB",
  cell: "#e3eaf3",
  winHighlight: "#ffab00",
  outline: "#1976d2"
};

const PLAYER_X = "X";
const PLAYER_O = "O";
const GAME_SIZE = 3; // 3x3x3

/**
 * Generates an empty 3x3x3 board.
 * @returns {string[][][]} Empty board (filled with "")
 */
function getEmptyBoard() {
  return Array(GAME_SIZE)
    .fill()
    .map(() =>
      Array(GAME_SIZE)
        .fill()
        .map(() => Array(GAME_SIZE).fill(""))
    );
}

/**
 * All 3D win line patterns on a 3x3x3 board.
 */
function getAllWinLines() {
  const lines = [];

  // Straight lines (x, y, or z axis aligned)
  for (let i = 0; i < GAME_SIZE; i++) {
    for (let j = 0; j < GAME_SIZE; j++) {
      // Along z (vertical in layer)
      lines.push([
        [i, j, 0],
        [i, j, 1],
        [i, j, 2],
      ]);
      // Along y (row in all layers)
      lines.push([
        [i, 0, j],
        [i, 1, j],
        [i, 2, j],
      ]);
      // Along x (col in all layers)
      lines.push([
        [0, i, j],
        [1, i, j],
        [2, i, j],
      ]);
    }
  }

  // Diagonals in each of the 3-layer directions
  for (let i = 0; i < GAME_SIZE; i++) {
    // Diags in xy, fixed z
    lines.push([
      [0, 0, i],
      [1, 1, i],
      [2, 2, i],
    ]);
    lines.push([
      [2, 0, i],
      [1, 1, i],
      [0, 2, i],
    ]);
    // Diags in xz, fixed y
    lines.push([
      [0, i, 0],
      [1, i, 1],
      [2, i, 2],
    ]);
    lines.push([
      [2, i, 0],
      [1, i, 1],
      [0, i, 2],
    ]);
    // Diags in yz, fixed x
    lines.push([
      [i, 0, 0],
      [i, 1, 1],
      [i, 2, 2],
    ]);
    lines.push([
      [i, 2, 0],
      [i, 1, 1],
      [i, 0, 2],
    ]);
  }

  // Four main body diagonals (corner to opposite corner through 3D)
  lines.push([
    [0, 0, 0],
    [1, 1, 1],
    [2, 2, 2],
  ]);
  lines.push([
    [2, 0, 0],
    [1, 1, 1],
    [0, 2, 2],
  ]);
  lines.push([
    [0, 2, 0],
    [1, 1, 1],
    [2, 0, 2],
  ]);
  lines.push([
    [2, 2, 0],
    [1, 1, 1],
    [0, 0, 2],
  ]);

  return lines;
}
const WIN_LINES = getAllWinLines();

/**
 * Checks the board for a win.
 * @returns {null|{player:string, line:number[][]}} winning player and line if found, else null
 */
function checkWin(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    const va = board[a[0]][a[1]][a[2]];
    const vb = board[b[0]][b[1]][b[2]];
    const vc = board[c[0]][c[1]][c[2]];
    if (va && va === vb && vb === vc) {
      return { player: va, line };
    }
  }
  return null;
}

/**
 * Checks if the board is full (for draw).
 */
function isFull(board) {
  for (let x = 0; x < GAME_SIZE; x++) {
    for (let y = 0; y < GAME_SIZE; y++) {
      for (let z = 0; z < GAME_SIZE; z++) {
        if (!board[x][y][z]) return false;
      }
    }
  }
  return true;
}

/**
 * Returns a deep clone of a 3D array.
 */
function deepCloneBoard(board) {
  return board.map((plane) => plane.map((row) => row.slice()));
}

// PUBLIC_INTERFACE
function App() {
  // Player to start (selection)
  const [startingPlayer, setStartingPlayer] = useState(PLAYER_X);
  // Current player to move
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_X);
  // Game board state
  const [board, setBoard] = useState(getEmptyBoard());
  // Game status
  const [winner, setWinner] = useState(null); // {player, line} or null
  const [draw, setDraw] = useState(false);

  // On new game, reset board and set current player to startingPlayer
  const startNewGame = (nextStart) => {
    setBoard(getEmptyBoard());
    setWinner(null);
    setDraw(false);
    setCurrentPlayer(nextStart);
  };

  // Handler for selecting starter
  const handleStarterChange = (player) => {
    setStartingPlayer(player);
    startNewGame(player);
  };

  // Game move handler
  const handleCellClick = (x, y, z) => {
    if (winner || draw) return;
    if (board[x][y][z] !== "") return; // Occupied

    const newBoard = deepCloneBoard(board);
    newBoard[x][y][z] = currentPlayer;

    const win = checkWin(newBoard);
    const boardFull = isFull(newBoard);

    setBoard(newBoard);

    if (win) {
      setWinner(win);
    } else if (boardFull) {
      setDraw(true);
    } else {
      setCurrentPlayer(currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X);
    }
  };

  // For "Reset" button
  const handleReset = () => {
    startNewGame(startingPlayer);
  };

  // Optionally, auto-reset current player for starter
  useEffect(() => {
    setCurrentPlayer(startingPlayer);
  }, [startingPlayer]);

  // For accessibility: can tab and press enter to move
  const handleCellKeyDown = (e, x, y, z) => {
    if (e.key === " " || e.key === "Enter") {
      handleCellClick(x, y, z);
    }
  };

  // Styling: highlight winning cells
  const isCellWinning = (x, y, z) => {
    if (!winner) return false;
    return winner.line.some(([ix, iy, iz]) => ix === x && iy === y && iz === z);
  };

  // For responsive size
  const [boardSize, setBoardSize] = useState(400);
  useEffect(() => {
    const resize = () => {
      const size = Math.min(window.innerWidth, window.innerHeight, 420) - 36;
      setBoardSize(size < 280 ? 260 : size);
    };
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Theme variables, injected inline to override App.css defaults
  useEffect(() => {
    document.body.style.setProperty("--primary", COLORS.primary);
    document.body.style.setProperty("--accent", COLORS.accent);
    document.body.style.setProperty("--secondary", COLORS.secondary);
    document.body.style.setProperty("--bg-main", COLORS.background);
  }, []);

  return (
    <div className="App" style={{ minHeight: "100vh", background: COLORS.background }}>
      <header className="ttt3d-header" style={{ marginTop: "38px" }}>
        <h1 className="ttt3d-title" style={{
          color: COLORS.primary,
          letterSpacing: ".03em",
          textShadow: "0px 1px 3px #0001"
        }}>
          3D Tic Tac Toe
        </h1>
      </header>
      <main>
        <section className="ttt3d-game-center">
          <TicTacToe3DBoard
            board={board}
            winner={winner}
            draw={draw}
            onCellClick={handleCellClick}
            currentPlayer={currentPlayer}
            boardSize={boardSize}
            isCellWinning={isCellWinning}
            handleCellKeyDown={handleCellKeyDown}
            colors={COLORS}
          />
        </section>
        <section className="ttt3d-controls">
          <div className="ttt3d-status">
            {winner ? (
              <span style={{
                color: COLORS.accent,
                fontWeight: 600,
                fontSize: "1.2rem"
              }}>
                {winner.player} wins!
              </span>
            ) : draw ? (
              <span style={{
                color: COLORS.secondary,
                fontWeight: 600,
                fontSize: "1.12rem"
              }}>It's a draw!</span>
            ) : (
              <span>
                Current turn: <strong style={{
                  color: currentPlayer === PLAYER_X ? COLORS.primary : COLORS.accent
                }}>{currentPlayer}</strong>
              </span>
            )}
          </div>
          <div className="ttt3d-btn-row">
            <button
              className="ttt3d-btn"
              onClick={handleReset}
              style={{
                backgroundColor: COLORS.primary,
                color: "#fff",
                minWidth: 84
              }}
              aria-label="Reset game"
            >
              Reset
            </button>
            <div className="ttt3d-player-select-group">
              <span style={{ fontSize: 14, marginRight: 6 }}>
                Start as:
              </span>
              <button
                className={`ttt3d-btn ttt3d-btn-x ${startingPlayer === PLAYER_X ? "active" : ""}`}
                onClick={() => handleStarterChange(PLAYER_X)}
                style={{
                  background: startingPlayer === PLAYER_X ? COLORS.primary : "#f1f5fc",
                  color: startingPlayer === PLAYER_X ? "#fff" : COLORS.primary,
                  borderColor: COLORS.primary
                }}
                aria-label="Player X starts"
              >X</button>
              <button
                className={`ttt3d-btn ttt3d-btn-o ${startingPlayer === PLAYER_O ? "active" : ""}`}
                onClick={() => handleStarterChange(PLAYER_O)}
                style={{
                  background: startingPlayer === PLAYER_O ? COLORS.accent : "#fff9ee",
                  color: startingPlayer === PLAYER_O ? "#fff" : COLORS.accent,
                  borderColor: COLORS.accent
                }}
                aria-label="Player O starts"
              >O</button>
            </div>
          </div>
        </section>
      </main>
      <footer className="ttt3d-footer">
        <p style={{
          fontSize: "0.95em",
          color: "#888",
          opacity: 0.77,
          margin: 0,
          padding: "12px"
        }}>Modern 3D Tic Tac Toe | &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

/**
 * 3D Tic Tac Toe Board with interactive "pseudo-3D" look. 
 * Each layer is rendered at an offset for visual depth.
 */
// PUBLIC_INTERFACE
function TicTacToe3DBoard({
  board,
  winner,
  draw,
  onCellClick,
  currentPlayer,
  boardSize,
  isCellWinning,
  handleCellKeyDown,
  colors
}) {
  // 3 layers stacked in depth, render "front" first (z = 0), "back" last (z = 2)
  const LAYERS = [0, 1, 2];
  // Layer offsets for modern 3D effect (stronger offsets for depth)
  const LAYER_OFFSETS = [
    { left: 0, top: 0, shadow: "0 7px 28px #1976d240, 0 2px 16px #bfc7db33" },    // z=0 (front/top)
    { left: 38, top: 34, shadow: "0 6px 12px #ffab0050, 0 2px 20px #bfc7db29" },  // z=1 (middle)
    { left: 74, top: 68, shadow: "0 0px 0px #0000" }                              // z=2 (back)
  ];
  const cellSize = Math.floor((boardSize - 80) / 3);

  // Only empty & valid cells should be clickable!
  const isCellClickable = (x, y, z) => !winner && !draw && board[x][y][z] === "";

  return (
    <div className="ttt3d-board-wrapper"
      style={{
        width: boardSize + 54,
        height: boardSize * 0.77 + 90,
        margin: "0 auto",
        position: "relative",
        perspective: 950,
        perspectiveOrigin: "57% 72px"
      }}>
      {LAYERS.slice(0).reverse().map((z) => (
        <div
          key={z}
          className="ttt3d-board-layer"
          style={{
            position: "absolute",
            top: LAYER_OFFSETS[z].top,
            left: LAYER_OFFSETS[z].left,
            boxShadow: LAYER_OFFSETS[z].shadow,
            zIndex: 10 + (2 - z),
            borderRadius: 21 - z * 5,
            transform: `scale(${1 - z * 0.09}) rotateY(${z * 7}deg) rotateX(${z * (window.innerWidth < 520 ? 2 : 4)}deg)`,
            background: `linear-gradient(158deg, ${colors.boardBase} 85%, #fff4c6 97%, #F7F9FB 100%)`,
            border: `2.6px solid ${colors.outline}`,
            width: cellSize * 3 + 18,
            height: cellSize * 3 + 18,
            opacity: z === 2 ? 0.925 : z === 1 ? 0.97 : 1,
            filter: z === 2 ? "brightness(0.99) blur(.5px)" : z === 1 ? "brightness(.99)" : undefined,
            transition: "background 0.2s, border 0.2s"
          }}
        >
          {board.map((layer, x) =>
            layer.map((row, y) =>
              z < 3 ? (
                <React.Fragment key={`${x}-${y}-${z}`}>
                  <BoardCell
                    x={x}
                    y={y}
                    z={z}
                    mark={board[x][y][z]}
                    disabled={!isCellClickable(x, y, z)}
                    // only handle true click for empty cells!
                    onClick={isCellClickable(x, y, z) ? onCellClick : () => {}}
                    highlight={isCellWinning(x, y, z)}
                    tabIndex={z === 0 && isCellClickable(x, y, z) ? 0 : -1}
                    cellSize={cellSize}
                    currentPlayer={currentPlayer}
                    handleCellKeyDown={isCellClickable(x, y, z)
                      ? handleCellKeyDown
                      : () => {}}
                    colors={colors}
                  />
                </React.Fragment>
              ) : null
            )
          )}
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function BoardCell({
  x,
  y,
  z,
  mark,
  disabled,
  onClick,
  highlight,
  tabIndex,
  cellSize,
  currentPlayer,
  handleCellKeyDown,
  colors
}) {
  // 3D projection for cells: each layer is shifted
  const LAYER_OFFSETS = [
    { left: 0, top: 0 },
    { left: 38, top: 34 },
    { left: 74, top: 68 }
  ];
  const offset = LAYER_OFFSETS[z];

  const left = 6 + y * cellSize;
  const top = 6 + x * cellSize;

  let markColor =
    mark === "X"
      ? colors.primary
      : mark === "O"
      ? colors.accent
      : undefined;

  const cellBG = highlight
    ? colors.winHighlight
    : !mark && !disabled
    ? "#f8fbff"
    : mark
    ? "#e3eaf3"
    : "#e5e5e5";

  const cellBorder = highlight
    ? `2.3px solid ${colors.winHighlight}`
    : !mark && !disabled
    ? `2.1px solid ${colors.primary}bb`
    : mark
    ? "2px solid #CDDDF7"
    : "2px solid #bfc7db60";

  return (
    <button
      className="ttt3d-cell"
      type="button"
      tabIndex={tabIndex}
      aria-label={`cell (${x + 1},${y + 1},${z + 1})` + (mark ? `, ${mark}` : "")}
      onClick={() => (disabled ? undefined : onClick(x, y, z))}
      onKeyDown={e => (disabled ? undefined : handleCellKeyDown(e, x, y, z))}
      style={{
        position: "absolute",
        left: offset.left + left,
        top: offset.top + top,
        width: cellSize - 10,
        height: cellSize - 10,
        background: cellBG,
        color: highlight ? "#fff" : markColor || "#b2b7bb",
        border: cellBorder,
        borderRadius: 13,
        boxShadow: highlight
          ? "0 0 16px #ffab0075"
          : !mark && !disabled
          ? "0 2px 13px #1976d22e, 0 1px 4px #0001"
          : "0 1px 3px #0001",
        opacity: disabled && !highlight ? 0.65 : 1,
        fontSize: Math.max(29, Math.floor(cellSize / 1.21)),
        fontWeight: "bold",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        pointerEvents: disabled ? "none" : "auto",
        zIndex: 20 + z * 2 + (highlight ? 1 : 0),
        outline: "none",
        userSelect: "none",
        transition: "all 0.17s cubic-bezier(.76,.09,.45,.98)"
      }}
      disabled={disabled}
    >
      {mark && (
        <span
          style={{
            textShadow:
              highlight
                ? "0 5px 19px #fff7, 0 1px 3px #ffab0035"
                : "0 2px 7px #0002, 0 1px 2px #ffab0011",
            fontSize: "1em",
            letterSpacing: ".01em"
          }}
        >
          {mark}
        </span>
      )}
    </button>
  );
}

export default App;
