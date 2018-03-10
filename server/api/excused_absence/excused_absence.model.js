import mongoose from 'mongoose'
import { Schema } from 'mongoose'
import { STATUS_PENDING, STATUS_APPROVED, STATUS_DENIED } from './constants'

// QUESTION - Semester attribute?
// QUESTION - pick date from days with SmallGroup / LargeGroup attendance only
// TODO - `status` attribute - enumerate STATUS_PENDING / STATUS_APPROVED / STATUS_DENIED
const ExcusedAbsenceSchema = new Schema({
  excuse: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  user: {
    type : Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  reviewed_by: {
    type : Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewer_note: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  }
},{ timestamps: true });

module.exports = mongoose.model('ExcusedAbsence', ExcusedAbsenceSchema)
