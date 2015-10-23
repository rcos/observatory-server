'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('POST /auth/createUser', function() {
    it('should respond with JSON array', function(done) {
	var postData = {
	    "user":{}
	};

	request(app)
	    .post('/auth/createUser')
	    .send(postData)
	    .expect(200)
	    .end(function(err, res) {
		if(err) return done(err);
		res.body.should.be.instanceof(Array);
		done();
	    });
    });
});