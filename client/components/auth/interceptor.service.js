'use strict';

(function() {

function authInterceptor($rootScope, $q, $cookieStore, $injector, Util) {
  var state;
  return {
    // Add authorization token to headers
    request(config) {
      config.headers = config.headers || {};
      if ($cookieStore.get('token') && Util.isSameOrigin(config.url)) {
        config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
      }
      return config;
    },

    // Intercept 401s and redirect you to login
    responseError(response) {
      if (response.status === 401) {
        (state || (state = $injector.get('$state'))).go('login', {referrer: state.current.url});
        // remove any stale tokens
        $cookieStore.remove('token');
      }
      return $q.reject(response);
    }
  };
}

angular.module('observatory3App.auth')
  .factory('authInterceptor', authInterceptor);

})();
