/**
 * Main application routes
 */

'use strict';

var express = require('express');
var config = require('./config/environment');
import errors from './components/errors';
import path from 'path';

export default function(app) {

  // Insert routes below
  app.use('/api/posts', require('./api/post'));
  app.use('/api/projects', require('./api/project'));
  app.use('/api/commits', require('./api/commit'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/classyear', require('./api/classyear'));
  app.use('/api/smallgroup', require('./api/smallgroup'));

  app.use('/uploads', express.static(config.imageUploadPath));

  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets|uploads)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
}
