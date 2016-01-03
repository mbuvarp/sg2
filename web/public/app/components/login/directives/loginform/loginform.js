(function() {

    "use strict";

    angular.module('sg2')

    .directive('loginform', [
        function() {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: '/app/components/login/directives/loginform/loginform.html'
            };
        }]
    );

}());