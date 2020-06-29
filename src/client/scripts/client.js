import io from 'socket.io-client';

export default class Client {
  onConnect() {}
  onClientDisconnect() {}
  onClientJoin() {}
  onClientMessage() {}
  onServerMessage() {}

  constructor(username) {
    this.username = username;
  }

  connect() {
    this.socket = io({ query: 'username=' + this.username });
    this.onConnect({ date: new Date(), type: 'info' });
    this.subscribeSocket();

    return this.socket;
  }

  subscribeSocket() {
    this.socket.on('clientDisconnect', (data) => this.onClientDisconnect(data));
    this.socket.on('clientJoin', (data) => this.onClientJoin(data));
    this.socket.on('serverMessage', (data) => this.onServerMessage(data));
  }

  sendMessage(message) {
    const data = { username: this.username, message, date: new Date(), type: 'message' };
    this.socket.emit('clientMessage', data);
    this.onClientMessage(data);
  }
}
