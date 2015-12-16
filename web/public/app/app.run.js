"use strict";

angular

.module('app')

.run(['$rootScope', 'AUTH_EVENTS', 'authService',
   function($rootScope, AUTH_EVENTS, authService) {
        // Check authorization before route change
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            var authorizedRoles = toState.data.authorizedRoles;
            if (!authService.isAuthorized(authorizedRoles)) {
                // Not authorized! Don't load this shit
                event.preventDefault();
                if (authService.isAuthenticated()) {
                    // user is not allowed
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                } else {
                    // user is not logged in
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                }
            }
        });

        // Set title on route change and check if login-page
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            var title = toState.data.title;
            $rootScope.title = 'SGNett 2.0' + (title ? ' : ' + title : '');
        });
    }]
);