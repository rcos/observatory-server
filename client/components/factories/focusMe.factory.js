'use strict';

angular.module('observatory3App')
.factory('focus', function($timeout, $window){
    return function(id) {
        $timeout(function() {
            var element = $window.document.getElementById(id);
            if(element)
                element.focus();
        });
    };
});
