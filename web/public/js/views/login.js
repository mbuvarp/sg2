app

.controller('loginController', ['$scope', '$rootScope', 'AUTH_EVENTS', 'AuthService',
    function ($scope, $rootScope, AUTH_EVENTS, AuthService) {
        $scope.credentials = {
            username: '',
            password: ''
        };
        $scope.login = function (credentials) {
            AuthService.login(credentials)
            .then(function (user) {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                $scope.setCurrentUser(user);
            }, function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });
        };
    }]
)

.constant('AUTH_EVENTS',
    {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    }
)
.constant('USER_ROLES',
    {
        all: '*',
        admin: 'admin',
        moderator: 'moderator',
        user: 'user',
        guest: 'guest'
    }
)

.factory('AuthService', ['$http', 'Session',
    function ($http, Session) {
        var authService = {};

        authService.login = function (credentials) {
            return $http.post('/login', credentials)
            .then(function (res) {
                Session.create(res.data.id, res.data.user.id, res.data.user.role);
                return res.data.user;
            });
        };

        authService.isAuthenticated = function () {
            return !!Session.userId;
        };

        authService.isAuthorized = function (authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            return authorizedRoles.indexOf('*') !== -1 ||
                   (authService.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
        };

        return authService;
    }]
)

.service('Session',
    function () {
        this.create = function (sessionId, userId, userRole) {
            this.id = sessionId;
            this.userId = userId;
            this.userRole = userRole;
        };
        this.destroy = function () {
            this.id = null;
            this.userId = null;
            this.userRole = null;
        };
    }
)

.config(['$httpProvider',
    function ($httpProvider) {
        $httpProvider.interceptors.push(['$injector',
            function ($injector) {
                return $injector.get('AuthInterceptor');
            }]
        );
    }]
)

.factory('AuthInterceptor',
    function ($rootScope, $q, AUTH_EVENTS) {
        return {
            responseError: function (response) { 
                $rootScope.$broadcast({
                    401: AUTH_EVENTS.notAuthenticated,
                    403: AUTH_EVENTS.notAuthorized,
                    419: AUTH_EVENTS.sessionTimeout,
                    440: AUTH_EVENTS.sessionTimeout
                }[response.status], response);
                return $q.reject(response);
            }
        };
    }
)

.controller('appController', ['$rootScope', '$scope', 'USER_ROLES', 'AuthService',
    function($rootScope, $scope, USER_ROLES, AuthService) {
        $scope.currentUser = null;
        $scope.userRoles = USER_ROLES;
        $scope.isAuthorized = AuthService.isAuthorized;
        $scope.isLoginPage = false;

        $scope.setCurrentUser = function(user) {
            $scope.currentUser = user;
        };
        $scope.setLoginPage = function(is) {
            $scope.isLoginPage = is;
        };

        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            $scope.setLoginPage(current.$$route.originalPath === '/login');
        });
    }]
)

.directive('loginDialog', ['AUTH_EVENTS',
    function (AUTH_EVENTS) {
        return {
            restrict: 'A',
            template: '<div ng-if="visible" ng-include="\'login-form.html\'">',
            link: function (scope) {
                var showDialog = function () {
                    scope.visible = true;
                };

                scope.visible = false;
                scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
                scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
            }
        };
    }]
)

.directive('formAutofillFix', ['$timeout',
    function ($timeout) {
        return function (scope, element, attrs) {
            element.prop('method', 'post');
            if (attrs.ngSubmit) {
                $timeout(
                    function () {
                        element
                        .unbind('submit')
                        .bind('submit',
                            function (event) {
                                event.preventDefault();
                                element
                                .find('input, textarea, select')
                                .trigger('input')
                                .trigger('change')
                                .trigger('keydown');
                                scope.$apply(attrs.ngSubmit);
                            }
                        );
                    }
                );
            }
        };
    }]
);