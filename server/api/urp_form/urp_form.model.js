const mongoose, { Schema } = require('mongoose');

const URPFormSchema = new Schema({
  user_id: {
    type : Schema.Types.ObjectId,
    ref: 'User',
    requred: true
  },
  semester_id: {
    type : Schema.Types.ObjectId,
    ref: 'ClassYear',
    requred: true
  },
  upload_url: {
    type: String,
    index: true,
    required: true
  }
},{ timestamps: true });

module.exports = mongoose.model('URPForm', URPFormSchema);
