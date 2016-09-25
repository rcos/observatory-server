/**
 * Achievement model events
 */

'use strict';

var EventEmitter = require('events').EventEmitter;
var Achievement = require('./achievement.model');
var AchievementEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
AchievementEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Achievement.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    AchievementEvents.emit(event + ':' + doc._id, doc);
    AchievementEvents.emit(event, doc);
  }
}

module.exports = AchievementEvents;
