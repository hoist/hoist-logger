'use strict';
var bunyan = require('bunyan');
var config = require('config');
var LogglyLogger = require('./loggly_logger');
var PubStream = require('bunyan-pub-stream');

var streams = [];
var logLevel = config.has('Hoist.debug') && config.get('Hoist.debug') ? 'debug' : 'info';

if ((!process.env.MUTE_LOGS) && (typeof describe === 'undefined' || process.env.SHOW_LOGS)) {
  streams.push({
    name: 'console',
    level: logLevel,
    stream: process.stdout
  });
}
if (config.has('Hoist.loggly') && config.has('Hoist.loggly.token') && config.has('Hoist.loggly.domain')) {
  var logglyLogLevel = 'warn';
  if (config.has('Hoist.loggly.level')) {
    logglyLogLevel = config.get('Hoist.loggly.level');
  }
  streams.push({
    type: 'raw',
    level: logglyLogLevel,
    stream: new LogglyLogger()
  });
}
if (config.has('Hoist.log.hub') && config.get('Hoist.log.hub')) {
  var pubStream = new PubStream();

  streams.push({
    level: 'debug',
    stream: pubStream
  });
}



var appName = 'no application name set';
if (config.has('Hoist.application.name')) {
  appName = config.get('Hoist.application.name');
}

if (config.has('Hoist.log.logstash')) {
  var logstashStream = {
    type: 'raw',
    stream: require('bunyan-logstash').createStream({
      host: config.get('Hoist.log.logstash.host'),
      port: config.get('Hoist.log.logstash.port'),
      application: appName
    })
  };
  streams.push(logstashStream);
}

var logger = bunyan.createLogger({
  name: appName,
  streams: streams
});
logger.alert = function () {

};
logger.keen = function () {

};
if (config.has('Hoist.raygun.enabled') && config.get('Hoist.raygun.enabled')) {
  var raygun = require('raygun');
  var raygunClient = new raygun.Client().init({
    apiKey: config.get('Hoist.raygun.apiKey')
  });
  logger.alert = function (err, applicationId, customData) {
    customData = customData || {};
    customData.hoistApplication = appName;
    customData.applicationId = applicationId;
    raygunClient.send(err, customData);
  };
}

var originalChildFn = logger.child;
logger.child = function () {
  var childLogger = originalChildFn.apply(this, arguments);
  childLogger.alert = logger.alert;
  return childLogger;
};

module.exports = logger;
