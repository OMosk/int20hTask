$(document).ready(function () {

  function Group(name){
    this.name = name;
    this.addGroup =  function(data){
      console.log(name);
    }
  }

  Group.prototype.createGroup = function(name, callback){
    сalback(name);
  };

  var group = new Group();

  group.createGroup($('#add_group').val()), function(){

  });

  /*$('#createGroup').on('click', function(){
    var group = new Group($('#add_group').val());
    group.addGroup();
  });*/

  //console.log(group.name);

});
