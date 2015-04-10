'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommitSchema = new Schema({
  url: String,
  sha: {
    type: String,
    unique: true,
    index: true,
  },
  userId: {type : Schema.Types.ObjectId, ref: 'User', index: true},
  projectId: {type : Schema.Types.ObjectId, ref: 'Project', index: true},
  author: {
    login: {type: String, lowercase: true},
    id: {type : Schema.Types.ObjectId, ref: 'User'},
  },
  branch: String,
  message: String,
  date: Date,
});

module.exports = mongoose.model('Commit', CommitSchema);
