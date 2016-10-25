'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var AchievementSchema = new Schema({
  title: String,
  description: String,
  date: Date
});

module.exports = mongoose.model('Achievement', AchievementSchema);
