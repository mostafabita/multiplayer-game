import Client from './client';
import Handlebars from 'handlebars';
import { formatTime } from './utils';
import { messageTemplate } from './templates';

export default class App {
  constructor() {
    this.startupSection = $('#startupSection');
    this.startUpForm = $('#startupForm');
    this.usernameInput = $('#usernameInput');

    this.messageBoxSection = $('#messageBoxSection');
    this.messageList = $('#messageList');
    this.messageForm = $('#messageForm');
    this.messageInput = $('#messageInput');

    this.client = null;
  }

  init() {
    this.startUpForm.bind('submit', event => {
      event.preventDefault();
      this.startupSection.fadeOut(500, () => {
        this.messageBoxSection.fadeIn();
        this.client = new Client(this.usernameInput.val());
        this.messageInput.focus();
        this.handleSocketEvents();
      });
    });

    this.messageForm.bind('submit', event => {
      event.preventDefault();
      const value = this.messageInput.val();
      this.messageInput.val('');
      this.sendMessage(value);
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

    this.client.onServerMessage = this.client.onClientMessage = data => {
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

    this.client.connect();
  }

  sendMessage(message) {
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
