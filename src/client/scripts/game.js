const MOVEMENT = Object.freeze({
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
});

export default class Game {
  constructor({ canvas, rows, cols, speed }) {
    this.rows = rows;
    this.cols = rows;
    this.speed = speed;
    this.canvas = canvas;
    this.canvas.width = rows;
    this.canvas.height = cols;
    this.context = this.canvas.getContext('2d');
    this.movement = MOVEMENT.RIGHT;
  }

  create(socket) {
    this.socket = socket;

    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          this.movement = MOVEMENT.LEFT;
          break;
        case 'ArrowUp':
          this.movement = MOVEMENT.UP;
          break;
        case 'ArrowRight':
          this.movement = MOVEMENT.RIGHT;
          break;
        case 'ArrowDown':
          this.movement = MOVEMENT.DOWN;
          break;
      }
    });

    this.socket.on('state', (players) => {
      const context = this.context;
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (const id in players) {
        if (players.hasOwnProperty(id)) {
          this.drawSnake(players[id]);
        }
      }
    });

    setInterval(() => {
      this.socket.emit('movement', {
        direction: this.movement,
      });
    }, this.speed);
  }

  drawSnake(player) {
    this.context.fillStyle = player.color;
    player.snake.nuts.forEach((nut) => {
      this.context.fillRect(nut.x, nut.y, nut.size - 1, nut.size - 1);
    });
  }
}
