'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProjectSchema = new Schema({
  name: {
    type: String,
    index: true
  },
  description: String,
  // Where is the project hosted? Github, Google Code, etc.
  repositoryType: {
    type: String,
    default: 'github'
  },
  repositories: [String],
  websiteUrl: String,
  githubUsername: {
    type: String,
    lowercase:true,
    index: true
  },
  githubProjectName: {
    type: String,
    lowercase:true,
    index: true
  },
  lastChecked: {
    type: Date
  },
  photos: [String],
  mentor: String,
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  markedDefault: {
    type: Boolean,
    default: false,
    index: true
  },
  tech: [String]
},{ timestamps: true});

module.exports = mongoose.model('Project', ProjectSchema);
