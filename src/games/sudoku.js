const PUZZLES = [
  {
    p: "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
    s: "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  },
  {
    p: "003020600900305001001806400008102900700000008006708200002609500800203009005010300",
    s: "483921657967345821251876493548132976729564138136798245372689514814253769695417382",
  },
  {
    p: "200080300060070084030500209000105408000000000402706000301007040720040060004010003",
    s: "245981376169273584837564219976125438513498627482736951391657842728349165654812793",
  },
];

export function mount(root, onBack) {
  document.body.classList.add("sudoku-light");

  let board = [],
    given = [],
    solution = [],
    selected = null;

  root.innerHTML = `
    <header class="game-header">
      <button class="back-btn" title="Назад">←</button>
      <h2>Судоку</h2>
      <button class="icon-btn" id="sd-restart" title="Новая игра">↻</button>
    </header>
    <div class="sudoku-wrap">
      <div class="sudoku-board" id="sd-board"></div>
      <div class="sudoku-pad" id="sd-pad"></div>
    </div>
  `;

  const boardEl = root.querySelector("#sd-board");
  const padEl = root.querySelector("#sd-pad");

  function newPuzzle() {
    const pz = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
    board = [];
    given = [];
    solution = [];
    for (let i = 0; i < 81; i++) {
      const v = parseInt(pz.p[i]);
      board.push(v);
      given.push(v !== 0);
      solution.push(parseInt(pz.s[i]));
    }
    selected = null;
    render();
  }

  function render() {
    boardEl.innerHTML = "";
    for (let i = 0; i < 81; i++) {
      const r = Math.floor(i / 9),
        c = i % 9;
      const cell = document.createElement("button");
      cell.className = "sd-cell";
      if (c % 3 === 0 && c !== 0) cell.classList.add("bl");
      if (c === 8) cell.classList.add("br");
      if (r % 3 === 0 && r !== 0) cell.classList.add("bt");
      if (r === 8) cell.classList.add("bb");
      if (given[i]) cell.classList.add("given");
      if (selected && selected.r === r && selected.c === c) cell.classList.add("selected");
      if (board[i] !== 0) {
        cell.textContent = board[i];
        if (!given[i] && board[i] !== solution[i]) cell.classList.add("wrong");
      }
      cell.addEventListener("click", () => {
        selected = { r, c };
        render();
      });
      boardEl.appendChild(cell);
    }

    padEl.innerHTML = "";
    for (let n = 1; n <= 9; n++) {
      const btn = document.createElement("button");
      btn.className = "sd-num";
      btn.textContent = n;
      btn.addEventListener("click", () => place(n));
      padEl.appendChild(btn);
    }
    const erase = document.createElement("button");
    erase.className = "sd-num";
    erase.textContent = "⌫";
    erase.addEventListener("click", () => place(0));
    padEl.appendChild(erase);
  }

  function place(n) {
    if (!selected) return;
    const i = selected.r * 9 + selected.c;
    if (given[i]) return;
    board[i] = n;
    render();
    if (board.every((v, k) => v === solution[k])) {
      setTimeout(() => alert("Победа! 🎉"), 100);
    }
  }

  function onKey(e) {
    if (!selected) return;
    if (e.key >= "1" && e.key <= "9") place(parseInt(e.key));
    if (e.key === "Backspace" || e.key === "Delete") place(0);
  }
  document.addEventListener("keydown", onKey);

  root.querySelector("#sd-restart").addEventListener("click", newPuzzle);
  root.querySelector(".back-btn").addEventListener("click", onBack);

  newPuzzle();
  return () => {
    document.removeEventListener("keydown", onKey);
    document.body.classList.remove("sudoku-light");
  };
}
