"use strict";

angular

.module('app')

.directive('personcard',
    function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/app/components/vaktsys/directives/personcard/personcard.html',
        };
    }
);