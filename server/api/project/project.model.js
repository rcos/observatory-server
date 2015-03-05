'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProjectSchema = new Schema({
  name: String,
  description: String,
  // Where is the project hosted? Github, Google Code, etc.
  repositoryType: {type: String, default: 'github'},
  repositoryUrl: String,
  websiteUrls: [String],
  githubUsername: String,
  githubProjectName: String,
  lastChecked: {type: Date},
  authors: [String],
  photos: [String],
  mentor: String,
  active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Project', ProjectSchema);
