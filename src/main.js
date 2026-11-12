import "./style.css";

const menuEl = document.getElementById("menu");
const gameEl = document.getElementById("game");
let currentCleanup = null;

// Статические импорты — Vite гарантированно их забандлит и PWA закэширует
const games = {
  minesweeper: () => import("./games/minesweeper.js"),
  tetris: () => import("./games/tetris.js"),
  sudoku: () => import("./games/sudoku.js"),
  blockblitz: () => import("./games/blockblitz.js"),
};

async function showGame(name) {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }
  menuEl.style.display = "none";
  gameEl.style.display = "block";
  gameEl.innerHTML = "";
  try {
    const mod = await games[name]();
    currentCleanup = mod.mount(gameEl, goHome);
  } catch (e) {
    gameEl.innerHTML = `<p style="padding:20px">Ошибка: ${e.message}</p>`;
  }
}

function goHome() {
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }
  gameEl.style.display = "none";
  menuEl.style.display = "block";
}

document.querySelectorAll(".menu-card").forEach((btn) => {
  btn.addEventListener("click", () => showGame(btn.dataset.game));
});
