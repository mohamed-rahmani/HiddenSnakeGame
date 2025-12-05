(function () {

/* Images du "serpent" et de la nourriture */    
const imgCarton = new Image();
imgCarton.src = "img/CartonPixel.png";

const ImgPizza = new Image();
ImgPizza.src = "img/PizzaPixel.png";

const sonGameOver = new Audio('son/GameOver.mp3');
sonGameOver.volume = 0.3;

// Récupération des éléments du HTML
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const restartBtn = document.getElementById('restartBtn');
  const finalScoreEl = document.getElementById("finalScore");
  const bestScoreEl = document.getElementById("bestScore");
  const scoreboard = document.getElementById("scoreboard");
  const scoreEl = document.getElementById('score');

  const CELL = 50;
  const COLS = 20;
  const ROWS = 20;

  let snake; // Tableau des segments du serpent
  let dir; // Direction actuelle
  let nextDir; // Prochaine direction
  let food; // Position de la nourriture
  let score = 0; // Score du joueur
  let lastTime = 0; // Dernier timestamp
  let tickInterval = 222; // Vitesse du jeu
  let running = true; // État du jeu

// Redimensionnement du jeu
  function resize() {
    canvas.width = COLS * CELL;
    canvas.height = ROWS * CELL;
  }

// Choix aléatoire d'une cellule
  function randCell() {
    return {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS)
    };
  }

// Placement de la nourriture a l'aide de RandCell
  function placeFood() {
    let f;
    do {
      f = randCell();
    } while (snake.some(s => s.x === f.x && s.y === f.y));
    food = f;
  }

// Initialisation du jeu
  function init() {
    snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    scoreEl.textContent = score;

    placeFood();
    lastTime = 0;
    running = true;

    resize();
    draw();
  }

  // Changement de direction
  function setDirection(newDir) {
    if (newDir.x === -dir.x && newDir.y === -dir.y) return;
    nextDir = newDir;
  }

  // Mise à jour de l'état du jeu
  function step() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    head.x = (head.x + COLS) % COLS;
    head.y = (head.y + ROWS) % ROWS;

    if (snake.slice(1).some(s => s.x === head.x && s.y === head.y)) {
        return gameOver();
    }
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;
      placeFood();
      tickInterval *= 0.95;
      tickInterval = Math.max(tickInterval, 30);
    } else {
      snake.pop();
    }
  }

// Fin du jeu en cas de défaite
  function gameOver() {
  sonGameOver.play();
  running = false;

  let best = localStorage.getItem("bestScore") || 0;
  if (score > best) {
      best = score;
    localStorage.setItem("bestScore", best);
  }
  tickInterval = 222;
  finalScoreEl.textContent = score;
  bestScoreEl.textContent = best;
  scoreboard.style.display = "block";

  sonGameOver.currentTime = 0;
  
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = '32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);

  restartBtn.style.display = 'block';
}

// Réinitialisation du jeu en cas de défaite
function resetGame() {
  restartBtn.style.display = 'none';
  init();
  requestAnimationFrame(loop); 
  scoreboard.style.display = "none";
}

  // Dessin du jeu
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // "Nourriture"
    ctx.drawImage(
        ImgPizza,
        food.x * CELL,
        food.y * CELL,
        CELL,
        CELL
    );

    // "Serpent"
    for (let s of snake) {
        ctx.drawImage(
            imgCarton,
            s.x * CELL,
            s.y * CELL,
            CELL,
            CELL
        );
    }
  }

  // Boucle principale
  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = timestamp - lastTime;

    if (running && delta >= tickInterval) {
      step();
      draw();
      lastTime = timestamp;
    }

    requestAnimationFrame(loop);
  }

// Contrôles clavier
  window.addEventListener('keydown', e => {
  if (['ArrowUp', 'z', 'Z'].includes(e.key)) setDirection({ x: 0, y: -1 });
  if (['ArrowDown', 's', 'S'].includes(e.key)) setDirection({ x: 0, y: 1 });
  if (['ArrowLeft', 'q', 'Q'].includes(e.key)) setDirection({ x: -1, y: 0 });
  if (['ArrowRight', 'd', 'D'].includes(e.key)) setDirection({ x: 1, y: 0 });

  if (e.code === 'Space') {
    running = !running;
    if (running) {
      lastTime = performance.now();
      requestAnimationFrame(loop);
    }
  }
});

  restartBtn.addEventListener('click', resetGame);

  init();
  requestAnimationFrame(loop);
})();
