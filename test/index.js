
// Register the Babel require hook
require('babel-core/register');

// TODO - load TEST environment here
process.env.NODE_ENV = 'test'

var chai = require('chai');

// Load Chai assertions
global.expect = chai.expect;
global.assert = chai.assert;
chai.should();

// Load Sinon
global.sinon = require('sinon');

// Initialize Chai plugins
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
chai.use(require('chai-things'))

// API tests
require('../server/api/user/user.spec');
// require('../server/api/user/user.controller.spec');
