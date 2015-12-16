"use strict";

angular

.module('app')

.directive('dateslider',
    function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/app/components/vaktsys/directives/dateslider/dateslider.html',
        };
    }
);