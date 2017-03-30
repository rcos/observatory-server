angular.module('observatory3App')
.directive('noSlashes', function() {
    return {
        require: 'ngModel',
        link: function(scope, ele, attrs, ctrl){
            ctrl.$parsers.unshift(function(value) {
                if(value){
                    var valid = value.indexOf('/') === -1;
                    ctrl.$setValidity('mongoose', valid);
                }

                return valid ? value : undefined;
            });

        }
    }
});
