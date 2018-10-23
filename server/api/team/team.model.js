'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TeamSchema = new Schema({
  description: String,

  title:
  {
    type: String,
    index: true
  },


  userId: 
  [{
    type : Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }],
  semesterId: 
  {
    type : Schema.Types.ObjectId,
    ref: 'ClassYear',
    index: true
  },
  projectId: 
  {
    type : Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  }
},{ timestamps: true});

module.exports = mongoose.model('Team', TeamSchema);
