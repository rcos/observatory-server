/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var AchievementEvents = require('./achievement.events');

// Model events to emit
var events = ['save', 'remove'];

exports.register = function(socket) {
  // Bind model events to socket events
  for (var i = 0, eventsLength = events.length; i < eventsLength; i++) {
    var event = events[i];
    var listener = createListener('achievement:' + event, socket);

    AchievementEvents.on(event, listener);
    socket.on('disconnect', removeListener(event, listener));
  }
};


function createListener(event, socket) {
  return function(doc) {
    socket.emit(event, doc);
  };
}

function removeListener(event, listener) {
  return function() {
    AchievementEvents.removeListener(event, listener);
  };
}
