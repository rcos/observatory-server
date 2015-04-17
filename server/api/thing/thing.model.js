'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ThingSchema = new Schema({
  name: String,
  info: String,
  link: String,
  active: Boolean
});

module.exports = mongoose.model('Thing', ThingSchema);
