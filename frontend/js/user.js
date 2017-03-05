function myFunction(event){
  event.preventDefault();
  var value = $('#message').val();
  client.sendMessage(value);
  $('#message').val('');
  console.log(value);
  return false;
}

$('.message').on('submit', myFunction);

stateStore.notifier.on('change', function(){
  if (stateStore.data.isAuthorized){
    console.log("asfs");
    $('fieldset').removeAttr("disabled");
  }
});
