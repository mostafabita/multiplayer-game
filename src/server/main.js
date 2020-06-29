const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const compression = require('compression');
const colors = require('colors');

const port = process.env.PORT || 3000;
const clients = {};

app.use(compression({}));
app.use(express.static(__dirname));
app.get('/', (req, res) => res.sendFile(__dirname, 'index.html'));

server.listen(port, () => console.log(`[INFO] Listening on http://localhost:${port}`.magenta));

io.on('connection', (socket) => {
  const client = {
    username: socket.handshake.query.username,
    x: Math.floor(Math.random() * (700 - 50) + 50),
    y: Math.floor(Math.random() * (350 - 50) + 50),
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
    const player = clients[socket.id] || {};
    switch (data.direction) {
      case 'UP':
        player.y -= 5;
        break;
      case 'RIGHT':
        player.x += 5;
        break;
      case 'DOWN':
        player.y += 5;
        break;
      case 'LEFT':
        player.x -= 5;
        break;
      default:
        break;
    }
  });

  setInterval(() => {
    io.sockets.emit('state', clients);
  }, 1000 / 2);
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
