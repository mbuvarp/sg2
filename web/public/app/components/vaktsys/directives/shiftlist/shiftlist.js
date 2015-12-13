"use strict";

app

.directive('shiftlist',
    function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/app/components/vaktsys/directives/shiftlist/shiftlist.html',
        };
    }
);