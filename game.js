const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const playerWidth = 20;
const playerHeight = 60;
const speed = 5;
const ballSize = 20;
const goalWidth = 20;
const goalHeight = 300;
const maxBallSpeed = 12;
let keys = {};
let timeLeft = 60;
let gameStarted = false;
let gameEnded = false;

let player1 = { x: 50, y: 220, score: 0 };
let player2 = { x: 830, y: 220, score: 0 };
let ball = { x: 440, y: 240, vx: 3, vy: 2, speedMultiplier: 1 };

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function movePlayers() {
  if (keys["w"] && player1.y > 0) player1.y -= speed;
  if (keys["s"] && player1.y < canvas.height - playerHeight) player1.y += speed;
  if (keys["ArrowUp"] && player2.y > 0) player2.y -= speed;
  if (keys["ArrowDown"] && player2.y < canvas.height - playerHeight) player2.y += speed;
}

function shootBall() {
  if (keys["d"] && isTouching(player1)) {
    increaseBallSpeed();
    ball.vx += 1.5;
  }
  if (keys["l"] && isTouching(player2)) {
    increaseBallSpeed();
    ball.vx -= 1.5;
  }
}

function isTouching(player) {
  return (
    ball.x < player.x + playerWidth + 10 &&
    ball.x + ballSize > player.x &&
    ball.y + ballSize > player.y &&
    ball.y < player.y + playerHeight
  );
}

function increaseBallSpeed() {
  if (ball.speedMultiplier < 2.5) {
    ball.speedMultiplier += 0.1;
  }
}

function moveBall() {
  ball.x += ball.vx * ball.speedMultiplier;
  ball.y += ball.vy * ball.speedMultiplier;

  // Rebater no teto e chão
  if (ball.y <= 0) {
    ball.vy *= -0.15;
    ball.vx *= 0.5;
    ball.y = 0;
  }
  if (ball.y + ballSize >= canvas.height) {
    ball.vy *= -0.15;
    ball.vx *= 0.5;
    ball.y = canvas.height - ballSize;
  }

  // Barreiras atrás do gol — bola perde velocidade
  const behindGoalY = ball.y + ballSize / 2;
  if (ball.x <= 0 && (behindGoalY < canvas.height / 2 - goalHeight / 2 || behindGoalY > canvas.height / 2 + goalHeight / 2)) {
    ball.vx *= -0.5;
    ball.vy *= 0.5;
    ball.x = 1;
  }
  if (ball.x + ballSize >= canvas.width && (behindGoalY < canvas.height / 2 - goalHeight / 2 || behindGoalY > canvas.height / 2 + goalHeight / 2)) {
    ball.vx *= -0.5;
    ball.vy *= 0.5;
    ball.x = canvas.width - ballSize - 1;
  }

  handlePlayerCollision(player1);
  handlePlayerCollision(player2);

  // Gol jogador 2
  if (ball.x <= goalWidth &&
      behindGoalY > canvas.height / 2 - goalHeight / 2 &&
      behindGoalY < canvas.height / 2 + goalHeight / 2) {
    player2.score++;
    resetBall();
  }

  // Gol jogador 1
  if (ball.x + ballSize >= canvas.width - goalWidth &&
      behindGoalY > canvas.height / 2 - goalHeight / 2 &&
      behindGoalY < canvas.height / 2 + goalHeight / 2) {
    player1.score++;
    resetBall();
  }
}

function handlePlayerCollision(player) {
    if (isTouching(player)) {
      increaseBallSpeed();
      const relY = ball.y + ballSize / 2 - player.y;
  
      // Direção vertical da colisão
      ball.vy = relY < 20 ? -Math.abs(ball.vy || 2) : Math.abs(ball.vy || 2);
  
      // Direção horizontal da colisão
      ball.vx = player === player1 ? Math.abs(ball.vx) + 0.5 : -Math.abs(ball.vx) - 0.5;
  
      // Força que puxa para o centro vertical do campo
      let campoMeioY = canvas.height / 2;
      let forcaCentral = (campoMeioY - (ball.y + ballSize / 2)) * 0.02;
      ball.vy += forcaCentral;
  
      // Limite de velocidade
      if (ball.vx > maxBallSpeed) ball.vx = maxBallSpeed;
      if (ball.vx < -maxBallSpeed) ball.vx = -maxBallSpeed;
    }
  }  

function resetBall() {
  ball.x = 440;
  ball.y = 240;
  ball.vx = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 2);
  ball.vy = (Math.random() * 4) - 2;
  ball.speedMultiplier = 1;
}

function drawPlayer(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 20, playerWidth, 40);
  ctx.beginPath();
  ctx.arc(x + playerWidth / 2, y + 10, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 5, y + 30);
  ctx.lineTo(x + playerWidth + 5, y + 30);
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawGoals() {
  ctx.fillStyle = "#666";
  ctx.fillRect(0, canvas.height / 2 - goalHeight / 2, goalWidth, goalHeight);
  ctx.fillRect(canvas.width - goalWidth, canvas.height / 2 - goalHeight / 2, goalWidth, goalHeight);
}

function drawField() {
  for (let i = 0; i < canvas.height; i += 40) {
    ctx.fillStyle = i % 80 === 0 ? "#3cba54" : "#34a44f";
    ctx.fillRect(0, i, canvas.width, 40);
  }
  ctx.beginPath();
  ctx.strokeStyle = "#ffffff55";
  ctx.lineWidth = 2;
  ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#ffffff55";
  ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawField();
  drawGoals();
  drawPlayer(player1.x, player1.y, "blue");
  drawPlayer(player2.x, player2.y, "red");

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(ball.x + ballSize / 2, ball.y + ballSize / 2, ballSize / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText(`Azul: ${player1.score}`, 20, 30);
  ctx.fillText(`Vermelho: ${player2.score}`, canvas.width - 150, 30);
  ctx.fillStyle = "yellow";
  ctx.fillText(`Tempo: ${timeLeft}s`, canvas.width / 2 - 50, 30);

  if (gameEnded) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(
      player1.score > player2.score ? "Vitória do Azul!" :
      player2.score > player1.score ? "Vitória do Vermelho!" : "Empate!",
      canvas.width / 2 - 120, canvas.height / 2
    );
  }
}

function gameLoop() {
  if (!gameEnded && gameStarted) {
    movePlayers();
    moveBall();
    shootBall();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

function startTimer() {
  const interval = setInterval(() => {
    if (timeLeft > 0 && gameStarted) {
      timeLeft--;
    } else if (timeLeft <= 0) {
      gameEnded = true;
      clearInterval(interval);
    }
  }, 1000);
}

document.getElementById("startButton").addEventListener("click", () => {
  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";
  gameStarted = true;
  startTimer();
});

gameLoop();
