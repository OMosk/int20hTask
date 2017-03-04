(function(){

  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
  }

  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function Client() {
    this.wsConnectionString = 'ws://192.168.32.185/api';
    this.actionId = 0;
    this.isConnected = false;
    this.isAuthorized = false;
    this.sentActions = [];
    this.fbStatus = 'unknown';
    this.token = getCookie("token");
    this.location = '';
  };

  Client.prototype.connect = function() {
    if (this.ws) {
      this.isConnected = false;
      this.isAuthorized = false;
      this.ws.close();
    }
    this.ws = new WebSocket(this.wsConnectionString);
    this.ws.onopen = this.onopen.bind(this);
    this.ws.onmessage = this.onmessage.bind(this);
    this.ws.onclose = this.onclose.bind(this);
  }
  Client.prototype.onopen = function() {
    this.isConnected = true;
    console.log('connected');
  }
  Client.prototype.onmessage = function(e) {
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
  Client.prototype.onclose = function() {
    this.ws = null;
    console.log('closed');
  }


  Client.prototype.makeAction = function(payload, cb) {
    payload.actionId = String(++this.actionId);
    if (this.isConnected) {
      this.ws.send(JSON.stringify({actions: [payload]}));
      this.sentActions[payload.actionId] = {action: payload, cb : cb};
    }
  }
  Client.prototype.onAction = function(action) {
    if (action.actionId && this.sentActions[action.actionId]) {
      let cb = this.sentActions[action.actionId].cb;
      delete this.sentActions[action.actionId].cb;
      cb(action);
    }
  }

  Client.prototype.onLocationUpdate = function(res) {
    this.location = res.coords.latitude + ' ' + res.coords.longitude;
    console.log('Current location', this.location);
  }

  Client.prototype.onLocationError = function(res) {
    console.log('Location error', res);
  }

  Client.prototype.register = function(cb) {
    if (typeof cb === 'undefined') cb = () => {};

    var client = this;

    var getFacebookData = function() {
      FB.api('/me', function(res) {
        if (res && !res.error) {
          console.log(res);
          var action = {
            type: 'registration',
            name: res.name,
            provider: 'fb',
            providerUserId: 'fb' + res.id,
            photo: "http://graph.facebook.com/" + res.id + "/picture?type=square&width=100&height=100",
            geoLocation: client.location
          };
          console.log('got fb data', action);
          client.makeAction(action, function(data) {
            console.log(data); 
          });
          //window.usersStore.set(data);
        }
      });
    };

    if (this.fbStatus == 'connected') {
      getFacebookData();
    } else {
      FB.login(function(res) {
        if (res.authResponse) {
          getFacebookData();
        } else {
          cb({
            error: "Facebook login error",
            payload: res
          });
        }
      });
    }
  }
  
  Client.prototype.createGroup = function(name, cb) {

  }


window.client = new Client();
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(client.onLocationUpdate.bind(client), client.onLocationError.bind(client), {
    enableHighAccuracy: true,
    timeout: 10000
  });
} else {
  alert('unsupported geolocation');
}


window.fbAsyncInit = function() {
  console.log('fbLoaded');
  FB.init({
    appId      : '1875797875969505',
    xfbml      : true,
    version    : 'v2.8'
  });
  console.log('inited');

  FB.getLoginStatus(function(response) {
    if (response.status == 'connected') {
      window.client.fbStatus = 'connected';
    }
  });
};

})();
