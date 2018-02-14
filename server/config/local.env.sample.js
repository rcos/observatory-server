'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN:           'http://localhost:9000',
  SESSION_SECRET:   'observatory3-secret',

  FACEBOOK_ID:      'app-id',
  FACEBOOK_SECRET:  'secret',

  GOOGLE_ID:        'app-id',
  GOOGLE_SECRET:    'secret',

  SERVER_ADDRESS: 'http://localhost:9000',
  SENDGRID_API_KEY: 'YOUR_KEY',

  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
