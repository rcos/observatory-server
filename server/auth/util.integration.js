import app from '../..';
import request from 'supertest';
import superagent from 'superagent';
import {seed} from '../config/seed';

function wrapAuth(auth, req){
  return req.set('Cookie', auth.cookie)
            .set('Authorization', 'Bearer ' + auth.token);
}

exports.getSessionFor = (authInfo) => {
  if (!authInfo.email || !authInfo.password){
    authInfo = {
      email: authInfo + "@" + authInfo + ".com",
      password: authInfo
    };
  }


  return new Promise((resolve, reject) => {
    let agent = superagent.agent();
    agent
      .post('http://127.0.0.1:9000/auth/local')
      .send(authInfo)
      .end((err, res) => {
          if (err) return reject(err);
          let creds = {
              token: res.body.token,
              cookie: res.headers['set-cookie']
          };
          resolve({
            get: function() {
              return wrapAuth(creds, request(app).get.apply(this, arguments));
            },
            post: function() {
              return wrapAuth(creds, request(app).post.apply(this, arguments));
            },
            patch: function() {
              return wrapAuth(creds, request(app).patch.apply(this, arguments));
            },
            delete: function() {
              return wrapAuth(creds, request(app).delete.apply(this, arguments));
            },
            put: function() {
              return wrapAuth(creds, request(app).put.apply(this, arguments));
            }
          });
      });
  });
};

describe("Login Tests", () => {

  before(seed);

  var adminSession, mentorSession, studentSession;

  before(()=>{
    return exports.getSessionFor('admin')
      .then((session) => adminSession = session);
  });

  it('should allow admin to see their information', done =>{
    adminSession.get('/api/users/me').end((err, res) => {
      expect(res.body).to.not.be.empty;
      expect(res.body).to.have.property('email');
      expect(res.body.role).to.equal('admin');
      done(err);
    });
  });

  before(()=>{
    return exports.getSessionFor('mentor')
      .then((session) => mentorSession = session);
  });

  it('should allow mentor to see their information', done =>{
    mentorSession.get('/api/users/me').end((err, res) => {
      expect(res.body).to.not.be.empty;
      expect(res.body).to.have.property('email');
      expect(res.body.role).to.equal('mentor');
      done(err);
    });
  });

  before(()=>{
    return exports.getSessionFor('student')
      .then((session) => studentSession = session);
  });

  it('should allow student to see their information', done =>{
    studentSession.get('/api/users/me').end((err, res) => {
      expect(res.body).to.not.be.empty;
      expect(res.body).to.have.property('email');
      expect(res.body.role).to.equal('student');
      done(err);
    });
  });



});
