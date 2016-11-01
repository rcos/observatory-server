'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var agent = request.agent(app);
var project = request.agent();
var studentSession;

describe('GET /api/projects', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/projects')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('GET /api/projects/past', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/projects/past')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('POST /api/projects/', function() {
  it('Should create a session', function(done) {
    agent.post('/api/users')
    .send({ username: 'a@yahoo.com', password: '123' })
    .expect('Content-Type',/json/)
    .end(function(err, res) {
      expect(res.status).to.equal(200);
      done();
    });
  });

  it('Should return the current session', function(done) {
    agent.get('/api/projects').end(function(err, res) {
      expect(res.status).to.equal(200);
      done();
    });
  });
});
