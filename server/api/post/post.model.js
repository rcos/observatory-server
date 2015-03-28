'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PostSchema = new Schema({
  title: String,
  content: String,
  projectId: {type : Schema.Types.ObjectId, ref: 'Project'},
  author: {type : Schema.Types.ObjectId, ref: 'User'},
  date: Date
});

module.exports = mongoose.model('Post', PostSchema);
