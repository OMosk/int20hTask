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

    var image = 'img/oval-face.png';
    var icon = {
      url:image,
      scaledSize: new google.maps.Size(50, 50),
      shape:{coords:[17,17,18],type:'circle'},
      optimized:false // scaled size
    }

    var marker = new google.maps.Marker({
      position: uluru,
      icon: icon,
      map: map,
      title: 'Uluru (Ayers Rock)'
    });

    var marker2 = new google.maps.Marker({
      map: map,
      title: 'Uluru (Ayers Rock)'
    });

    setTimeout(function() {
      infowindow.open(map, marker);
 }, 3000)

    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });

    map.addListener('click', function() {
      infowindow.close(map, marker);
    });

    function placeMarker(location) {
      if ( marker2 ) {
        marker2.setPosition(location);
      } else {
        marker2 = new google.maps.Marker({
          position: location,
          map: map
        });
      }
    }

    google.maps.event.addListener(map, 'click', function(event) {
      placeMarker(event.latLng);
    });

  }
