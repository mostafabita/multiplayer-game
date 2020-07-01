const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const compression = require('compression');
const colors = require('colors');

const MOVEMENT = Object.freeze({
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  NONE: 'NONE',
});

const port = process.env.PORT || 3000;
const playground = {
  rows: 700,
  cols: 400,
  nutSize: 10,
  maxNuts: 5,
  speed: 1000 / 10,
  food: {
    x: getRandomInteger(0, 700 / 10) * 10,
    y: getRandomInteger(0, 400 / 10) * 10,
    size: 10,
    color: '#fff',
  },
  busyNuts: [],
};
const clients = {};

app.use(compression({}));
app.use(express.static(__dirname));
app.get('/', (req, res) => res.sendFile(__dirname, 'index.html'));

server.listen(port, () => console.log(`[INFO] Listening on http://localhost:${port}`.magenta));

io.on('connection', (socket) => {
  const client = {
    username: socket.handshake.query.username,
    color: getRandomColor(),
    snake: {
      x: getRandomInteger(0, playground.rows / playground.nutSize) * playground.nutSize,
      y: getRandomInteger(0, playground.cols / playground.nutSize) * playground.nutSize,
      deltaX: playground.nutSize,
      deltaY: 0,
      maxNuts: playground.maxNuts,
      nuts: [],
      died: false,
    },
  };
  clients[socket.id] = client;

  console.log(`[INFO] Client '${client.username}' connected!`.blue);
  io.sockets.emit('clientJoin', { username: client.username, date: new Date(), type: 'info' });

  socket.on('disconnect', () => {
    delete clients[socket.id];
    console.log(`[INFO] Client '${client.username}' disconnected!`.yellow);

    socket.broadcast.emit('clientDisconnect', {
      username: client.username,
      date: new Date(),
      type: 'info',
    });
  });

  socket.on('clientMessage', (data) => {
    const now = new Date();
    console.log(`[MESSAGE] [${formatTime(now)}] ${data.username}: ${data.message}`.blue);
    socket.broadcast.emit('serverMessage', {
      username: data.username,
      message: data.message,
      date: now,
      type: 'message',
    });
  });

  socket.on('movement', (data) => {
    const snake = client.snake;
    const { rows, cols, nutSize, food } = playground;

    if (snake.died) return;

    if (data.direction === MOVEMENT.RIGHT && snake.deltaX === 0) {
      snake.deltaX = nutSize;
      snake.deltaY = 0;
    }
    if (data.direction === MOVEMENT.LEFT && snake.deltaX === 0) {
      snake.deltaX = -nutSize;
      snake.deltaY = 0;
    }
    if (data.direction === MOVEMENT.UP && snake.deltaY === 0) {
      snake.deltaX = 0;
      snake.deltaY = -nutSize;
    }
    if (data.direction === MOVEMENT.DOWN && snake.deltaY === 0) {
      snake.deltaX = 0;
      snake.deltaY = nutSize;
    }

    snake.x += snake.deltaX;
    snake.y += snake.deltaY;

    if (snake.x < 0) {
      snake.x = rows - nutSize;
    } else if (snake.x >= rows) {
      snake.x = 0;
    }

    if (snake.y < 0) {
      snake.y = cols - nutSize;
    } else if (snake.y >= cols) {
      snake.y = 0;
    }

    const newNut = { x: snake.x, y: snake.y, size: nutSize };
    const busyNut = playground.busyNuts.find((n) => n.x === newNut.x && n.y === newNut.y);

    if (busyNut) {
      for (const nut of snake.nuts) {
        playground.busyNuts = playground.busyNuts.filter((n) => n.x !== nut.x || n.y !== nut.y);
      }
      io.sockets.emit('serverMessage', {
        username: 'boss',
        message: `@${client.username}'s snake <strong>died</strong> 💀`,
        date: new Date(),
        type: 'message',
      });
      snake.died = true;
      return;
    }

    snake.nuts.unshift(newNut);
    playground.busyNuts.push(newNut);

    if (snake.x === food.x && snake.y === food.y) {
      snake.maxNuts++;
      food.x = getRandomInteger(0, playground.rows / playground.nutSize) * playground.nutSize;
      food.y = getRandomInteger(0, playground.cols / playground.nutSize) * playground.nutSize;
      food.size = playground.nutSize;
      io.sockets.emit('serverMessage', {
        username: 'boss',
        message: `@${client.username}'s score: <strong>${snake.maxNuts}</strong> 🍎`,
        date: new Date(),
        type: 'message',
      });
    }

    if (snake.nuts.length > snake.maxNuts) {
      const extraNut = snake.nuts.pop();
      playground.busyNuts = playground.busyNuts.filter(
        (n) => n.x !== extraNut.x || n.y !== extraNut.y
      );
    }
  });

  setInterval(() => {
    io.sockets.emit('state', [clients, playground]);
  }, playground.speed);
});

function formatTime(input) {
  const date = new Date(input);
  const hours = date.getHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  const newHours = hours > 12 ? hours - 12 : hours;
  return `${newHours}:${('0' + date.getMinutes()).slice(-2)} ${period}`;
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
