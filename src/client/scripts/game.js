// const movement = Object.freeze({
//   UP: 'UP',
//   DOWN: 'DOWN',
//   LEFT: 'LEFT',
//   RIGHT: 'RIGHT',
// });

export default class Game {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.canvas.width = width;
    this.canvas.height = height;

    this.context = this.canvas.getContext('2d');

    this.movement = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
  }

  create(socket) {
    this.socket = socket;

    document.addEventListener('keydown', event => {
      switch (event.keyCode) {
        case 37: // left
          this.movement.left = true;
          break;
        case 38: // up
          this.movement.up = true;
          break;
        case 39: // right
          this.movement.right = true;
          break;
        case 40: // bottom
          this.movement.down = true;
          break;
      }
    });

    document.addEventListener('keyup', event => {
      switch (event.keyCode) {
        case 37: // left
          this.movement.left = false;
          break;
        case 38: // up
          this.movement.up = false;
          break;
        case 39: // right
          this.movement.right = false;
          break;
        case 40: // bottom
          this.movement.down = false;
          break;
      }
    });

    this.socket.on('state', players => {
      const context = this.context;
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (const id in players) {
        if (players.hasOwnProperty(id)) {
          const player = players[id];
          context.fillStyle = player.color;
          context.beginPath();
          context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
          context.fill();
        }
      }
    });

    setInterval(() => {
      this.socket.emit('movement', this.movement);
    }, 1000 / 60);
  }
}
