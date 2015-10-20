'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/users', function() {

  it('should not return passwords', function(done) {
    request(app)
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
	expect(res.body["password"]).isEqual(null);
        done();
      });
  });
});
