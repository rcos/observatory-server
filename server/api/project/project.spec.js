'use strict';
import {seed} from '../../config/seed';
import {getSessionFor} from '../../auth/util.integration';
import Project from '../project/project.model';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var agent = request.agent(app);
var project = request.agent();

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
  before(seed);
  var studentSession;
  var adminSession;
  before(() => getSessionFor('student').then(session => studentSession = session));
  before(() => getSessionFor('admin').then(session => adminSession = session));

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

  it('Should create a project',done => {
    studentSession
      .post('/api/projects/')
      .send({
        title: "Test Project",
        description: "Testing",
        websiteUrl: "www.google.com"
      })
      .end((err,res) => {
        expect(res.status).to.equal(201);
        done(err);
     });
  });

  it('Should delete a project', done=> {
    var test_id = "000000000000000000000010";
    adminSession
      .delete('/api/projects/'+test_id)
      .end((err,res) => {
        expect(res.status).to.equal(204);
        done(err);
     });
  });

});
