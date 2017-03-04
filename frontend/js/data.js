window.EventEmitter = window.eventemitter.EventEmitter;

window.userStore = {
  data: {},
  notifier: new EventEmitter(),
  set: function(data) {
    this.data = data;
    this.notifier.emit('change', data);
  }
};

window.groupStore = {
  data: [],
  notifier: new EventEmitter(),
  set: function(data) {
    this.data = data;
    this.notifier.emit('change', data);
  }
};

