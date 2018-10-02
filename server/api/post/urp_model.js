'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var URPFormSchema = new Schema({
  title: String,
  content: String,
  userId: 
  {
    type : Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  semesterId: 
  {
    type : Schema.Types.ObjectId,
    ref: 'ClassYear',
    index: true
  },
  uploadURL: 
  {
    type: String,
    ref: '',
    index: true
  }
},{ timestamps: true});

module.exports = mongoose.model('URPForm', URPFormSchema);
