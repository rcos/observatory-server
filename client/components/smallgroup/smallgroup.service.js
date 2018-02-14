'use strict';
(function() {

  function SmallgroupResource($resource) {
    return $resource('/api/smallgroup/:smallgroupId/:controller/:id', {
      smallgroupId: '@_id'
    },{
      createDaycode: {
        method: 'POST',
        params: {
          controller: 'daycode',
        }
      },
      deleteDaycode: {
        method: 'DELETE',
        params: {
          controller: 'daycode',
          id: '@daycode'
        }
      },
      addMember: {
        method: 'PUT',
        params: {
          controller: 'member',
        }
      },
      removeMember: {
        method: 'DELETE',
        params: {
          controller: 'member',
        }
      },
      setName: {
        method: 'PUT',
        params: {
          controller: 'name'
        }
      }
    });
  }

  angular.module('observatory3App')
    .factory('Smallgroup', SmallgroupResource);
})();
