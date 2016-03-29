'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AttendanceSchema = new Schema({

    classYear: {
      type : Schema.Types.ObjectId,
      ref: 'ClassYear',
      index: true
    },
    user: {
      type : Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },

    date: {
      type: Date,
      index: true
    }, //No time

    datetime: {
      type: Date,
      index: true
    }, //With time

    bonusDay: {
      type: Boolean,
      default: false,
      index: true
    },
    smallgroup: {
      type: Boolean,
      default: false,
      index: true
    },

    verified: {
      type: Boolean,
      default: false,
      index: true
    },
    present: {
      type: Boolean,
      default: true,
      index: true
    }, //TODO: Add marking invalid

    code: {
      type: String,
      index: true
    },

});

module.exports = mongoose.model('Attendance', AttendanceSchema);
