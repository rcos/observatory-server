'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var Commit = require('../commit/commit.model');

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
  proposalUrl: String,
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
  tech: [String],
  commits: [{
    type : Schema.Types.ObjectId,
    ref: 'Commit',
    index: true
  }],
},{ timestamps: true});

/*
  @returns:
 */
ProjectSchema
  .virtual('fullRepoPath')
  .get(function(){
    return (this.githubUsername + "/" + this.githubProjectName) ;
  });

module.exports = mongoose.model('Project', ProjectSchema);
