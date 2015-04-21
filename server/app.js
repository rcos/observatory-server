/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
var mkdirp = require('mkdirp');
var fs = require('fs');

var tmp = '/var/www/tmp';
var uploads = '/var/www/tmp';

if(!fs.existsSync(tmp)){
	if(!mkdirp.sync(tmp)){
		console.log("Could not create temp directory!");
	}
}

process.env.TMPDIR = tmp;

if(!fs.existsSync(uploads)){
	if(!mkdirp.sync(uploads)){
		console.log("Could not create uploads directory!");
	}
}

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;