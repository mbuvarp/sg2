(function() {

    "use strict";

    angular.module('sg2')

    .directive('msgbox',
        function() {
            return {
                restrict: 'E',
                templateUrl: '/app/shared/msgbox/msgbox.html',
                scope: {

                }
            };
        }
    )

    .controller('MsgBoxController', ['$log', '$scope', '$rootScope', 'msgBoxService', MsgBoxController])

    .factory('msgBoxService', ['$log', '$rootScope', msgBoxService]);

    function MsgBoxController($log, $scope, $rootScope, msgBoxService) {
        var vm = this;

        vm.title = 'What is love?';
        vm.message = 'Baby don\'t hurt me!';
        vm.buttons = { 'No more': function() { $log.info('Whoawhoawhoawhoooooa'); } };
        vm.visible = false;
        vm.hide = hide;
        vm.execute = execute;

        function hide() {
            $rootScope.$broadcast('hideMsgBox');
        }
        function execute(fn) {
            if (typeof(fn) === 'function')
                fn();
            hide();
        }

        $scope.$on('showMsgBox', handleShowMsgBox);
        function handleShowMsgBox(event, args) {
            vm.title = args.title || '';
            vm.message = args.message || '';
            vm.buttons = args.buttons || { };
            vm.visible = true;
        }
        $scope.$on('hideMsgBox', handleHideMsgBox);
        function handleHideMsgBox() {
            vm.visible = false;
        }
    }

    function msgBoxService($log, $rootScope) {
        function show(title, message, buttons) {
            $rootScope.$broadcast('showMsgBox', {
                title: title,
                message: message,
                buttons: buttons
            });
        }
        function hide() {
            $rootScope.$broadcast('hideMsgBox');
        }

        return {
            show: show,
            hide: hide
        }
    }

})();