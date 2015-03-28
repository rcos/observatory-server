'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PostSchema = new Schema({
  title: String,
  content: String,
  projectId: String,
  author: {
    name: String,
    id: Object
  },
  date: Date
});

module.exports = mongoose.model('Post', PostSchema);
