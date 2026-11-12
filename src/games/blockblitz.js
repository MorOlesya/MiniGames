const SHAPES = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [[1, 1, 1, 1, 1]],
  [[1], [1], [1], [1], [1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],
  [
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [1, 1],
  ],
  [
    [1, 1],
    [1, 0],
  ],
  [
    [1, 1],
    [0, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
];
const COLORS = ["#ff6b6b", "#4ecdc4", "#ffe66d", "#a8e6cf", "#ff8b94", "#c7ceea", "#ffd3b6", "#b4a7d6"];

export function mount(root, onBack) {
  const SIZE = 8;
  let grid, pieces, selected, score, gameOver;

  root.innerHTML = `
    <header class="game-header">
      <button class="back-btn" title="Назад">←</button>
      <h2>Блок Бласт</h2>
      <button class="icon-btn" id="bb-restart" title="Новая игра">↻</button>
    </header>
    <div class="bb-wrap">
      <div class="bb-top">
        <div class="score-box"><span>Счёт</span><strong id="bb-score">0</strong></div>
        <div class="score-box"><span>Рекорд</span><strong id="bb-best">0</strong></div>
      </div>
      <div class="bb-board" id="bb-board"></div>
      <div class="bb-tray" id="bb-tray"></div>
    </div>
  `;

  const boardEl = root.querySelector("#bb-board");
  const trayEl = root.querySelector("#bb-tray");
  const scoreEl = root.querySelector("#bb-score");
  const bestEl = root.querySelector("#bb-best");

  bestEl.textContent = Number(localStorage.getItem("bb_best")) || 0;

  function newPiece() {
    return {
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function refillTray() {
    pieces = [newPiece(), newPiece(), newPiece()];
  }

  function reset() {
    grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    score = 0;
    gameOver = false;
    selected = null;
    refillTray();
    render();
  }

  function canPlace(shape, r, c) {
    for (let sr = 0; sr < shape.length; sr++)
      for (let sc = 0; sc < shape[sr].length; sc++) {
        if (!shape[sr][sc]) continue;
        const br = r + sr,
          bc = c + sc;
        if (br >= SIZE || bc >= SIZE) return false;
        if (grid[br][bc]) return false;
      }
    return true;
  }

  function anyPieceFits() {
    for (const p of pieces) {
      if (!p) continue;
      for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (canPlace(p.shape, r, c)) return true;
    }
    return false;
  }

  function clearLines() {
    const fullRows = [],
      fullCols = [];
    for (let r = 0; r < SIZE; r++) if (grid[r].every((v) => v)) fullRows.push(r);
    for (let c = 0; c < SIZE; c++) {
      let full = true;
      for (let r = 0; r < SIZE; r++)
        if (!grid[r][c]) {
          full = false;
          break;
        }
      if (full) fullCols.push(c);
    }
    for (const r of fullRows) for (let c = 0; c < SIZE; c++) grid[r][c] = null;
    for (const c of fullCols) for (let r = 0; r < SIZE; r++) grid[r][c] = null;
    const cleared = fullRows.length + fullCols.length;
    if (cleared) score += cleared * 10;
  }

  function place(idx, r, c) {
    if (gameOver) return;
    const p = pieces[idx];
    if (!p || !canPlace(p.shape, r, c)) return;
    let placed = 0;
    for (let sr = 0; sr < p.shape.length; sr++)
      for (let sc = 0; sc < p.shape[sr].length; sc++) {
        if (p.shape[sr][sc]) {
          grid[r + sr][c + sc] = p.color;
          placed++;
        }
      }
    score += placed;
    pieces[idx] = null;
    clearLines();
    if (pieces.every((p) => !p)) refillTray();
    if (!anyPieceFits()) {
      gameOver = true;
      const b = Number(localStorage.getItem("bb_best")) || 0;
      if (score > b) {
        localStorage.setItem("bb_best", score);
        bestEl.textContent = score;
      }
    }
    selected = null;
    scoreEl.textContent = score;
    render();
  }

  function render() {
    boardEl.innerHTML = "";
    boardEl.style.gridTemplateColumns = `repeat(${SIZE}, 1fr)`;
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement("div");
        cell.className = "bb-cell";
        if (grid[r][c]) {
          cell.style.background = grid[r][c];
          cell.classList.add("filled");
        }
        cell.addEventListener("click", () => {
          if (selected !== null) place(selected, r, c);
        });
        cell.addEventListener("mouseenter", () => showPreview(r, c));
        cell.addEventListener("mouseleave", clearPreview);
        boardEl.appendChild(cell);
      }

    trayEl.innerHTML = "";
    pieces.forEach((p, i) => {
      const el = document.createElement("button");
      el.className = "bb-piece";
      if (!p) {
        el.classList.add("used");
      } else {
        if (selected === i) el.classList.add("selected");
        el.style.gridTemplateColumns = `repeat(${p.shape[0].length}, 12px)`;
        for (let r = 0; r < p.shape.length; r++)
          for (let c = 0; c < p.shape[r].length; c++) {
            const cell = document.createElement("div");
            cell.className = "bb-piece-cell";
            cell.style.background = p.shape[r][c] ? p.color : "transparent";
            el.appendChild(cell);
          }
        el.addEventListener("click", () => {
          selected = selected === i ? null : i;
          render();
        });
      }
      trayEl.appendChild(el);
    });

    if (gameOver) {
      const o = document.createElement("div");
      o.className = "bb-gameover";
      o.textContent = "GAME OVER";
      boardEl.appendChild(o);
    }
  }

  function showPreview(r, c) {
    if (selected === null) return;
    const p = pieces[selected];
    if (!p || !canPlace(p.shape, r, c)) return;
    const cells = boardEl.querySelectorAll(".bb-cell");
    for (let sr = 0; sr < p.shape.length; sr++)
      for (let sc = 0; sc < p.shape[sr].length; sc++) {
        if (p.shape[sr][sc]) cells[(r + sr) * SIZE + (c + sc)].classList.add("preview");
      }
  }

  function clearPreview() {
    boardEl.querySelectorAll(".bb-cell.preview").forEach((el) => el.classList.remove("preview"));
  }

  root.querySelector("#bb-restart").addEventListener("click", reset);
  root.querySelector(".back-btn").addEventListener("click", onBack);

  reset();
  return () => {};
}
