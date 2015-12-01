var app = angular.module('app', ['ngRoute'])

.config(['$routeProvider', '$locationProvider', 'USER_ROLES',
    function($routeProvider, $locationProvider, USER_ROLES) {
        $routeProvider

        .when('/', {
            templateUrl: 'views/front/front.html',
            controller: 'frontController',
            title: ''
        })

        .when('/login', {
            templateUrl: 'views/login/login.html',
            controller: 'loginController',
            title: 'Logg inn',
            data: {
                authorizedRoles: [USER_ROLES.all]
            }
        })

        .when('/vaktsys', {
            templateUrl: 'views/vaktsys/vaktsys.html',
            controller: 'vaktsysController',
            title: 'Vaktsys',
            data: {
                //authorizedRoles: [USER_ROLES.admin, USER_ROLES.moderator, USER_ROLES.user]
                authorizedRoles: [USER_ROLES.all]
            }
        })

        .otherwise({
            templateUrl: 'views/404.html',
            title: 'Siden finnes ikke',
            data: {
                authorizedRoles: [USER_ROLES.all]
            }
        });

        $locationProvider.html5Mode(true);
    }]
)

.run(['$rootScope', 'AUTH_EVENTS', 'AuthService',
    function($rootScope, AUTH_EVENTS, AuthService) {
        // Check authorization before route change
        $rootScope.$on('$routeChangeStart', function (event, next) {
            var authorizedRoles = next.data.authorizedRoles;
            if (!AuthService.isAuthorized(authorizedRoles)) {
                event.preventDefault();
                if (AuthService.isAuthenticated()) {
                    // user is not allowed
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                } else {
                    // user is not logged in
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                }
            }
        });

        // Set title on route change and check if login-page
        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            var title = current.$$route.title;
            $rootScope.title = 'SGNett 2.0' + (title ? ' : ' + title : '');
        });
    }]
);