'use strict';
(function() {

function UserResource($resource) {
  return $resource('/api/users/:id/:controller', {
    id: '@_id'
  }, {
    changePassword: {
      method: 'PUT',
      params: {
        controller:'password'
      }
    },
    get: {
      method: 'GET',
      params: {
        id:'me'
      }
    },
    past: {
      method: 'GET',
      params: {
        id:'past'
      },
      isArray:true
    },
    stats: {
      method: 'GET',
      params: {
        controller:'stats'
      },
      isArray:true
    },
    allstats: {
      method: 'GET',
      params: {
        controller:'allstats'
      },
      isArray:true
    }
  });
}

angular.module('observatory3App.auth')
  .factory('User', UserResource);

})();
