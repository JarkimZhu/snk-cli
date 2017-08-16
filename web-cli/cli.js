'use strict';

require('graceful-fs').gracefulify(require('fs'));

require('./setupBabel')();

var init = require('./init');

module.exports = {
  init: init
};