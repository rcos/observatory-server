'use strict';

var crypto = require('crypto');
var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var md5 = require('md5');
var Project = require('../project/project.model');
var util = require('../../components/utilities')

// // // //

// Crypto library variables
const defaultIterations = 10000;
const defaultKeyLength = 64;
const defaultDigest = 'sha512';

// // // //
var UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    lowercase: true,
    index: true
  },

  active: {
    type: Boolean,
    default: true,
    index: true
  },

  role: {
    type: String,
    default: 'user',
    index: true
  },

  tech: [String],

  projects: [{
    type : Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  }], // project id

  favoriteProjects: [{
    type : Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  }], // project id

  bio: String,

  password: {
    type: String,
    select: false
  },

  hashedPassword: {
    type: String,
    select: false
  },

  provider: {
    type: String,
    select: false
  },

  salt: {
    type: String,
    select: false
  },

  passwordResetToken: {
    type: String,
    select: false
  },

  passwordResetExpiration: {
    type: Date,
    select: false
  },

  // field for what user is currently enrolled as (pay, credit, experience)
  rcosStyle: String,

  github: {
    events: [{
      type: String,
      action: String,
      message: String,
      url: String,
      date: Date
    }],
    login: {type: String, lowercase: true, index: true},
    profile: String,
},
  facebookLogin: {},
  googleLogin: {},
  githubLogin: {}

},{ timestamps: true});
UserSchema.set('toJSON', {
  transform: function(doc, ret, options) {
      ret.avatar = doc.avatar;
      return ret;
  }
});

/**
 * Virtuals
 */


/**
* Get gravatar url
*
* @return {String}
* @api public
*/
var makeAvatar = function(email) {
  if (email){
    return '//www.gravatar.com/avatar/'+md5(email.trim().toLowerCase())+"?d=identicon";
  }
  return  '//www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon';

};

UserSchema
  .virtual('avatar')
  .get(function(){
    return makeAvatar(this.email) ;
});


// Represents a users attendance on a given day
UserSchema
  .virtual('presence')
  .get(function(){
    var today = util.convertToMidnight(new Date());
    var i = 0;
    for (i = 0;i < this.attendance.length;i++){
      if (util.dateToTime(this.attendance[i]) === today){
        return "present";
      }
    }
    for (i = 0;i < this.unverifiedAttendance.length;i++){
      if (util.dateToTime(this.unverifiedAttendance[i]) === today){
        return "unverified";
      }
    }
    return "absent";
  })
  .set(function(status){
    var today = util.convertToMidnight(new Date());
    var i = 0;
    if (status === "present"){
      // Make sure user is not unverified for today
      for (i = this.unverifiedAttendance.length-1;i >= 0;i--){
        if (util.dateToTime(this.unverifiedAttendance[i]) === today){
           this.unverifiedAttendance.splice(i,1);
        }
      }
      // If user already has attendance don't change anything
      for (i = 0;i < this.attendance.length;i++){
        if (util.dateToTime(this.attendance[i]) === today){
          return;
        }
      }
      this.attendance.push(today);
    }else if (status === "unverified"){
      // If user already has attendance remove their attendance
      for (i = this.attendance.length-1;i >= 0;i--){
        if (util.dateToTime(this.attendance[i]) === today){
          this.attendance.splice(i,1);
        }
      }

      // See if user already is unverifed
      for (i = 0;i < this.unverifiedAttendance.length;i++){
        if (util.dateToTime(this.unverifiedAttendance[i]) === today){
          return;
        }
      }

      this.unverifiedAttendance.push(today);
    }else if (status === "absent"){
      // Remove attendance from unverified and attendance
      for (i = this.attendance.length-1;i >= 0;i--){
        if (util.dateToTime(this.attendance[i]) === today){
          this.attendance.splice(i,1);
        }
      }
      for (i = this.unverifiedAttendance.length-1;i >= 0;i--){
        if (util.dateToTime(this.unverifiedAttendance[i]) === today){
           this.unverifiedAttendance.splice(i,1);
        }
      }
    }
    this.save();
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      '_id':this._id.toString(),
      'name': this.name,
      'role': this.role,
      'active': this.active,
      'avatar': this.avatar,
      'email': this.email,
      'semesters': this.semesterCount,
      'projects': this.projects,
      'tech': this.tech,
      'bio': this.bio,
      'githubProfile': this.github.login
    };
  });

 UserSchema
   .virtual('privateProfile')
   .get(function() {
     return {
       '_id':this._id.toString(),
       'name': this.name,
       'email': this.email,
       'active': this.active,
       'role': this.role,
       'tech': this.tech,
       'avatar': this.avatar,
       'projects': this.projects,
       'favoriteProjects': this.favoriteProjects,
       'bio': this.bio,
       'semesters': this.semesterCount,
       'rcosStyle': this.rcosStyle,
       'githubProfile': this.github.login
     };
   });

UserSchema
  .virtual('stats')
  .get(function() {
    var data = this.toObject();
    data.avatar = this.avatar;
  return data;
});

// User list information
UserSchema
  .virtual('listInfo')
  .get(function() {
    return {
      '_id':this._id.toString(),
      'name': this.name,
      'role': this.role,
      'avatar': this.avatar,
      'githubProfile': this.github.login,
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

// Helper Virtual for isAdmin
UserSchema
  .virtual('isAdmin')
  .get(function(){
      return this.role === 'admin';
  });

// Helper Virtual for isAdmin
UserSchema
  .virtual('isMentor')
  .get(function(){
    return this.role === 'admin' || this.role === 'mentor';
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('password')
  .validate(function(password) {
    return password.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    return this.constructor.findOneAsync({ email: value })
      .then(function(user) {
        if (user) {
          if (self.id === user.id) {
            return respond(true);
          }
          return respond(false);
        }
        return respond(true);
      })
      .catch(function(err) {
        throw err;
      });
  }, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
* Pre-save hook
*/
UserSchema
.pre('save', function(next) {
    // Handle new/update passwords
    if (!this.isModified('password')) {
        return next();
    }
    if (validatePresenceOf(this.hashedPassword) ) {
      this.hashedPassword = undefined;
    }
    if (!(validatePresenceOf(this.password) )&& authTypes.indexOf(this.provider) === -1) {
        next(new Error('Invalid password'));
    }
    // Make salt with a callback
    this.makeSalt((saltErr, salt) => {
        if (saltErr) {
            next(saltErr);
        }
        this.salt = salt;
        this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
            if (encryptErr) {
                next(encryptErr);
            }
            this.password = hashedPassword;
            next();
        });
    });
});


function loadUserProjects(user, callback){
    // If the user doesn't have any projects, return
    if (user.projects.length === 0){
        return callback([]);
    }
    // Otherwise load all the user projects
    var fullProjects = [];
    var loadedProjects = 0;
    var loadProject = function(err, project) {
      loadedProjects ++;
      if (!err) fullProjects.push(project);
      if (loadedProjects === user.projects.length){
        return callback(fullProjects);
      }
    }

    for (var i = 0;i < user.projects.length;i++){
        Project.findById(user.projects[i], loadProject);
    }
}

/**
 * Methods
 */
UserSchema.methods = {
  /**
  * Authenticate - check if the passwords are the same
  * Also changes save method of the password if using an outdated one
  * @param {String} password
  * @param {Function} callback
  * @return {Boolean}
  * @api public
  */
  authenticate(password, callback) {
    if (!validatePresenceOf(this.password) && validatePresenceOf(this.hashedPassword)){
      if (this.hashedPassword === this.encryptPasswordOld(password)){
        // Update passord in DB to new ecryption method

        this.hashedPassword = undefined;
        this.password = password; // Set the password field
        this.save(); //Call the save pre-hooks (and re-encrypt the password)

        if (!callback) {
          return true;
        }
        else{
          return callback(null, true);
        }
      }
    }
    if (!callback) {
      return (this.password === this.encryptPassword(password));
    }
    this.encryptPassword(password, (err, pwdGen) => {
      if (err) {
        return callback(err);
      }

      if (this.password === pwdGen) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    });
  },

  /**
   * Return true if the reset token is valid for this user
   *
   * @param {String} token
   * @return {Boolean}
   */
  validResetToken: function(token){
    return this.passwordResetToken === token && new Date() < this.passwordResetExpiration;
  },

  /**
   * Make salt
   *
   * @param {Number} byteSize Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt(byteSize, callback) {
    var defaultByteSize = 16;

    if (typeof arguments[0] === 'function') {
      callback = arguments[0];
      byteSize = defaultByteSize;
    } else if (typeof arguments[1] === 'function') {
      callback = arguments[1];
    }

    if (!byteSize) {
      byteSize = defaultByteSize;
    }

    if (!callback) {
      return crypto.randomBytes(byteSize).toString('base64');
    }

    return crypto.randomBytes(byteSize, (err, salt) => {
      if (err) {
        callback(err);
      } else {
        callback(null, salt.toString('base64'));
      }
    });
  },

  /**
   * Encrypt password (Old method)
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPasswordOld: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, defaultDigest).toString('base64');
  },

 /**
  * Encrypt password
  *
  * @param {String} password
  * @param {Function} callback
  * @return {String}
  * @api public
  */
 encryptPassword: function(password, callback) {
    if (!password || !this.salt) {
      return null;
    }

    var salt = new Buffer(this.salt, 'base64');
    if (!callback) {
      return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, defaultDigest).toString('base64');
    }

    return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, defaultDigest, (err, key) => {
      if (err) {
        callback(err);
      } else {
        callback(null, key.toString('base64'));
      }
    });
  },

  /**
   * Populating projects is preferred
   * Gets the full user profile (includes full projects, instead of just ids)
   *
   * @param {Function(JSON)} callback - Called when all full profile properties
   *        have been loaded
   * @api public
   */
  getFullProfile: function(callback) {
     var user = this;
     loadUserProjects(user, function(fullProjects){
         callback({
           '_id': user._id.toString('binary'),
           'name': user.name,
           'role': user.role,
           'avatar': user.avatar,
           'active': user.active,
           'email': user.email,
           'semesters': user.semesterCount,
           'projects': fullProjects,
           'tech': user.tech,
           'bio': user.bio,
           'githubProfile': user.github.login
       });
     });
  },

  /**
   * Gets the number of days there has been attendance for the user
   *
   * @param classYear object
   * @api public
   */
  getTotalDays: function(classYear, smallgroup){
    var user = this;
    var res = {};
    res.totalDates = classYear.dates;
    res.totalBonusDates = classYear.bonusDates;
    if (smallgroup && smallgroup.dates){
      res.totalSmallDates = smallgroup.dates;
      res.totalBonusSmallDates = smallgroup.bonusDates;
    }
    else{
      res.totalSmallDates = [];
      res.currentSmallAttendance = [];
    }
    return res;
  }
};

module.exports = mongoose.model('User', UserSchema);
