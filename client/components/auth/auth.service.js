'use strict';
(function() {
function AuthService($location, $http, $cookieStore, $q, appConfig, Util, User) {
    var currentUser = {};
    var safeCb = Util.safeCb;
    var currentUser = {};
    var smallgroup = {};
    var userRoles = appConfig.userRoles || [];
    if ($cookieStore.get('token') && $location.path() !== '/logout') {
      currentUser = User.get();
       User.smallgroup().$promise.then(function (data){
         smallgroup = data;
       })
    }

    function isLoggedInAsync(cb) {
      if(currentUser.hasOwnProperty('$promise')) {
        currentUser.$promise.then(function() {
          cb(true);
        }).catch(function() {
          cb(false);
        });
      } else if(currentUser.hasOwnProperty('role')) {
        cb(true);
      } else {
        cb(false);
      }
    }
  var Auth = {

      /**
       * Authenticate user via reset token and save session token
       *
       * @param  {String}   resetToken
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      loginWithResetToken: function(resetToken, callback) {
        return $http.post('/auth/local/token', {
          token: resetToken
        })
          .then(res => {
            $cookieStore.put('token', res.data.token);
            currentUser = User.get();
            return currentUser.$promise;
          })
          .then(user => {
            safeCb(callback)(null, user);
            return user;
          })
          .catch(err => {
            Auth.logout();
            safeCb(callback)(err.data);
            return $q.reject(err.data);
          });
      },


    /**
     * Authenticate user and save token
     *
     * @param  {Object}   user     - login info
     * @param  {Function} callback - optional, function(error, user)
     * @return {Promise}
     */
    login({email, password}, callback) {
      return $http.post('/auth/local', {
        email: email,
        password: password
      })
        .then(res => {
          $cookieStore.put('token', res.data.token);
          currentUser = User.get();
          return currentUser.$promise;
        })
        .then(user => {
          safeCb(callback)(null, user);
          return user;
        })
        .catch(err => {
          Auth.logout();
          safeCb(callback)(err.data);
          return $q.reject(err.data);
        });
    },
    /**
     * Delete access token and user info
     */
    logout() {
      $cookieStore.remove('token');
      currentUser = {};
    },
    /**
     * Create a new user
     *
     * @param  {Object}   user     - user info
     * @param  {Function} callback - optional, function(error, user)
     * @return {Promise}
     */
    createUser(user, callback) {
      return User.save(user,
        function(data) {
          $cookieStore.put('token', data.token);
          currentUser = User.get();
          return safeCb(callback)(null, user);
        },
        function(err) {
          Auth.logout();
          return safeCb(callback)(err);
        }).$promise;
    },
    /**
     * Change password
     *
     * @param  {String}   oldPassword
     * @param  {String}   newPassword
     * @param  {Function} callback    - optional, function(error, user)
     * @return {Promise}
     */
    changePassword(oldPassword, newPassword, callback) {
      return User.changePassword({ id: currentUser._id }, {
        oldPassword: oldPassword,
        newPassword: newPassword
      }, function() {
        return safeCb(callback)(null);
      }, function(err) {
        return safeCb(callback)(err);
      }).$promise;
    },

    /**
    * Change password using token
    *
    * @param  {String}   token
    * @param  {String}   newPassword
    * @param  {Function} callback    - optional
    * @return {Promise}
    */
    changePasswordWithToken: function(token, newPassword, callback) {
        return User.changePassword({ id: currentUser._id }, {
            token: token,
            newPassword: newPassword
        }, function() {
            return safeCb(callback)(null);
        }, function(err) {
            return safeCb(callback)(err);
        }).$promise;
    },

    /**
     * Gets all available info on a user
     *   (synchronous|asynchronous)
     *
     * @param  {Function|*} callback - optional, funciton(user)
     * @return {Object|Promise}
     */
    getCurrentUser(callback) {
      if (arguments.length === 0) {
        currentUser.smallgroup = smallgroup._id !== undefined;
        return currentUser;
      }
      var value = (currentUser.hasOwnProperty('$promise')) ?
        currentUser.$promise : currentUser;
      return $q.when(value)
        .then(user => {
          safeCb(callback)(user);
          return user;
        }, () => {
          safeCb(callback)({});
          return {};
        });
    },
    /**
     * Marks a user as a inactive user
     *   (asynchronous)
     *
     * @param {Object} user
     * @param  {Function|*} callback - optional, funciton(user)
     * @return {Object|Promise}
     */
    pastUser: function(user,callback){
      return User.pastUser({ id: user._id }, {
      }, function(user) {
        return safeCb(callback)(user);
      }, function(err) {
        return safeCb(callback)(err);
      }).$promise;

    },
    /**
     * Marks a user as a active user
     *   (asynchronous)
     *
     * @param {Object} user
     * @param  {Function|*} callback - optional, funciton(user)
     * @return {Object|Promise}
     */
    currentUser: function(user,callback){
      return User.currentUser({ id: user._id }, {
      }, function(user) {
        return safeCb(callback)(user);
      }, function(err) {
        return safeCb(callback)(err);
      }).$promise;

    },
    /**
    * Deletes a user
    *
    * @param {String} pass
    * @return {Object} user
    */
   deleteUser: function(pass){
     return  $http({
       url: '/api/users/me',
       method: 'DELETE',
       data: {password: pass},
       headers: {'Content-Type': 'application/json;charset=utf-8'}
     });
   },

    /**
     * Check if a user is logged in
     *   (synchronous|asynchronous)
     *
     * @param  {Function|*} callback - optional, function(is)
     * @return {Bool|Promise}
     */

    isLoggedIn(callback) {
      if (arguments.length === 0) {
        return currentUser.hasOwnProperty('role');
      }
      return Auth.getCurrentUser(null)
        .then(user => {
          var is = user.hasOwnProperty('role');
          safeCb(callback)(is);
          return is;
        });
    },
     /**
      * Check if a user has a specified role or higher
      *   (synchronous|asynchronous)
      *
      * @param  {String}     role     - the role to check against
      * @param  {Function|*} callback - optional, function(has)
      * @return {Bool|Promise}
      */
    hasRole(role, callback) {
      var hasRole = function(r, h) {
        return userRoles.indexOf(r) >= userRoles.indexOf(h);
      };
      if (arguments.length < 2) {
        if (currentUser === undefined || !(currentUser.hasOwnProperty('role'))) {
          return false;
        }
        return hasRole(currentUser.role, role);
      }
      return Auth.getCurrentUser(null)
        .then(user => {
          var has = (user.hasOwnProperty('role')) ?
            hasRole(user.role, role) : false;
          safeCb(callback)(has);
          return has;
        });
    },
     /**
      * Check if a user is an admin
      *   (synchronous|asynchronous)
      *
      * @param  {Function|*} callback - optional, function(is)
      * @return {Bool|Promise}
      */
    isAdmin() {
      return Auth.hasRole
        .apply(Auth, [].concat.apply(['admin'], arguments));
    },
     /**
      * Check if a user is an mentor
      *   (synchronous|asynchronous)
      *
      * @param  {Function|*} callback - optional, function(is)
      * @return {Bool|Promise}
      */
    isMentor() {
      return Auth.hasRole
        .apply(Auth, [].concat.apply(['mentor'], arguments));
    },

    /**
     * Get auth token
     *
     * @return {String} - a token string used for authenticating
     */
    getToken() {
      return $cookieStore.get('token');
    },

    /**
    * Waits for currentUser to resolve before checking if user is logged in
    */
    isLoggedInAsync: isLoggedInAsync,
    /**
    * Sends password reminder to specified email
    *
    * @param {String} email
    * @return {Promise}
    **/
    resetPassword(email, callback){
        return $http.post('/api/users/resetPassword', {
            email: email
        }).then(res => {
          return safeCb(callback)(null, res);
        }).catch(err => {
          return safeCb(callback)(err);
        });
    }

  };
  return Auth;
}
angular.module('observatory3App.auth')
  .factory('Auth', AuthService);
})();
