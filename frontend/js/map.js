  var map;
  function initMap() {
    var uluru = {lat: 50.27, lng: 30.30};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: uluru
      });


    var contentString = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h3 id="firstHeading" class="firstHeading">Borya</h3>'+
        '<div id="bodyContent">'+
        'body text'
        '</div>'+
        '</div>';

    var infowindow = new google.maps.InfoWindow({
      content: contentString
    });

    var image = 'img/oval-face.png';
    var marker = new google.maps.Marker({
      position: uluru,
      icon: image,
      map: map,
      title: 'Uluru (Ayers Rock)'
    });

    setTimeout(function() {
      infowindow.open(map, marker);
 }, 3000)

    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });
  }
