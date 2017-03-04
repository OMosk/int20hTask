const config = {
  wsConnectionString = 'ws://192.168.32.185/ws'
};

class Client {
  constructor() {
    this.actionId = 0;
    this.isConnected = false;
    this.isAuthorized = false;
    this.sentActions = [];
  }
  connect() {
    if (this.ws) {
      this.isConnected = false;
      this.isAuthorized = false;
      this.ws.close();
    }
    this.ws = new WebSocket(config.wsConnectionString);
    this.ws.onopen = this.onopen.bind(this);
    this.ws.onmessage = this.onmessage.bind(this);
    this.ws.onclose = this.onclose.bind(this);
  }
  onopen() {
    this.isConnected = true;
  }
  onmessage(e) {
    try {
      var message = JSON.parse(e.data);
      var actions = message.actions;
      for (let i = 0; i < actions.length; ++i) {
        this.onAction(actions[i]);
      }
    } catch(e) {
      console.log(e);
    }
  }
  onclose() {
    this.ws = null;
    console.log('closed');
  }


  makeAction(payload, cb) {
    payload.actionId = String(++this.actionId);
    if (this.isConnected) {
      this.ws.send(JSON.stringify(payload));
      this.sentActions[payload.actionId] = {action: payload, cb : cb};
    }
  }
  onAction(action) {
    if (action.actionId && this.sentActions[action.actionId]) {
      let cb = this.sentActions[action.actionId].cb;
      delete this.sentActions[action.actionId].cb;
      cb(action);
    }
  }

  registration () {
  }
};

const client = new Client();

export default client;
