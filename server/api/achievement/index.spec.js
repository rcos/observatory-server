'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var achievementCtrlStub = {
  index: 'achievementCtrl.index',
  show: 'achievementCtrl.show',
  create: 'achievementCtrl.create',
  update: 'achievementCtrl.update',
  destroy: 'achievementCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var achievementIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './achievement.controller': achievementCtrlStub
});

describe('Achievement API Router:', function() {

  it('should return an express router instance', function() {
    expect(achievementIndex).to.equal(routerStub);
  });

  describe('GET /api/achievements', function() {

    it('should route to achievement.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'achievementCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /api/achievements/:id', function() {

    it('should route to achievement.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'achievementCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /api/achievements', function() {

    it('should route to achievement.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'achievementCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /api/achievements/:id', function() {

    it('should route to achievement.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'achievementCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('PATCH /api/achievements/:id', function() {

    it('should route to achievement.controller.update', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'achievementCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /api/achievements/:id', function() {

    it('should route to achievement.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'achievementCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
