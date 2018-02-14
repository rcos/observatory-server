'use strict';
(function() {
  function castToDates(achievements){
    return achievements.map(function(ach){
      ach.date = new Date(ach.date);
      return ach;
    });
  }

  function AchievementResource($resource, $http) {
    return $resource('/api/achievements/:id/:controller', {
      id: '@_id'
    },{
      query: {
        method: "GET",
        isArray: true,
        transformResponse: $http.defaults.transformResponse.concat(castToDates),

      }
    });
  }

  angular.module('observatory3App')
    .factory('Achievement', AchievementResource);

})();
