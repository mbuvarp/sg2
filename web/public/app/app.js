var app = angular.module('app', ['ui.router'])

.config(['$locationProvider', '$httpProvider',
    function($locationProvider, $httpProvider) {
        $locationProvider.html5Mode(true);

        $httpProvider.interceptors.push('authInterceptor');
    }]
)

.config(['$stateProvider', '$urlRouterProvider', 'USER_ROLES',
    function($stateProvider, $urlRouterProvider, USER_ROLES) {
        
        $urlRouterProvider.otherwise('/404');

        $stateProvider

        .state('home', {
            url: '/',
            templateUrl: '/app/components/home/home.html',
            controller: 'homeController',
            data: {
                title: '',
                authorizedRoles: [USER_ROLES.all]
            }
        })

        .state('login', {
            url: '/login',
            templateUrl: '/app/components/login/login.html',
            controller: 'loginController',
            params: {
                '401': '0',
                '419': '0'
            },
            data: {
                title: 'Logg inn',
                authorizedRoles: [USER_ROLES.all]
            }
        })

        .state('logout', {
            url: '/logout',
            templateUrl: '/app/components/logout/logout.html',
            controller: 'logoutController',
            data: {
                title: 'Logg ut',
                authorizedRoles: [USER_ROLES.all]
            }
        })

        .state('minbruker', {
            url: '/minbruker',
            templateUrl: '/app/components/minbruker/minbruker.html',
            controller: 'minbrukerController',
            data: {
                title: 'Min bruker',
                authorizedRoles: [USER_ROLES.all]
            }
        })

        .state('vaktsys', {
            url: '/vaktsys',
            templateUrl: '/app/components/vaktsys/vaktsys.html',
            controller: 'vaktsysController',
            data: {
                title: 'Vaktsys',
                authorizedRoles: [USER_ROLES.user, USER_ROLES.moderator, USER_ROLES.admin]
            }
        })

        .state('otherwise', {
            url: '/404',
            templateUrl: '/app/components/errors/404/404.html',
            data: {
                title: 'Siden finnes ikke',
                authorizedRoles: [USER_ROLES.all]
            }
        });
    }]
)

.controller('appController', ['$rootScope', '$scope', 'USER_ROLES', 'auth', '$state',
    function($rootScope, $scope, USER_ROLES, auth, $state) {
        $scope.currentUser = null;
        $scope.userRoles = USER_ROLES;
        $scope.isAuthenticated = auth.isAuthenticated;
        $scope.isLoginPage = false;

        $scope.logout = function() {
            auth.logout()
            .then(function() {
                $state.go('login');
            });
        };
        $scope.setCurrentUser = function(user) {
            $scope.currentUser = user;
        };
        $scope.setLoginPage = function(is) {
            $scope.isLoginPage = is;
        };

        // Global events
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $scope.setLoginPage(toState.name === '/login');
        });
        $rootScope.$on('auth-login-success', function (event) {
            $state.go('front');
        });
        $rootScope.$on('auth-login-failed', function (event) {
            alert("LOGIN FAILED"); // TODO
        });
        $rootScope.$on('auth-not-authenticated', function (event) {
            console.log("NOT AUTHENTICATED"); // TODO
            $state.go('login', { '401': '1', '403': '0' });

        });
        $rootScope.$on('auth-not-authorized', function (event) {
            alert("NOT AUTHORIZED"); // TODO
        });
    }]
)

.run(['$rootScope', 'AUTH_EVENTS', 'auth',
   function($rootScope, AUTH_EVENTS, auth) {
        // Check authorization before route change
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            var authorizedRoles = toState.data.authorizedRoles;
            if (!auth.isAuthorized(authorizedRoles)) {
                // Not authorized! Don't load this shit
                event.preventDefault();
                if (auth.isAuthenticated()) {
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