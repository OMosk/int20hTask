$(document).ready(function () {

  var sidebar = document.querySelector("ul.sidebar-nav");
  while (sidebar.children.length > 2) {
    sidebar.removeChild(sidebar.children[2]);
  }

  for (var i in window.groupStore.data ){
    var li = document.createElement('li');
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

  for (var i in window.groupStore.data ){
    
}

});
