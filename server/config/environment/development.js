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

  sendgridApiKey: process.env.SENDGRID_API_KEY || '',

  seedDB: false
};
