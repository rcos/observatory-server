'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/observatory3-dev'
  },

  // Server Address
  addr: "http://localhost:9000",

  // Location of image uploads
  imageUploadPath: './uploads/',

  // For testing verification
  // attendanceVerificationRatio: 1,

  seedDB: false,
  // Github token for worker, local.env.js kept returning undefined but it worked once I added it here...
  GITHUB_WORKER_TOKEN: 'YOUR_KEY',

};
