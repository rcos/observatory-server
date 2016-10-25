'use strict';

describe('Controller: AchievementsCtrl', function () {

  // load the controller's module
  beforeEach(module('observatory3App'));

  var AchievementsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AchievementsCtrl = $controller('AchievementsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
