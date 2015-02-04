'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProjectSchema = new Schema({
  name: String,
  description: String,
  // Where is the project hosted? Github, Google Code, etc.
  repositoryType: {type: String, default: 'github'},
  repositoryUrl: String,
  websiteUrl: String,
  githubUsername: String,
  githubProjectName: String,
  authors: [String],
  photos: [String],
  mentor: String,
  active: Boolean
});

module.exports = mongoose.model('Project', ProjectSchema);