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
  userId: {type : String, ref: 'User', index: true},
  projectId: {type : String, ref: 'Project', index: true},
  author: {
    login: {type: String, lowercase: true, index: true},
    id: {type : Schema.Types.ObjectId, ref: 'User', index: true},
  },
  branch: String,
  message: String,
  date: Date,
});

module.exports = mongoose.model('Commit', CommitSchema);
