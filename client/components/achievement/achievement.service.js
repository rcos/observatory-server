'use strict';
(function() {

  function AchievementResource($resource) {
    return $resource('/api/achievements/:id/:controller', {
      id: '@_id'
    },{
    });
  }

  angular.module('observatory3App')
    .factory('Achievement', AchievementResource);

})();
