'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/users/past', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/users/past')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});


describe('POST /api/users/', function() {
    it('should respond with JSON array', function(done) {
	//Create a user object without any of the required fields
	var postData = {
	    "user":{}
	};

	request(app)
	    .post('/api/users/')
	    .send(postData)
	    .expect(422)
	    .end(function(err, res) {
		if(err) return done(err);
		//res.body.should.be.instanceof(Array);
		done();
	    });
    });
});
