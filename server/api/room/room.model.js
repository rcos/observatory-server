const mongoose, { Schema } = require('mongoose');

const RoomSchema = new Schema({
  name: {
    type: String,
    required: true
  }
  capacity: {
    type: Number,
    required: true
  },
  wheelchair_accessible: {
    type: Boolean
  }
},{ timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
