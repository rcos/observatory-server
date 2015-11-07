'use strict';

angular.module('observatory3App')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      deleteUser: {
        method: 'PUT',
        params: {
          controller:'removeUser'
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
  });
