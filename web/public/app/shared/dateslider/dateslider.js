(function() {

    "use strict";

    angular.module('sg2')

    .directive('dateslider',
        function() {
            return {
                restrict: 'E',
                templateUrl: '/app/shared/dateslider/dateslider.html',
                require: '?ngModel',
                scope: {
                    value: '='
                },
                link: dateSliderLink
            };
        }
    )

    .controller('DateSliderController', ['$log', '$scope', 'dateSliderService', DateSliderController])

    .factory('dateSliderService', [dateSliderService]);

    function dateSliderLink(scope, elmt, attrs, ctrl) {
        scope.updateModel = updateModel;
        ctrl.$viewChangeListeners.push(
            function () {
                scope.$eval(attrs.ngChange);
            }
        );

        function updateModel(item) {
            ctrl.$setViewValue(item)
        }
    }

    function DateSliderController($log, $scope, dateSliderService) {
        var mv = this;

        // Exports
        // ====================
        mv.value = '';
        mv.delta = 0;
        mv.datePretty = dateSliderService.getDatePretty();
        mv.updateDate = updateDate;
        mv.changeDate = changeDate;

        // Public
        // ====================
        function updateDate(delta) {
            var val = delta || mv.delta;
            dateSliderService.setDateDelta(val);
            mv.datePretty = dateSliderService.getDatePretty();
        }
        function changeDate(delta) {
            var val = delta || mv.delta;
            dateSliderService.setDateDelta(val);
            $scope.updateModel(dateSliderService.getSimpleDate());
        }

        // Init
        // ====================
        function init() {
            mv.value = $scope.value || dateSliderService.getSimpleStartDate();
        }
        init();
    }

    function dateSliderService() {
        var startDate = moment();
        var dateDelta = 0;

        function setDateDelta(delta) {
            dateDelta = delta;
        }
        function getDate() {
            return moment(startDate).add(dateDelta, 'days');
        }
        function getDatePretty() {
            return moment(startDate).add(dateDelta, 'days').norsk('dddd D. MMMM YYYY').capitalize();
        }
        function getSimpleDate() {
            return getDate().format('YYYY-MM-DD');
        }
        function getSimpleStartDate() {
            return startDate.format('YYYY-MM-DD');
        }

        return {
            setDateDelta: setDateDelta,
            getDate: getDate,
            getDatePretty: getDatePretty,
            getSimpleDate: getSimpleDate,
            getSimpleStartDate: getSimpleStartDate
        }
    }

}());