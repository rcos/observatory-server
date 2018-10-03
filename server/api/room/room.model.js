'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RoomSchema = new Schema({
    name: {
       type: String,
       required: true
    }
    capacity: Number,
    wheelchair_accessible: boolean
},{ timestamps: true});

module.exports = mongoose.model('Room', RoomSchema);
