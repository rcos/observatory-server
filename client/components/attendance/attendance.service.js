'use strict';

angular.module('observatory3App')
.factory('Attendance', function($resource) {
  return $resource('/api/attendance/:id/:controller/:options', {
    id: '@_id'
  }, {
    get: {
      method: 'GET',
      isArray:true
    },
    getUser: {
      method: 'GET',
    },
    delete: {
      method: 'DELETE',
    },
    attend: {
      method: 'POST',
      params: {
        controller:'attend'
      },
    },
    present: {
      method: 'GET',
      params: {
        controller:'present'
      }
    },
    userPresent: {
      method: 'GET',
      params: {
        controller:'present'
      },
    },
    verify: {
      method: 'put',
      params: {
        controller:'verify'
      },
    },
    setFull: {
      method: 'post',
      params: {
        controller:'attend',
        options:'full'
      },
    },
    setSmall: {
      method: 'post',
      params: {
        controller:'attend',
        options:'small'
      },
    },
    setFullBonus: {
      method: 'post',
      params: {
        controller:'attend',
        options:'fullBonus'
      },
    },
    setSmallBonus: {
      method: 'post',
      params: {
        controller:'attend',
        options:'smallBonus'
      },
    },
    unverified: {
      method: 'GET',
      params: {
        id: '@_date',
        controller:'unverified'
      },
      isArray:true
    },
    unverifiedFull: {
      method: 'GET',
      params: {
        id: '@_date',
        controller:'unverified',
        options:'full'
      },
      isArray:true
    },
    unverifiedSmall: {
      method: 'GET',
      params: {
        id: '@_date',
        controller:'unverified',
        options:'small'
      },
      isArray:true
    },
    attendees: {
      method: 'GET',
      params: {
        id: '@_code',
        controller:'attendees'
      },
      isArray:true
    },

  });
});
