  var map;
  function initMap() {
    var uluru = {lat: 50.27, lng: 30.30};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: uluru
      });

    var contentString = '<div id="bubble">'+
        '<div id="bodyContent">'+
        'body textalsjhfasjlhfasjlhflsajfhaslhflasjhfljashf'
        '</div>'+
        '</div>';

    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    for (var i in window.usersStore.data ){
      var array = window.usersStore.data[i].geo_location.split(' ');

      var icon = {
        url:window.usersStore.data[i].photo,
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
        title: window.usersStore.data[i].name
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
      client.setGoal(location);
    }

    google.maps.event.addListener(map, 'click', function(event) {
      placeMarker(event.latLng);
    });

  }
