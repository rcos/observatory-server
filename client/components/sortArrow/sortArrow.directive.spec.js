'use strict';

describe('Directive: sortArrow', function () {

  // load the directive's module and view
  beforeEach(module('observatory3App'));
  beforeEach(module('components/sortArrow/sortArrow.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

});
