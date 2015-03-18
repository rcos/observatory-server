'use strict';

angular.module('observatory3App')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
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
