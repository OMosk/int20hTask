    function renderSidebar(){
      var sidebar = document.querySelector("ul.sidebar-nav");
      while (sidebar.children.length > 2) {
        sidebar.removeChild(sidebar.children[2]);
      }

      for (var i in window.groupStore.data ){
        var li = document.createElement('li');
        var li_id = document.createAttribute('data-id');
        li_id.value = window.groupStore.data[i].group_id;
        li.setAttributeNode(li_id);
        var a = document.createElement('a');
        a.href = "#";
        li.appendChild(a);

        var span_modal = document.createElement('span');
        var toggle = document.createAttribute("data-toggle");
        toggle.value = "modal";
        var target = document.createAttribute("data-target");
        target.value = "#memberGroup";
        span_modal.setAttributeNode(toggle);
        span_modal.setAttributeNode(target);
        span_modal.appendChild(document.createTextNode(window.groupStore.data[i].name));

        a.appendChild(span_modal);

        var span = document.createElement('span');
        var span_class = document.createAttribute("class");
        span_class.value ="glyphicon glyphicon-ok pull-right";
        span.setAttributeNode(span_class);
        a.appendChild(span);

        sidebar.appendChild(li);
      }
    }


groupStore.notifier.on('change', function(){
  renderSidebar();


  // Select group and switch beetween them
    $('.glyphicon-ok').on("click", function(){
      console.log("her");
      if ($(this).hasClass('green')){
        $(this).addClass("green");
        var domElem = $(this).get(0);
        var id = domElem.getAttribute('data-id');
        for (var i=0; i<groupStore.data.length; i++){
          if (id === groupStore.data[i].group_id){
            client.changeCurrentGroup(groupStore.data[i]);
          }
        }
      }
      else{
        $('.glyphicon-ok').removeClass('green');
        $(this).addClass("green");
        var domElem = $(this).get(0);
        var id = domElem.getAttribute('data-id');
        for (var i=0; i<groupStore.data.length; i++){
          if (id === groupStore.data[i].group_id){
            client.changeCurrentGroup(groupStore.data[i]);
          }
        }

      }
    });
function renderUsersModal() {
}

$('ul.sidebar-nav li').on('click', function(){
  var domElem = $(this).get(0);
  console.log('onclick fired');
  for (let i = 0; i < window.groupStore.data.length; ++i) {
      if (domElem.getAttribute('data-id') ==  window.groupStore.data[i].group_id){
        stateStore.data.editing_group = window.groupStore.data[i];
        console.log('neeeded group');

        var sidebar = document.querySelector("ul.list-group");

        while (sidebar.children.length !==0) {
          sidebar.removeChild(sidebar.children[0]);
        }

        for (let j in window.groupStore.data[i].users ){
            var li = document.createElement('li');
            var li_class = document.createAttribute("class");
            li_class.value = 'list-group-item';

            li.setAttributeNode(li_class);

            li.appendChild(document.createTextNode(window.groupStore.data[i].users[j].name));

            var span = document.createElement("span");
            var span_class = document.createAttribute('class');
            span_class.value = 'glyphicon glyphicon-remove pull-right';
            span.setAttributeNode(span_class);
            li.appendChild(span);
            sidebar.appendChild(li);
          }
      }
    }

    for (let i=0; i<usersStore.data.length; ++i){
      console.log('filing dropdown lisst');
      var new_option = document.createElement('option');
      new_option.value = usersStore.data[i].name;
      new_option.setAttribute('data-input-id',usersStore.data[i].id);
      if (usersStore.data[i].id == client.id) continue;
      $("#browsers").append(new_option);
    }
});

$("#memberGroup > div > div > form > div > div.form-group > button").on('click', function() {
  var yourSelect = document.getElementById( "dropdownInput" );
  var datalist = document.getElementById( "browsers" );
  console.log(yourSelect.value);
  for (let i = 0; i < datalist.options.length; ++i) {
    var option = datalist.options[i];
    if (option.value == yourSelect.value) {
      var id = option.getAttribute("data-input-id");
      for (let j = 0; j < usersStore.data.length; ++j) {
        var user = usersStore.data[j];
        if (user.id == id) {
          client.addToGroup(stateStore.data.editing_group, user, function() {
            for (let j in stateUser.data.editing_group.users ){
              var li = document.createElement('li');
              var li_class = document.createAttribute("class");
              li_class.value = 'list-group-item';

              li.setAttributeNode(li_class);

              li.appendChild(document.createTextNode(stateStore.data.editing_group.users[j].name));

              var span = document.createElement("span");
              var span_class = document.createAttribute('class');
              span_class.value = 'glyphicon glyphicon-remove pull-right';
              span.setAttributeNode(span_class);
              li.appendChild(span);
              sidebar.appendChild(li);
            }

          });
          return;
        }
      }
    }
  }
});

});
