const mongoose = require('mongoose');

const UserRegistrationSchema = new mongoose.Schema({
  
  user_id: {
    type : Schema.Types.ObjectId,
    ref: 'User',
    requred: true
  },
  project_id: {
    type : Schema.Types.ObjectId,
    ref: 'Project',
    requred: true
  },
  semester_id: {
    type : Schema.Types.ObjectId,
    ref: 'Semester',
    requred: true
  },
  rin: {
    type: String,
    required: true
  },
  credits: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  schedule_conflict: {
    type: Boolean,
  },
  has_completed_urp_form: {
    type: Boolean,
  },
  requires_wheelchair_accessible_room: {
    type: Boolean,
  },
  mentor_preferences: {
    type: [Schema.Types.ObjectId],
    ref: 'User'
    required: true
  }
},{ timestamps: true });

module.exports = mongoose.model('UserRegistration', UserRegistrationSchema);
