'use strict';
import {seed} from '../../config/seed';
import {getSessionFor} from '../../auth/util.integration';
import Smallgroup from './smallgroup.model';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('Adding and removing users from small group as a mentor', function() {
  before(seed);
  var mentorSession;
  var id;
  before(() => getSessionFor('testmentor').then(session => mentorSession = session));

  it('should allow a user to be added to a smallgroup', done => {
    var smallGroupId = "000000000000000000001000";
    var userId = "000000000000000000000700";

    mentorSession
      .put('/api/smallgroup/' + smallGroupId + '/member')
      .send({
        'memberId': userId
      })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done(err);
      });
  });

  it('should allow a mentor to remove a user from a smallgroup', done => {
    var smallGroupId = "000000000000000000001000";
    var userId = "000000000000000000000600";

    mentorSession
      .delete('/api/smallgroup/' + smallGroupId + '/member/' + userId)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done(err);
      });
  });
});

describe('Adding and removing users from small group as a mentor', function() {
  before(seed);
  var studentSession;
  var id;
  before(() => getSessionFor('student').then(session => studentSession = session));

  it('should allow a student to remove themselves from a smallgroup', done => {
    var smallGroupId = "000000000000000000001000";
    var userId = "000000000000000000000300";

    studentSession
      .delete('/api/smallgroup/' + smallGroupId + '/member/' + userId)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done(err);
      });
  });

  it('should not allow a student to remove others from a smallgroup', done => {
    var smallGroupId = "000000000000000000001000";
    var userId = "000000000000000000000600";

    studentSession
      .delete('/api/smallgroup/' + smallGroupId + '/member/' + userId)
      .end((err, res) => {
        expect(res.status).to.equal(403);
        Smallgroup.findById(smallGroupId, function(err, smallgroup) {
          if (err) {
            done(err);
          }
          var index = smallgroup.students.indexOf(userId);
          expect(index).to.be.above(-1);
          done();
        });
      });
  });
});
