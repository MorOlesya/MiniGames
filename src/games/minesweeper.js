const DIFFICULTIES = {
  small: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  large: { rows: 16, cols: 30, mines: 99 },
  pro: { rows: 20, cols: 30, mines: 145 },
};

export function mount(root, onBack) {
  document.body.classList.add("minesweeper-retro");

  let currentDiff = "small";
  let grid = [],
    revealed = [],
    flagged = [];
  let rows = 0,
    cols = 0,
    totalMines = 0;
  let gameOver = false,
    won = false,
    started = false;
  let timer = 0,
    timerId = null;

  // Шапка перестроена: кнопки сложности переехали в одну строку с заголовком и перезапуском
  root.innerHTML = `
    <header class="game-header ms-top-nav">
      <button class="back-btn" title="Назад">←</button>
      <h2>Сапёр</h2>
      <div class="ms-difficulty">
        <button class="ms-diff-btn active" data-diff="small">Мал</button>
        <button class="ms-diff-btn" data-diff="medium">Срд</button>
        <button class="ms-diff-btn" data-diff="large">Бол</button>
        <button class="ms-diff-btn" data-diff="pro">Про</button>
      </div>
      <button class="icon-btn" id="ms-restart" title="Заново">↻</button>
    </header>
    <div class="ms-game-container">
      <div class="ms-board-wrapper">
        <div class="ms-header">
          <div class="ms-counter" id="ms-mines">010</div>
          <button class="ms-face" id="ms-face">🙂</button>
          <div class="ms-counter" id="ms-time">000</div>
        </div>
        <div class="ms-grid" id="ms-grid"></div>
      </div>
    </div>
  `;

  const gridEl = root.querySelector("#ms-grid");
  const minesEl = root.querySelector("#ms-mines");
  const timeEl = root.querySelector("#ms-time");
  const faceEl = root.querySelector("#ms-face");

  function padZero(num, length = 3) {
    let s = Math.abs(num).toString().padStart(length, "0");
    return num < 0 ? "-" + s.slice(1) : s;
  }

  function initGame() {
    const diff = DIFFICULTIES[currentDiff];
    rows = diff.rows;
    cols = diff.cols;
    totalMines = diff.mines;

    grid = Array.from({ length: rows }, () => Array(cols).fill(0));
    revealed = Array.from({ length: rows }, () => Array(cols).fill(false));
    flagged = Array.from({ length: rows }, () => Array(cols).fill(false));

    gameOver = false;
    won = false;
    started = false;
    timer = 0;
    timeEl.textContent = padZero(timer);
    minesEl.textContent = padZero(totalMines);
    faceEl.textContent = "🙂";

    clearInterval(timerId);
    timerId = null;

    render();
  }

  function placeMines(safeR, safeC) {
    let placed = 0;
    while (placed < totalMines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      const isSafeZone = Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1;

      if (grid[r][c] !== -1 && !isSafeZone) {
        grid[r][c] = -1;
        placed++;
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === -1) continue;
        let n = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr,
              nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === -1) n++;
          }
        }
        grid[r][c] = n;
      }
    }
  }

  function startTimer() {
    if (timerId) return;
    timerId = setInterval(() => {
      timer++;
      if (timer > 999) timer = 999;
      timeEl.textContent = padZero(timer);
    }, 1000);
  }

  function render() {
    gridEl.style.gridTemplateColumns = `repeat(${cols}, 22px)`;
    gridEl.innerHTML = "";

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("button");
        cell.className = "ms-cell";

        if (revealed[r][c]) {
          cell.classList.add("revealed");
          if (grid[r][c] === -1) {
            cell.classList.add("mine");
            cell.textContent = "💣";
          } else if (grid[r][c] > 0) {
            cell.textContent = grid[r][c];
            cell.dataset.num = grid[r][c];
          }
        } else if (flagged[r][c]) {
          cell.textContent = "🚩";
        }

        bindCellEvents(cell, r, c);
        gridEl.appendChild(cell);
      }
    }
  }

  function bindCellEvents(cell, r, c) {
    let pressTimer;
    let isLongPress = false;

    cell.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      if (gameOver || won) return;
      faceEl.textContent = "😮";
    });

    cell.addEventListener("mouseup", (e) => {
      if (e.button !== 0) return;
      if (gameOver || won) return;
      faceEl.textContent = "🙂";
    });

    cell.addEventListener("mouseleave", () => {
      if (gameOver || won) return;
      faceEl.textContent = "🙂";
    });

    cell.addEventListener("click", (e) => {
      if (isLongPress) {
        isLongPress = false;
        return;
      }
      handleLeftClick(r, c);
    });

    cell.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      handleRightClick(r, c);
    });

    cell.addEventListener(
      "touchstart",
      (e) => {
        isLongPress = false;
        pressTimer = setTimeout(() => {
          isLongPress = true;
          handleRightClick(r, c);
          if (navigator.vibrate) navigator.vibrate(50);
        }, 400);
      },
      { passive: true },
    );

    cell.addEventListener("touchend", () => clearTimeout(pressTimer));
    cell.addEventListener("touchmove", () => clearTimeout(pressTimer));
  }

  function handleLeftClick(r, c) {
    if (gameOver || won || flagged[r][c]) return;

    if (!started) {
      started = true;
      placeMines(r, c);
      startTimer();
    }

    if (revealed[r][c]) return;

    if (grid[r][c] === -1) {
      gameOver = true;
      clearInterval(timerId);
      faceEl.textContent = "😵";

      for (let rr = 0; rr < rows; rr++) {
        for (let cc = 0; cc < cols; cc++) {
          if (grid[rr][cc] === -1) revealed[rr][cc] = true;
        }
      }
      revealed[r][c] = true;
      render();
      return;
    }

    reveal(r, c);
    render();
    checkWin();
  }

  function handleRightClick(r, c) {
    if (gameOver || won || revealed[r][c]) return;

    flagged[r][c] = !flagged[r][c];
    const flagsCount = flagged.flat().filter(Boolean).length;
    minesEl.textContent = padZero(totalMines - flagsCount);

    const cellIndex = r * cols + c;
    const cellEl = gridEl.children[cellIndex];
    cellEl.textContent = flagged[r][c] ? "🚩" : "";
  }

  function reveal(r, c) {
    if (revealed[r][c] || flagged[r][c]) return;
    revealed[r][c] = true;

    if (grid[r][c] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr,
            nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            reveal(nr, nc);
          }
        }
      }
    }
  }

  function checkWin() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!revealed[r][c] && grid[r][c] !== -1) return;
      }
    }
    won = true;
    clearInterval(timerId);
    faceEl.textContent = "😎";

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === -1) flagged[r][c] = true;
      }
    }
    minesEl.textContent = "000";
    render();
  }

  faceEl.addEventListener("click", initGame);
  root.querySelector("#ms-restart").addEventListener("click", initGame);
  root.querySelector(".back-btn").addEventListener("click", onBack);

  root.querySelectorAll(".ms-diff-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      root.querySelectorAll(".ms-diff-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentDiff = btn.dataset.diff;
      initGame();
    });
  });

  initGame();

  return () => {
    clearInterval(timerId);
    document.body.classList.remove("minesweeper-retro");
  };
}
