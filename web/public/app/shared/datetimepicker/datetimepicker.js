"use strict";

app

.directive('datetimepicker',
    function() {
        return {
            restrict: 'E',
            templateUrl: '/app/shared/datetimepicker/datetimepicker.html',
            scope: {
                value: '=',
                filter: '@',
            },
            controller: ['$scope', '$filter',
                function($scope, $filter) {

                    var formatDate = function(dateObj) {
                        var year = dateObj.getFullYear();
                        var month = (dateObj.getMonth() + 1).pad(2);
                        var date = dateObj.getDate().pad(2);
                        var hour = dateObj.getHours().pad(2);
                        var minute = dateObj.getMinutes().pad(2);
                        var second = dateObj.getSeconds().pad(2);
                        var tz = (dateObj.getTimezoneOffset() / 60 * -1  * 100);
                        tz = tz < 0 ? '-' + tz.pad(4) : '+' + tz.pad(4);
                        tz = tz.substring(0, 3) + ':' + tz.substring(3);
                        return '{0}-{1}-{2}T{3}:{4}:{5}{6}'.format(year, month, date, hour, minute, second, tz);
                    };
                    var filterDate = function(val) {
                        return norskify($filter('date')(new Date(val), $scope.filter));
                    };

                    $scope.selectedDate = '';
                    $scope.selectedDateString = '';

                    $scope.$watch('selectedDate', function(newVal) {
                        var formatted = formatDate(newVal);
                        $scope.value = formatted;
                        $scope.selectedDateString = filterDate(formatted);
                    });

                    $scope.init = function() {
                        $scope.selectedDate = new Date($scope.value);
                    };
                    $scope.init();
                }
            ]
        };
    }
)

.factory('datetimepickerService', [
    function() {
        return {
            getMonth: function(month, year) {
                // Create date at now
                var d = new Date();
                // Get month from args or current date
                var month = month || d.getMonth();
                // Get month from args or current date w/ month
                var year = year || d.setMonth(month).getFullYear();
                // Set to that year
                d.setYear(year);
                // setDate(0) sets date to last of previous month
                d.setDate(0);

                
            }
        };
    }]
)