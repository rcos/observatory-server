'use strict';
(function() {

function UserResource($resource) {
  return $resource('/api/users/:id/:controller', {
    id: '@_id'
  }, {
    deleteUser: {
      method: 'PUT',
      params: {
        controller:'removeUser'
      }
    },
    pastUser: {
      method: 'PUT',
      params: {
        controller:'deactivate'
      }
    },
    currentUser: {
      method: 'PUT',
      params: {
        controller:'activate'
      }
    },
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
