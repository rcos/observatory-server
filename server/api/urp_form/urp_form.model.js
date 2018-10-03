'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var URPFormSchema = new Schema({
  title: String,
  content: String,
  user_id: 
  {
    type : Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  semester_id: 
  {
    type : Schema.Types.ObjectId,
    ref: 'ClassYear',
    index: true
  },
  upload_url: 
  {
    type: String,
    index: true
  }
},{ timestamps: true});

module.exports = mongoose.model('URPForm', URPFormSchema);
