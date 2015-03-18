'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PostSchema = new Schema({
  title: String,
  content: String,
  project: String,
  author: {
    name: String,
    id: Object
  },
  date: Date
});

module.exports = mongoose.model('Post', PostSchema);
