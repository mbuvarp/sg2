(function() {

    "use strict";

    angular.module('sg2')

    .directive('workplacelist',
        function() {
            return {
                restrict: 'E',
                templateUrl: '/app/components/vaktsys/directives/workplacelist/workplacelist.html'
            };
        }
    )

    .controller('vaktsys.WorkplaceListController', ['$scope', 'vaktsys.workplaceListService', 'vaktsys.sharedService', WorkplaceListController])

    .factory('vaktsys.workplaceListService', ['$http', workplaceListService]);

    function WorkplaceListController($scope, workplaceListService, sharedService) {
        var vm = this;

        // Exports
        vm.workplaces = {
            curWorkplace: "Bodegaen",
            names: []
        };
        vm.changeCurrentWorkplace = changeCurrentWorkplace;

        // Public
        function changeCurrentWorkplace(to) {
            sharedService.setCurrentWorkplace(to);
        }

        // Events
        $scope.$on('vaktsys.update', handleUpdate);
        function handleUpdate(event, args) {
            vm[args.what] = args.newVal;
        }

        // Private
        function retrieveWorkplaces() {
            return workplaceListService.retrieveWorkplaces()
            .then(
                function(data) {
                    sharedService.updateWorkplaces(data);
                },
                function(err) {
                    console.log(err);
                }
            );
        };

        // Init
        function init() {
            retrieveWorkplaces();
        }
        init();
    }

    function workplaceListService($http) {
        return {
            retrieveWorkplaces: function() {
                return $http.get('/api/workplaces').then(
                    function(data) {
                        var workplaces = {
                            curWorkplace: "Bodegaen",
                            names: []
                        };
                        $.each(data.data, function(ind, elmt) {
                            // This shit is to ensure that the user ends up in the tab that was open when he last closed the page.
                            var active = ind === 0;
                            var ls = localStorage['vaktsys_bar_active'];
                            active = (ls !== undefined && ls === elmt.name);
                            if (active)
                                workplaces.curWorkplace = elmt.name;
                            workplaces.names.push({ name: elmt.name, open: false, active: active});
                        });
                        return workplaces;
                    }
                );
            }
        };
    }

}());