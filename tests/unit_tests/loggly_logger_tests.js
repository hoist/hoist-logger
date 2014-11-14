'use strict';
require('../bootstrap');
var loggly = require('loggly');
var LogglyLogger = require('../../lib/loggly_logger');
var sinon = require('sinon');
var expect = require('chai').expect;
describe('LogglyLogger', function () {
  var stubLoggly ={
    log:sinon.stub(),
    reset:function(){
      this.log.reset();
    }
  };
  var _logger;
  var _clock;
  before(function(){
    _clock = sinon.useFakeTimers(Date.now());
    sinon.stub(loggly,'createClient').returns(stubLoggly);
    _logger = new LogglyLogger();
  });
  afterEach(function(){
    stubLoggly.reset();
  });
  after(function(){
    _clock.restore();
    loggly.createClient.restore();
  });
  it('creates loggly client with correct params',function(){
    return expect(loggly.createClient)
    .to.have.been.calledWith({
      token:'TEST_LOGGLY_TOKEN',
      subdomain:'TEST_LOGGLY_DOMAIN',
      json:true,
      tags:['1','2','hoist-connect']
    });

  });
  describe('#write',function(){
    before(function(){
      return _logger.write({time:Date.now()});
    });
    it('writes log to loggly',function(){
      return expect(stubLoggly.log)
      .to.have.been.calledWith([{timestamp:Date.now()}]);
    });
  });
});
