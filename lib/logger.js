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
logger.alert = function () {

};
if (config.has('Hoist.raygun') && config.has('Hoist.raygun.enabled') && config.get('Hoist.raygun.enabled')) {
  var raygun = require('raygun');
  var raygunClient = new raygun.Client().init({
    apiKey: config.has('Hoist.raygun.apiKey')
  });
  logger.alert = function (err, applicationId) {
    raygunClient.send(err, {
      hoistApplication: appName,
      applicationId: applicationId
    });
  };
}

module.exports = logger;
