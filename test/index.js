
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
require('../server/api/attendance/attendance.spec');
require('../server/api/attendance/attendance.integration');
require('../server/api/classyear/classyear.spec');
require('../server/api/commit/commit.spec');
require('../server/api/post/post.spec');
require('../server/api/project/project.spec');
require('../server/api/smallgroup/smallgroup.spec');
require('../server/api/static/static.spec');
require('../server/api/user/index.spec');
require('../server/api/user/user.controller.spec');
require('../server/api/user/user.integration');
require('../server/api/user/user.model.spec');
require('../server/api/user/user.spec');
