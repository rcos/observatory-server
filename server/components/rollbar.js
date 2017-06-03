'use strict';

import config from '../config/environment';
import Rollbar from 'rollbar';

var rollbar = new Rollbar({
  accessToken: config.rollbarServerAccessToken,
});

module.exports = rollbar;
