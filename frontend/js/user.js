function myFunction(event){
  event.preventDefault();
  var value = $('#message').val();
  client.sendMessage(value);
  console.log(value);
  return false;
}

stateStore.notifier.on('change', function(){
  if (stateStore.data.isAuthorized){
    console.log("asfs");
    $('fieldset').removeAttr("disabled");
  }
});
