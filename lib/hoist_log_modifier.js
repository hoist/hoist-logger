'use strict';
var BBPromise = require('bluebird');
module.exports = function(logObject){
  return BBPromise.resolve(logObject);
};
