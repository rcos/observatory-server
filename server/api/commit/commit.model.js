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
  userId: { type: String, index: true},
  author: {
    login: {type: String, lowercase: true},
    id: {type: Number}
  },
  branch: String,
  message: String,
  date: Date,
},{ timestamps: true});

module.exports = mongoose.model('Commit', CommitSchema);
