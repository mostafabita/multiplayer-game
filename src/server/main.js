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

io.on('connection', socket => {
  const client = {
    username: socket.handshake.query.username,
    x: Math.floor(Math.random() * (700 - 50) + 50),
    y: Math.floor(Math.random() * (350 - 50) + 50),
    color: getRandomColor(),
  };

  clients[socket.id] = client;

  console.log(`[INFO] Client '${client.username}' connected!`.blue);
  io.emit('clientJoin', { username: client.username, date: new Date(), type: 'info' });

  socket.on('disconnect', () => {
    delete clients[socket.id];
    console.log(`[INFO] Client '${client.username}' disconnected!`.yellow);

    socket.broadcast.emit('clientDisconnect', {
      username: client.username,
      date: new Date(),
      type: 'info',
    });
  });

  socket.on('clientMessage', data => {
    const now = new Date();
    console.log(`[MESSAGE] [${formatTime(now)}] ${data.username}: ${data.message}`.blue);
    socket.broadcast.emit('serverMessage', {
      username: data.username,
      message: data.message,
      date: now,
      type: 'message',
    });
  });

  socket.on('movement', function(data) {
    const player = clients[socket.id] || {};
    if (data.left) {
      player.x -= 5;
    }
    if (data.up) {
      player.y -= 5;
    }
    if (data.right) {
      player.x += 5;
    }
    if (data.down) {
      player.y += 5;
    }
  });

  setInterval(() => {
    io.sockets.emit('state', clients);
  }, 1000 / 60);
});

formatTime = input => {
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
