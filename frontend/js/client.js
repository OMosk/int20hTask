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
    this.wsConnectionString = 'wss://' + location.host + '/api';
    this.actionId = 0;
    this.isConnected = false;
    this.isAuthorized = false;
    this.sentActions = [];
    this.fbStatus = 'unknown';
    this.token = getCookie("token");
    this.location = '';
    this.shouldReconnect = true;
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
    if (this.shouldReconnect && this.token) {
      console.log('authorizing');
      this.authorize();
    }
    var client = this;
    this.inverval = setInterval(function(){
      client.ws.send(JSON.stringify({actions:[]}));
    }, 1000 * 60);
  }
  Client.prototype.onmessage = function(e) {
    //try {
      var message = JSON.parse(e.data);
      var actions = message.actions;
      for (let i = 0; i < actions.length; ++i) {
        this.onAction(actions[i]);
      }
    //} catch(e) {
    //  console.log(e);
    //}
  }
  Client.prototype.onclose = function() {
    this.ws = null;
    console.log('closed');
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.shouldReconnect) {
      console.log("reconnecting");
      this.connect();
    }
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

    if (action.type == 'sent_message') {
      var groups = groupStore.data;
      for (var i = 0; i < groups.length; ++i) {
        var group = groups[i];
        if (group.group_id == action.group_id) {
          for (var j = 0; group.users.length; ++j) {
            var user = group.users[j];
            if (user.id == action.user_id) {
              user.message = action.text;
              //TODO show message
            }
          }
        }
      }
    }

    if (action.type == 'update_location') {
      var groups = groupStore.data;
      for (var i = 0; i < groups.length; ++i) {
        var group = groups[i];
        for (var j = 0; group.users.length; ++j) {
          var user = group.users[j];
          if (user.id == action.user_id) {
            user.get_location = action.geoLocation;
          }
        }
      }
      groupStore.set(groups);
      //TODO update locations
    }

    if (action.type == 'invite_into_group') {
      var found = false;
      var groups = groupStore.data;
      for (var i = 0; i < groups.length; ++i) {
        var group = groups[i];
        if (group.group_id == action.group_id) {
          found = true;
          group.users.push(action.guest);
          //TODO new user event
        }
      }
      if (!found) {
        //You are 
      }
      groupStore.set(groups);
    }

    if (action.type == 'delete_from_group') {
      var groups = groupStore.data;
      for (var i = 0; i < groups.length; ++i) {
        var group = groups[i];
        if (group.group_id == action.group_id) {
          for (var j = 0; group.users.length; ++j) {
            var user = group.users[j];
            if (user.id == action.user_id) {
              group.users.splice(j, 1);
              //TODO hide marker
            }
          }
        }
      }
      groupStore.set(groups);
    }

    if (action.type == 'set_goal') {
      var groups = groupStore.data;
      for (var i = 0; i < groups.length; ++i) {
        var group = groups[i];
        if (group.group_id == action.group_id) {
          group.geo_location = action.geo_location; 
          //TODO group goal changed
        }
      }
      groupStore.set(groups);
    }
  }

  Client.prototype.onLocationUpdate = function(res) {
    this.location = res.coords.latitude + ' ' + res.coords.longitude;
    this.makeAction({
      type: 'update_location',
      user_id: this.id,
      geoLocation: this.location
    });
    console.log('Current location', this.location);
  }

  Client.prototype.onLocationError = function(res) {
    console.log('Location error', res);
  }

  Client.prototype.authorize = function(cb) {
    var client = this;
    if (typeof cb === 'undefined') cb = function(){};
    this.makeAction({
      type: 'auth',
      token: this.token
    }, function(res) {
      if (!res.error) {
        client.id = res.provider_id;
        res.id = res.provider_id;
        userStore.set(res);
        state = stateStore.data;
        state.isAuthorized = true;
        stateStore.set(state);
        cb(true);
      } else {
        cb(false);
      }
    });
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
            if (data.token) {
              client.token = data.token;
              client.id = data.providerUserId;

              setCookie('token', client.token);

              client.isAuthorized = true;
              action.id = action.provider_id;

              userStore.set(action);

              state = stateStore.data;
              state.isAuthorized = true;
              stateStore.set(state);

              cb(true);
            } else {
              console.log(data);
              cb(false);
            }
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
    if (typeof cb === 'undefined') cb = function() {};
    this.makeAction({
      type: 'create_group',
      name: name,
      user_id: this.id
    }, function(res) {
      if (res.success) {
        let groups = groupStore.data;
        groups.unshift({
          name: name,
          members: [userStore.data]
        });
        groupStore.set(res.groups);
        cb(true);
      } else {
        console.log(res);
        cb(false);
      }
    });
  }

  Client.prototype.getGroups = function(cb) {
    if (typeof cb === 'undefined') cb = function() {};
    this.makeAction({
      type: 'get_all_groups',
      user_id: this.id
    }, function(res) {
      if (res.groups) {
        groupStore.set(res.groups);
        cb(true);
      } else {
        console.log(res);
        cb(false);
      }
    });
  }

  Client.prototype.addToGroup = function(group, user, cb) {
    if (typeof cb === 'undefined') cb = function() {};
    this.makeAction({
      type: 'add_to_group',
      group_id: group.group_id,
      user_id: user.id
    }, function(res) {
    })
  }

  Client.prototype.removeFromGroup = function(group, user, cb) {
    if (typeof cb === 'undefined') cb = function() {};
    this.makeAction({
      type: 'delete_from_group',
      user_id: user.id,
      group_id: group.group_id
    }, function(res) {
      if (res.error) {
        console.log(res);
        cb(false);
      } else {
        cb(true);
      }
    });
  }

  Client.prototype.getAllUsers = function(cb) {
    if (typeof cb === 'undefined') cb = function() {};
    this.makeAction({
      type: 'get_all_users'
    }, function(res) {
      if (res.users) {
        usersStore.set(res.users);
        cb(true);
      } else {
        console.log(res);
        cb(false);
      }
    });
  }

  Client.prototype.changeCurrentGroup = function(group) {
    var state = stateStore.data;
    state.activeGroup = group;
    stateStore.set(state);
  }

  Client.prototype.sendMessage = function(text, cb) {
    if (typeof cb === 'undefined') cb = function() {};
    this.makeAction({
      type: 'sent_message',
      user_id: this.id,
      group_id: stateStore.data.activeGroup.group_id,
      text: text
    }, function(res) {
      if (!res.error) {
        cb(true);
      } else {
        console.log(res);
        cb(false);
      }
    });
  }

  Client.prototype.setGoal = function(goal, cb) {
    if (typeof cb === 'undefined') cb = function() {};
    this.makeAction({
      type: 'set_goal',
      group_id: stateStore.data.activeGroup.group_id,
      geo_location: goal
    }, function(res) {
      if (!res.error) {
        cb(true);
      } else {
        console.log(res);
        cb(false);
      }
    });
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
