'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RoomSchema = new Schema({
    name: String,
    loc: String,                        //location
    capacity: int,
    wheelchair_accessible: boolean
},{ timestamps: true});

module.exports = mongoose.model('Room', RoomSchema);
