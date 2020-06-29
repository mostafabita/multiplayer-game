const MOVEMENT = Object.freeze({
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  NONE: 'NONE',
});

export default class Game {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d');
    this.movement = MOVEMENT.NONE;
  }

  create(socket) {
    this.socket = socket;

    document.addEventListener('keydown', (event) => {
      switch (event.code) {
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
        case 'Space':
          this.movement = MOVEMENT.NONE;
          break;
      }
    });

    this.socket.on('state', (players) => {
      const context = this.context;
      // context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (const id in players) {
        if (players.hasOwnProperty(id)) {
          const player = players[id];
          context.fillStyle = player.color;
          context.beginPath();
          context.arc(player.x, player.y, 5, 0, 3 * Math.PI);
          context.fill();
        }
      }
    });

    setInterval(() => {
      this.socket.emit('movement', {
        direction: this.movement,
      });
    }, 1000 / 2);
  }
}
