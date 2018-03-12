'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

// TODO - these tests must be updated to accommodate ExcusedAbsence API requests
describe('GET /project/name/:username/:project', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/posts/project/name/RCOS/Observatory')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});
