'use strict';

var app = require('../..');
var request = require('supertest');

var newAchievement;

describe('Achievement API:', function() {

  describe('GET /api/achievements', function() {
    var achievements;

    beforeEach(function(done) {
      request(app)
        .get('/api/achievements')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          achievements = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(achievements).to.be.instanceOf(Array);
    });

  });
});
