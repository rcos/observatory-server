'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommitSchema = new Schema({
  url: String,
  projectId: String,
  author: {
    email: {type: String, lowercase: true}, 
    name: {type: String},
    date: { type: Date}
  },
  message: String,
});

module.exports = mongoose.model('Commit', CommitSchema);