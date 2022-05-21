/*global io*/
let socket = io();

$(document).ready(function () {
  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    var messageToSend = $('#m').val();

    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
});
// send number of connected users to client console
socket.on('user count', (data) => console.log(data))
