"use strict";

app

.directive('logindialog', ['AUTH_EVENTS',
    function (AUTH_EVENTS) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/app/components/login/login.html',
            link: function ($scope) {
                var showDialog = function () {
                    $scope.visible = true;
                };

                $scope.visible = false;
                // $scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
                // $scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
            }
        };
    }]
);