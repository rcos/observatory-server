'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var superagent = require('superagent');
var agent = request.agent(app);

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
    .set({ username: 'admin', password: 'admin','submit':'LOGIN',})
    .end(function(err, res) {
      expect(res.status).to.equal(200);
      done();
    });
  });
  
   it('should return a 200 for adding a project', function(done){
    agent
      .post('/api/projects/')
      .send({'name':'Observe','description':'cool project','websiteUrl': 'https://rcos.io','githubUsername':'rcos','githubProjectName':'Observatory3', 
})
      .expect(200)
      .end(function(err,res){
         if(err) return done(err);
     });
  });
   it('Should return the current session', function(done) {
    agent.get('/api/projects').end(function(err, res) {
      expect(res.status).to.equal(200);
      done();
    });
  });

});

function loginUser(){
  return function(done){
  }
}