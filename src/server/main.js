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
  maxNuts: 4,
  speed: 1000 / 10,
};
const clients = {};

app.use(compression({}));
app.use(express.static(__dirname));
app.get('/', (req, res) => res.sendFile(__dirname, 'index.html'));

server.listen(port, () => console.log(`[INFO] Listening on http://localhost:${port}`.magenta));

io.on('connection', (socket) => {
  const client = {
    username: socket.handshake.query.username,
    snake: {
      x: getRandomInteger(0, playground.rows / playground.nutSize) * playground.nutSize,
      y: getRandomInteger(0, playground.cols / playground.nutSize) * playground.nutSize,
      deltaX: playground.nutSize,
      deltaY: 0,
      maxNuts: playground.maxNuts,
      nuts: [],
    },
    color: getRandomColor(),
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
    const snake = clients[socket.id].snake;
    const rows = playground.rows;
    const cols = playground.cols;
    const nutSize = playground.nutSize;

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

    snake.nuts.unshift({ x: snake.x, y: snake.y, size: nutSize });
    if (snake.nuts.length > snake.maxNuts) {
      snake.nuts.pop();
    }
  });

  setInterval(() => {
    io.sockets.emit('state', clients);
  }, playground.speed);
});

formatTime = (input) => {
  const date = new Date(input);
  const hours = date.getHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  const newHours = hours > 12 ? hours - 12 : hours;
  return `${newHours}:${('0' + date.getMinutes()).slice(-2)} ${period}`;
};

getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

getRandomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};
