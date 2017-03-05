  var map;

  function renderMarkers (){
        var users = [];

        for (var i in window.stateStore.data.activeGroup.users ){

          var array = window.stateStore.data.activeGroup.users[i].geo_location.split(' ');
          var contentString = '<div id="bubble">'+
              '<div id="bodyContent">'+
              window.stateStore.data.activeGroup.users[i].message+
              '</div>'+
              '</div>';

          var infowindow = new google.maps.InfoWindow({
            content: contentString
          });

          var icon = {
            url:window.stateStore.data.activeGroup.users[i].photo,
            scaledSize: new google.maps.Size(50, 50),
            shape:{coords:[17,17,18],type:'circle'},
            optimized:false // scaled size
          }

          uluru = {
            lat:parseFloat(array[0]),
            lng:parseFloat(array[1])
          }

          var marker = new google.maps.Marker({
            position: uluru,
            icon: icon,
            map: map,
            title: window.stateStore.data.activeGroup.users[i].name
          });

          users.push({
            marker:marker,
            user: window.stateStore.data.activeGroup.users[i],
            infowindow:infowindow
          });

        }

        setTimeout(function() {
          infowindow.open(map, marker);
        }, 3000);


        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });

        map.addListener('click', function() {
          infowindow.close(map, marker);
        });

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
          console.log("test");
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


  
