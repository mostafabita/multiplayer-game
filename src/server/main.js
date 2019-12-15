const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const compression = require('compression');
const colors = require('colors');

const port = process.env.PORT || 3000;
const clients = [];
const sockets = {};

app.use(compression({}));
app.use(express.static(__dirname));

app.get('/', (req, res) => res.sendFile(__dirname));

io.on('connection', socket => {
  const currentClient = {
    id: socket.id,
    username: socket.handshake.query.username,
  };

  if (clients.find(client => client.id === currentClient.id)) {
    console.log(`[INFO] Client '${currentClient.username}' already connected, kicking...`.bgRed);
    socket.disconnect();
    return;
  }

  sockets[currentClient.id] = socket;
  clients.push(currentClient);
  io.emit('clientJoin', { username: currentClient.username, date: new Date(), type: 'info' });

  console.log(`[INFO] Client '${currentClient.username}' connected!`.green);
  console.log(`[INFO] Total clients: ${clients.length}`);

  socket.on('disconnect', () => {
    const now = new Date();
    if (clients.find(client => client.id === currentClient.id)) {
      clients.splice(clients.indexOf(currentClient), 1);
    }
    console.log(`[INFO] Client '${currentClient.username}' disconnected!`.yellow);
    socket.broadcast.emit('clientDisconnect', {
      username: currentClient.username,
      date: now,
      type: 'info',
    });
  });

  socket.on('clientMessage', data => {
    const now = new Date();
    const time = `${('0' + now.getHours()).slice(-2)}:${('0' + now.getMinutes()).slice(-2)}`;
    console.log(`[MESSAGE] [${time}] ${data.username} : ${data.message}`);
    socket.broadcast.emit('serverMessage', {
      username: data.username,
      message: data.message,
      date: now,
      type: 'message',
    });
  });
});

server.listen(port, () => console.log(`[INFO] Listening on http://localhost:${port}`.blue));
