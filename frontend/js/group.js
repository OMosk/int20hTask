$(document).ready(function () {


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
      span_modal.appendChild(document.createTextNode(window.groupStore.data[i].group_name));

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
  });

  // Select group and switch beetween them
    $('.glyphicon-ok').on("click", function(){
      if ($(this).hasClass('green')){
        $(this).addClass("green");
      }
      else{
        $('.glyphicon-ok').removeClass('green');
        $(this).addClass("green");
      }
    });

$('ul.sidebar-nav li').on('click', function(){
  var domElem = $(this).get(0);

  for (let i in window.groupStore.data ){
      if (domElem.getAttribute('data-id') ===  window.groupStore.data[i].group_id){
        for (let j in  window.groupStore.data[i].users){

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
    }
});



});
