import Client from './client';
import Handlebars from 'handlebars';
import { formatTime } from './utils';
import { messageTemplate } from './templates';
import Game from './game';

export default class App {
  constructor() {
    this.currentUserLabels = $('.current-username');

    this.startupSection = $('#startupSection');
    this.startUpForm = $('#startupForm');
    this.usernameInput = $('#usernameInput');

    this.warmupSection = $('#warmupSection');

    this.messageList = $('#messageList');
    this.messageForm = $('#messageForm');
    this.messageInput = $('#messageInput');

    this.playground = {
      canvas: document.getElementById('playground'),
      width: 700,
      height: 400,
    };
  }

  init() {
    // **************************** [ TODO: remove 2 below lines after test ] **************************** //
    // this.usernameInput.val(Math.floor(Math.random() * 1000));
    // $('.container-lg').removeClass('mw-fixed');
    // this.start();

    this.startUpForm.bind('submit', event => {
      event.preventDefault();
      $('.container-lg').removeClass('mw-fixed');
      this.start();
    });

    this.messageForm.bind('submit', event => {
      event.preventDefault();
      this.sendMessage(this.messageInput.val());
    });
  }

  start() {
    const username = this.usernameInput.val();
    this.currentUserLabels.html(`@${username}`);

    this.client = new Client(username);
    this.game = new Game(this.playground.canvas, this.playground.width, this.playground.height);

    this.handleSocketEvents();

    this.startupSection.fadeOut(500, () => {
      this.warmupSection.fadeIn();
      this.messageInput.focus();
    });
  }

  handleSocketEvents() {
    this.client.onConnect = data => {
      this.log({
        ...data,
        prefix: 'Connected to the application',
      });
    };

    this.client.onClientJoin = data => {
      this.log({
        ...data,
        prefix: 'joined',
      });
    };

    this.client.onServerMessage = data => {
      this.log(data);
    };

    this.client.onClientMessage = data => {
      this.log({
        ...data,
        me: this.client.username === data.username,
      });
    };

    this.client.onClientDisconnect = data => {
      this.log({
        ...data,
        prefix: 'left',
      });
    };

    const socket = this.client.connect();
    this.game.create(socket);
  }

  sendMessage(message) {
    this.messageInput.val('');
    this.client.sendMessage(message);
  }

  log(data) {
    const model = {
      ...data,
      date: formatTime(data.date),
      content: data.message,
      username: data.username,
    };
    const template = Handlebars.compile(messageTemplate)(model);
    this.messageList.append(template);
    this.messageList.scrollTop(this.messageList.height());
  }
}
