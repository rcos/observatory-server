const mongoose = require('mongoose')

// // // //

const Notification = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    unique: false
  },
  body: {
    type: String,
    required: true,
    unique: false
  },
  dismissed: {
    type: Boolean
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  },
  // Collection options
  {
    timestamps: {
      createdAt: 'createdOn',
      updatedAt: 'updatedOn'
  },
  versionKey: false
});

// // // //

// Specifying a virtual with a `ref` property is how you enable virtual population
Notification.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true // Only return one User
});


// Same as above just as a method
Notification.methods.getUser = function () {
  return mongoose.model('User').findById(this.user_id);
}


Notification.set('toJSON', { getters: true, virtuals: true });

// // // //

module.exports = mongoose.model('Notification', Notification)
