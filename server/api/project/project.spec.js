'use strict';
import {seed} from '../../config/seed';
import {getSessionFor} from '../../auth/util.integration';
import Project from '../project/project.model';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var agent = request.agent(app);
var project = request.agent();
var test_id = "000000000000000000000010";

describe('GET /api/projects', function () {

  it('should respond with JSON array', function (done) {
    request(app)
      .get('/api/projects')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });

  it('should show all the default projects', function (done) {
    request(app)
      .get('/api/projects/defaults')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('GET /api/projects/past', function () {

  it('should respond with JSON array', function (done) {
    request(app)
      .get('/api/projects/past')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('POST /api/projects/', function () {
  before(seed);
  var studentSession;
  var adminSession;

  before(() => getSessionFor('student').then(session => studentSession = session));
  before(() => getSessionFor('admin').then(session => adminSession = session));

  it('Should return the current session', function (done) {
    agent.get('/api/projects').end(function (err, res) {
      expect(res.status).to.equal(200);
      done();
    });
  });

  it('Should create a project', done => {
    studentSession
      .post('/api/projects/')
      .send({
        title: "Test Project",
        description: "Testing",
        websiteUrl: "www.google.com"
      })
      .end((err, res) => {
        expect(res.status).to.equal(201);
        done(err);
      });
  });

  it('Should mark a default project', done => {
    adminSession
      .put('/api/projects/' + test_id + '/markdefault')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done(err);
      });
  });

  it('Should unmark a default project', done => {
    adminSession
      .put('/api/projects/' + test_id + '/unmarkdefault')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done(err);
      });
  });

  it('Should mark a current project', done => {
    adminSession
      .put('/api/projects/' + test_id + '/markActive')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done(err);
      });
  });

  it('Should mark a past project', done => {
    adminSession
      .put('/api/projects/' + test_id + '/markPast')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done(err);
      });
  });

  it('Should delete a project', done => {
    adminSession
      .delete('/api/projects/' + test_id)
      .end((err, res) => {
        expect(res.status).to.equal(204);
        done(err);
      });
  });

  it('Should attempt to create a project with no authentication', done => {
    agent
      .post('/api/projects/')
      .send({
        title: "Test Project",
        description: "Testing",
        websiteUrl: "www.google.com"
      })
      .end((err, res) => {
        // HTTP 401 = Unauthorized
        expect(res.status).to.equal(401);
        done(err);
      });
  });

});
