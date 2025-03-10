/*global io*/
let socket = io();

$(document).ready(function () {
  // Form submittion with new message in field with id 'm'
  $('form').submit(function () {
    let messageToSend = $('#m').val();
    socket.emit('chat message', messageToSend)
    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });
});
// send number of connected users to client console
socket.on('user', data => {
  $('#num-users').text(data.currentUsers + ' users online');
  let message =
    data.name +
    (data.connected ? ' has joined the chat.' : ' has left the chat.');
  $('#messages').append($('<li>').html('<b>' + message + '</b>'));
});

socket.on('chat message', data => {
  $('#messages').append($('<li>').html('<b>' + data.name + ':' + data.message + '</b>'));
});