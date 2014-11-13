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
var logger = bunyan.createLogger({
  name: config.get('Hoist.application.name'),
  streams: streams
});


module.exports = logger;
