export function mount(root, onBack) {
  const COLS = 10,
    ROWS = 20;
  const SHAPES = {
    I: [[1, 1, 1, 1]],
    O: [
      [1, 1],
      [1, 1],
    ],
    T: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    S: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    J: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    L: [
      [0, 0, 1],
      [1, 1, 1],
    ],
  };
  const COLORS = { I: "#00f0f0", O: "#f0f000", T: "#a000f0", S: "#00f000", Z: "#f00000", J: "#0000f0", L: "#f0a000" };

  let board, piece, px, py, score, lines, level, gameOver, dropInterval, dropTimer, lastTime, rafId;

  root.innerHTML = `
    <header class="game-header">
      <button class="back-btn" title="Назад">←</button>
      <h2>Тетрис</h2>
      <button class="icon-btn" id="t-restart" title="Новая игра">↻</button>
    </header>
    <div class="tetris-wrap">
      <canvas id="tetris-canvas" width="300" height="600"></canvas>
      <div class="tetris-side">
        <div class="score-box"><span>Счёт</span><strong id="t-score">0</strong></div>
        <div class="score-box"><span>Линии</span><strong id="t-lines">0</strong></div>
        <div class="score-box"><span>Уровень</span><strong id="t-level">1</strong></div>
        <div class="score-box"><span>Рекорд</span><strong id="t-best">0</strong></div>
      </div>
    </div>
    <div class="tetris-touch">
      <button data-act="left">◀</button>
      <button data-act="rotate">⟳</button>
      <button data-act="right">▶</button>
      <button data-act="down">▼</button>
      <button data-act="drop">⤓</button>
    </div>
  `;

  const canvas = root.querySelector("#tetris-canvas");
  const ctx = canvas.getContext("2d");
  const CELL = canvas.width / COLS;
  const scoreEl = root.querySelector("#t-score");
  const linesEl = root.querySelector("#t-lines");
  const levelEl = root.querySelector("#t-level");
  const bestEl = root.querySelector("#t-best");

  bestEl.textContent = Number(localStorage.getItem("tetris_best")) || 0;

  function newPiece() {
    const keys = Object.keys(SHAPES);
    const k = keys[Math.floor(Math.random() * keys.length)];
    return { shape: SHAPES[k].map((row) => row.slice()), color: COLORS[k] };
  }

  function reset() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    score = 0;
    lines = 0;
    level = 1;
    gameOver = false;
    dropInterval = 800;
    dropTimer = 0;
    spawnPiece();
    updateUI();
  }

  function spawnPiece() {
    piece = newPiece();
    px = Math.floor((COLS - piece.shape[0].length) / 2);
    py = 0;
    if (collision(px, py, piece.shape)) gameOver = true;
  }

  function collision(x, y, shape) {
    for (let r = 0; r < shape.length; r++)
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const bx = x + c,
          by = y + r;
        if (bx < 0 || bx >= COLS || by >= ROWS) return true;
        if (by >= 0 && board[by][bx]) return true;
      }
    return false;
  }

  function rotateShape(shape) {
    const R = shape.length,
      C = shape[0].length;
    const out = Array.from({ length: C }, () => Array(R).fill(0));
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) out[c][R - 1 - r] = shape[r][c];
    return out;
  }

  function lock() {
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const by = py + r,
            bx = px + c;
          if (by >= 0) board[by][bx] = piece.color;
        }
      }
    clearLines();
    spawnPiece();
    if (gameOver) {
      const b = Number(localStorage.getItem("tetris_best")) || 0;
      if (score > b) localStorage.setItem("tetris_best", score);
    }
  }

  function clearLines() {
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every((v) => v)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++;
        r++;
      }
    }
    if (cleared) {
      lines += cleared;
      score += [0, 100, 300, 500, 800][cleared] * level;
      level = Math.floor(lines / 10) + 1;
      dropInterval = Math.max(100, 800 - (level - 1) * 70);
      updateUI();
    }
  }

  function updateUI() {
    scoreEl.textContent = score;
    linesEl.textContent = lines;
    levelEl.textContent = level;
  }

  function drawCell(c, r, color) {
    ctx.fillStyle = color;
    ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, 3);
  }

  function draw() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(canvas.width, i * CELL);
      ctx.stroke();
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (board[r][c]) drawCell(c, r, board[r][c]);
    if (piece && !gameOver) {
      for (let r = 0; r < piece.shape.length; r++)
        for (let c = 0; c < piece.shape[r].length; c++) if (piece.shape[r][c]) drawCell(px + c, py + r, piece.color);
    }
    if (gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f87171";
      ctx.font = "bold 28px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillStyle = "#fff";
      ctx.font = "16px system-ui";
      ctx.fillText(`Счёт: ${score}`, canvas.width / 2, canvas.height / 2 + 25);
    }
  }

  function tick(now) {
    if (!lastTime) lastTime = now;
    const dt = now - lastTime;
    lastTime = now;
    if (!gameOver) {
      dropTimer += dt;
      if (dropTimer >= dropInterval) {
        dropTimer = 0;
        if (!collision(px, py + 1, piece.shape)) py++;
        else lock();
      }
    }
    draw();
    rafId = requestAnimationFrame(tick);
  }

  function moveLeft() {
    if (!gameOver && !collision(px - 1, py, piece.shape)) px--;
  }
  function moveRight() {
    if (!gameOver && !collision(px + 1, py, piece.shape)) px++;
  }
  function softDrop() {
    if (!gameOver && !collision(px, py + 1, piece.shape)) {
      py++;
      score++;
      updateUI();
    }
  }
  function hardDrop() {
    if (gameOver) return;
    while (!collision(px, py + 1, piece.shape)) {
      py++;
      score += 2;
    }
    updateUI();
    lock();
  }
  function rotatePiece() {
    if (gameOver) return;
    const rot = rotateShape(piece.shape);
    for (const off of [0, -1, 1, -2, 2]) {
      if (!collision(px + off, py, rot)) {
        piece.shape = rot;
        px += off;
        return;
      }
    }
  }

  function onKey(e) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveLeft();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      moveRight();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      softDrop();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      rotatePiece();
    }
    if (e.key === " ") {
      e.preventDefault();
      hardDrop();
    }
  }
  document.addEventListener("keydown", onKey);

  root.querySelectorAll(".tetris-touch button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = btn.dataset.act;
      if (a === "left") moveLeft();
      if (a === "right") moveRight();
      if (a === "down") softDrop();
      if (a === "rotate") rotatePiece();
      if (a === "drop") hardDrop();
    });
  });

  root.querySelector("#t-restart").addEventListener("click", () => {
    cancelAnimationFrame(rafId);
    lastTime = 0;
    reset();
    rafId = requestAnimationFrame(tick);
  });
  root.querySelector(".back-btn").addEventListener("click", onBack);

  reset();
  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    document.removeEventListener("keydown", onKey);
  };
}
