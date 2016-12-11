'use strict';
import {seed} from '../../config/seed';
import {getSessionFor} from '../../auth/util.integration';

describe('only admin can get day codes', function() {
   before(seed);
   var studentSession, mentorSession;
   before(() => getSessionFor('student').then(session => studentSession = session));
   before(() => getSessionFor('testmentor').then(session => mentorSession = session));
 
   it('should not allow student have access to large day codes', done => {
     studentSession
       .post('/api/classyear/daycode')
       .end((err, res) => {
         expect(res.status).to.equal(403);
         done(err);
       });
   });
 
   it('should not allow mentor access large group day codes ', done => {
     mentorSession
       .post('/api/classyear/daycode')
       .end((err, res) => {
         expect(res.status).to.equal(403);
         done(err);
       });
   }); 
 });