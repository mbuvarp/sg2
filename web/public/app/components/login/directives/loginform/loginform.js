"use strict";

app

.directive('loginform', [
    function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/app/components/login/directives/loginform/loginform.html'
        };
    }]
);