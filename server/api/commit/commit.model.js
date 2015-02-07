'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommitSchema = new Schema({
  url: String,
  sha: {
    type: String, 
    unique: true
  },
  author: {
    login: {type: String, lowercase: true},
    id: {type: Number} 
  },
  message: String,
  date: Date,
});

module.exports = mongoose.model('Commit', CommitSchema);