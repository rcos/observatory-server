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

  describe('POST /api/achievements', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/achievements')
        .send({
          name: 'New Achievement',
          info: 'This is the brand new achievement!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          newAchievement = res.body;
          done();
        });
    });

    it('should respond with the newly created achievement', function() {
      expect(newAchievement.name).to.equal('New Achievement');
      expect(newAchievement.info).to.equal('This is the brand new achievement!!!');
    });

  });

  describe('GET /api/achievements/:id', function() {
    var achievement;

    beforeEach(function(done) {
      request(app)
        .get('/api/achievements/' + newAchievement._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          achievement = res.body;
          done();
        });
    });

    afterEach(function() {
      achievement = {};
    });

    it('should respond with the requested achievement', function() {
      expect(achievement.name).to.equal('New Achievement');
      expect(achievement.info).to.equal('This is the brand new achievement!!!');
    });

  });

  describe('PUT /api/achievements/:id', function() {
    var updatedAchievement

    beforeEach(function(done) {
      request(app)
        .put('/api/achievements/' + newAchievement._id)
        .send({
          name: 'Updated Achievement',
          info: 'This is the updated achievement!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedAchievement = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedAchievement = {};
    });

    it('should respond with the updated achievement', function() {
      expect(updatedAchievement.name).to.equal('Updated Achievement');
      expect(updatedAchievement.info).to.equal('This is the updated achievement!!!');
    });

  });

  describe('DELETE /api/achievements/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/achievements/' + newAchievement._id)
        .expect(204)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when achievement does not exist', function(done) {
      request(app)
        .delete('/api/achievements/' + newAchievement._id)
        .expect(404)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
