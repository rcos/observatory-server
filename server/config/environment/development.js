'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    // uri: 'mongodb://localhost/observatory-dev'
    // uri: 'mongodb://localhost/observatory3-dev'
    uri: 'mongodb://192.168.99.100:27017/observatory3-dev'
  },

  // Server Address
  addr: "http://localhost:9000",

  // Location of image uploads
  imageUploadPath: './uploads/',

  // For testing verification
  // attendanceVerificationRatio: 1,

  seedDB: false
};
