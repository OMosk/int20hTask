window.EventEmitter = window.eventemitter.EventEmitter;

window.userStore = {
  data: {},
  notifier: new EventEmitter(),
  set: function(data) {
    this.data = data;
    this.notifier.emit('change', data);
  }
};

window.usersStore = {
  data: [{
    id:'123',
    photo:'img/oval-face.png',
    geo_location:'50.27 30.30',
    name:'boromir'
},{
    id:'213',
    photo:'img/oval-face.png',
    geo_location:'50.23 30.31',
    name:'boromir'
}],
  notifier: new EventEmitter(),
  set: function(data) {
    this.data = data;
    this.notifier.emit('change', data);
  }
};

window.groupStore = {
  data: [{
   group_id: "sf",
   group_name: "family",
   users: ["boromir", "moskal"]
}],
  notifier: new EventEmitter(),
  set: function(data) {
    this.data = data;
    this.notifier.emit('change', data);
  }
};

window.stateStore = {
  data: {}, //
  notifier: new EventEmitter(),
  set: function(data) {
    this.data = data;
    this.notifier.emit('change', data);
  }
};
