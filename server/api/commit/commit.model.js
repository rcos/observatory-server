'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var Project = require('../project/project.model');

var CommitSchema = new Schema({
  url: String,
  sha: {
    type: String,
    unique: true,
    index: true,
  },
  author: {
    login: {type: String, lowercase: true},
    id: {type: Number}
  },
  commentCount: Number,
  message: String,
  date: Date,
  project: {
    type : Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
},{ timestamps: true});

module.exports = mongoose.model('Commit', CommitSchema);
