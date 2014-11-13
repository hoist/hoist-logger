'use strict';
var bunyan = require('bunyan');
var config = require('config');
var LogglyLogger = require('./loggly_logger');

var streams = [];
var logLevel = config.has('Hoist.debug') && config.get('Hoist.debug') ? 'debug' : 'info';

if (typeof describe === 'undefined') {
  streams.push({
    name: 'console',
    level: logLevel,
    stream: process.stdout
  });
}
if (config.has('Hoist.loggly')) {
  streams.push({
    type: 'raw',
    stream: new LogglyLogger()
  });
}
var appName = 'no application name set';
if (config.has('Hoist.application.name')) {
  appName = config.get('Hoist.application.name');
}
var logger = bunyan.createLogger({
  name: appName,
  streams: streams
});


module.exports = logger;
