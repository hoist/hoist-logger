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
logger.keen = function () {

};
if (config.has('Hoist.raygun.enabled') && config.get('Hoist.raygun.enabled')) {
  var raygun = require('raygun');
  var raygunClient = new raygun.Client().init({
    apiKey: config.get('Hoist.raygun.apiKey')
  });
  logger.alert = function (err, applicationId,customData) {
    customData = customData || {};
    customData.hoistApplication=appName;
    customData.applicationId = applicationId;
    raygunClient.send(err, customData);
  };
}
if (config.has('Hoist.keenio.projectId') && config.has('Hoist.keenio.writeKey')) {
  var Keen = require('keen.io');
  var keenClient = Keen.configure({
    projectId: config.get('Hoist.keenio.projectId'),
    writeKey: config.get('Hoist.keenio.writeKey')
  });
  logger.keen = function (eventName, eventDetails) {
    keenClient.addEvent(eventName, eventDetails, function (err, res) {
      if (err) {
        logger.error(err);
      }
      logger.info({
        res: res,
        err: err
      }, 'logged to keen');
    });
  };
}

module.exports = logger;
