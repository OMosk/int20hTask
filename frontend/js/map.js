  var map;
  var users = [];
  var marker;


  function renderMarkers (){

    for (let i=0; i<users.length; i++){
      if (users[i].infowindow){
        users[i].infowindow.close();
      }
    }

    if (window.stateStore.data.activeGroup.geo_location){
      var location =  window.stateStore.data.activeGroup.geo_location.split(' ');

      placeMarker({
        lat:parseFloat(location[0]),
        lng:parseFloat(location[1])
      });
    }

        for (var i in window.stateStore.data.activeGroup.users ){

          let array = window.stateStore.data.activeGroup.users[i].geo_location.split(' ');

          let contentString = '<div id="bubble">'+
              '<div id="bodyContent">'+
              window.stateStore.data.activeGroup.users[i].message+
              '</div>'+
              '</div>';

          let infowindow = new google.maps.InfoWindow({
            content: contentString
          });


          let icon = {
            url:window.stateStore.data.activeGroup.users[i].photo,
            scaledSize: new google.maps.Size(50, 50),
            shape:{coords:[17,17,18],type:'circle'},
            optimized:false // scaled size
          }

          uluru = {
            lat:parseFloat(array[0]),
            lng:parseFloat(array[1])
          }

          let marker = new google.maps.Marker({
            position: uluru,
            icon: icon,
            map: map,
            title: window.stateStore.data.activeGroup.users[i].name
          });

          infowindow.open(map, marker);

          marker.addListener('click', function() {
            infowindow.open(map, marker);
          });

          users.push({
            marker:marker,
            user: window.stateStore.data.activeGroup.users[i],
            infowindow:infowindow
          });

        }

        //map.addListener('click', function() {
        //  infowindow.close(map, marker);
        //});

        var meet_location = new google.maps.Marker({
          map: map,
          title: 'Uluru (Ayers Rock)'
        });

        function placeMarker(location) {
          if ( meet_location ) {
            meet_location.setPosition(location);
          } else {

            meet_location = new google.maps.Marker({
              position: location,
              map: map
            });
          }
        }

        google.maps.event.addListener(map, 'click', function(event) {
          client.setGoal(event.latLng);

        });

        groupStore.notifier.on('updateLocation', function(data){

        });

        groupStore.notifier.on('setGoal', function(data){
          if(stateStore.data.activeGroup.group_id === data.group_id ){
          var location =  data.geo_location.split(' ');

          placeMarker({
            lat:parseFloat(location[0]),
            lng:parseFloat(location[1])
          });
        }
    });
  }

  function initMap() {
    var uluru = {lat: 50.27, lng: 30.30};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: uluru
      });


  }


  stateStore.notifier.on('new_message', function(message){
      if (message.group_id === stateStore.data.activeGroup.group_id){
          for (var i=0; i<users.length; ++i){
            if (message.user_id === users[i].user.id){
              users[i].infowindow.setContent('<div id="bubble">'+
                  '<div id="bodyContent">'+
                  message.text+
                  '</div>'+
                  '</div>');
              users[i].infowindow.open(map, users[i].marker);
            }
          }
      }
  });
