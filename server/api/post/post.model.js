'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PostSchema = new Schema({
  title: String,
  content: String,
  projectId: {
    type : Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  author: {
    type : Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  tags:[],
  date: {
    type: Date,
    default: Date.now,
    index: true
  }
},{ timestamps: true});

module.exports = mongoose.model('Post', PostSchema);
