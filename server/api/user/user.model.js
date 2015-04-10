'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var md5 = require('MD5');
var Commit = require('../commit/commit.model');

var UserSchema = new Schema({
  name: String,
  email: { type: String, lowercase: true },
  active: {type: Boolean, default: true},
  role: {
    type: String,
    default: 'user'
  },
  hashedPassword: String,
  provider: String,
  salt: String,
  tech: [String],
  bio:String,
  attendance: [Date],
  semesterCount: Number,
  avatar: String,

  rin: Number,
  rcsId: String,

  // field for what user is currently enrolled as (pay, credit, experience)
  rcosStyle: String,

  github: {
    events: [{
      type: String,
      action: String,
      message: String,
      date: Date
    }],
    login: {type: String, lowercase: true},
    profile_url: String
  }
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

/**
* Get gravatar url
*
* @return {String}
* @api public
*/
var makeAvatar = function(email) {
  if (email){
    return 'http://www.gravatar.com/avatar/'+md5(email.trim().toLowerCase());
  }
  return  'http://www.gravatar.com/avatar/00000000000000000000000000000000';

};

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    var twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate()-14);
    return {
      '_id':this._id.toString('binary'),
      'name': this.name,
      'email': this.email,
      'active': this.active,
      'role': this.role,
      'avatar': this.avatar || makeAvatar(this.email),
      'semesterCount': this.semesterCount,
      'tech': this.tech,
      'bio': this.bio,
      'github': {
          login: this.github.login,
          profile_url: this.github.profile_url,
          events: this.github.events
      }
      };
  });

  // Public profile information
  UserSchema
    .virtual('info')
    .get(function() {
      var twoWeeks = new Date();
      twoWeeks.setDate(twoWeeks.getDate()-14);
      return {
        '_id':this._id.toString('binary'),
        'name': this.name,
        'email': this.email,
        'active': this.active,
        'role': this.role,
        'avatar': this.avatar || makeAvatar(this.email),
        'semesterCount': this.semesterCount,
        'tech': this.tech,
        'bio': this.bio,
        'github': {
            login: this.github.login,
            profile_url: this.github.profile_url,
            events: this.github.events
        },
        'attendance': this.attendance,

        };
    });

// User list information
UserSchema
  .virtual('stats')
  .get(function() {
      return {
        '_id':this._id.toString('binary'),
        'name': this.name,
        'role': this.role,
        'avatar': this.avatar || makeAvatar(this.email),
        'semesterCount': this.semesterCount,
        'tech': this.tech,
        'github': {
            login: this.github.login,
            profile_url: this.github.profile_url
        }
    }
});

// User list information
UserSchema
  .virtual('listInfo')
  .get(function() {
    return {
      '_id':this._id.toString('binary'),
      'name': this.name,
      'role': this.role,
      'avatar': this.avatar || makeAvatar(this.email),
      'semesterCount': this.semesterCount,
      'tech': this.tech,
      'github': {
          login: this.github.login,
          profile_url: this.github.profile_url
      }
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
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

// Validate empty github.login
UserSchema
  .path('github.login')
  .validate(function(val) {
    return val.length;
  }, 'github login cannot be blank');

// Validate github.login is not taken
UserSchema
  .path('github.login')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({'github.login': value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified github login address is already in use.');


var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    this.avatar = makeAvatar(this.email);
    if (!this.isNew) return next();
    if (!validatePresenceOf(this.hashedPassword))
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
