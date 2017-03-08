'use strict';
import {seed} from '../../config/seed';
import {getSessionFor} from '../../auth/util.integration';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var faker = require("fakerator")();

describe('GET /api/users/past', function () {

  it('should respond with JSON array', function (done) {
    request(app)
      .get('/api/users/past')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('getting another user as student', function () {
  before(seed);
  var studentSession;
  before(() => getSessionFor('student').then(session => studentSession = session));

  it('should not allow student to view the other\'s private info', done => {
    var userId = "000000000000000000000400";

    studentSession
      .get('/api/users/' + userId + '/private')
      .end((err, res) => {
        expect(res.status).to.equal(403);
        done(err);
      });
  });

  it('public profile should not contain private info ', done => {
    var userId = "000000000000000000000400";

    studentSession
      .get('/api/users/' + userId)
      .end((err, res) => {
        should.not.exist(res.body.attendance);
        expect(res.status).to.equal(200);
        done();
      });
  });
});
describe('POST /api/users/', function () {
  before(seed);

  it('Should create a user', done => {
    request(app)
      .post('/api/users/')
      .send({
        "name": faker.names.name(),
        "email": faker.internet.email(),
        "github": {"login": faker.internet.userName()},
        "password": "test"
      })
      .end((err, res) => {
        expect(res.status).to.equal(201);
        done(err);
      });
  });

  it('Attempt to create a user with invalid email', done => {
    var p = {
      "name": faker.names.name(),
      "email": faker.internet.userName(),
      "github": {"login": faker.internet.userName()},
      "password": "test"
    };
    console.log(p);
    request(app)
      .post('/api/users/')
      .send(p)
      .end((err, res) => {
        expect(res.status).to.equal(201);
        done(err);
      });
  });

  it('Attempt to create a user with no password', done => {
    request(app)
      .post('/api/users/')
      .send({
        "name": faker.names.name(),
        "email": faker.internet.email(),
        "github": {"login": faker.internet.userName()},
        "password": ""
      })
      .end((err, res) => {
        expect(res.status).to.equal(422);
        done(err);
      });
  });
});
