function myFunction(){
  var value = $('#message').val();
  client.sendMessage(value);
  console.log(value);
  return false;
}
