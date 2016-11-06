'use strict';

describe('Directive: additionalRepos', function () {

  // load the directive's module and view
  beforeEach(module('observatory3App'));
  beforeEach(module('components/additionalRepos/additional-repos.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

});
