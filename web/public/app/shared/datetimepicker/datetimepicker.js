"use strict";

angular

.module('app')

.directive('datetimepicker',
    function() {
        return {
            restrict: 'E',
            templateUrl: '/app/shared/datetimepicker/datetimepicker.html',
            scope: {
                value: '=',
                filter: '@',
                minimized: '@',
            },
            controller: ['$scope', '$filter', 'datetimepickerService',
                function($scope, $filter, datetimepickerService) {

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
                    var filterDate = function(val, mini) {
                        return mini ? $filter('date')(new Date(val), 'HH:mm')
                                    : norskify($filter('date')(new Date(val), $scope.filter));
                    };
                    var monthName = function(date, year) {
                        return norskify($filter('date')(date, 'MMMM' + (!year ? ' yyyy' : ''))).capitalize();
                    }

                    $scope.dtp = datetimepickerService;
                    $scope.isMinimized = true;
                    $scope.selectedTime = 0;
                    $scope.selectedDate = '';
                    $scope.selectedDateString = '';
                    $scope.selectedDateStringMini = '';
                    $scope.currentMonthName = '';
                    $scope.currentMonthArray = [];

                    $scope.toggleMinimized = function(confirm) {
                        if ($scope.isMinimized)
                            $scope.dtp.minimizeAllExcept = $scope.$id;
                        else if (confirm) {
                            var formatted = formatDate($scope.selectedDate);
                            $scope.value = formatted;
                        } else {
                            $scope.selectedDate = new Date($scope.value);
                            $scope.currentMonthArray = $scope.dtp.getMonth($scope.selectedDate.getTime())
                        }
                        $scope.isMinimized = !$scope.isMinimized;
                    };

                    // The days-parameter will (hopefylly heh) be days since 1970-01-01
                    $scope.selectDate = function(day) {
                        if (moment(day.time).isValid()) 
                            $scope.selectedDate = new Date(day.time);
                        if (day.month !== 0)
                            $scope.changeMonth();
                    };
                    $scope.changeTime = function(offset, actual) {
                        var offset = offset || 0;
                        var newDate = new Date($scope.selectedDate.getTime());
                        // 'actual' means that we should use the actual time in $scope.selectedTime, and not an offset
                        if (actual) {
                            var t = offset;
                            var h = Math.floor(t / 60);
                            var m = t % 60;
                            newDate.setHours(h);
                            newDate.setMinutes(m);
                        }
                        else
                            newDate.setMinutes(newDate.getMinutes() + offset);
                        $scope.selectedDate = newDate;
                    }
                    $scope.changeMonth = function(offset) {
                        var offset = offset || 0;
                        var newDate = new Date($scope.selectedDate.getTime());
                        newDate.setMonth(newDate.getMonth() + offset);
                        $scope.selectedDate = newDate;
                        $scope.currentMonthArray = $scope.dtp.getMonth($scope.selectedDate.getTime());
                    };

                    $scope.$watch('dtp.minimizeAllExcept', 
                        function(newVal) {
                            $scope.isMinimized = newVal !== $scope.$id;
                        }
                    );
                    $scope.$watch('selectedDate',
                        function(newVal) {
                            var formatted = formatDate(newVal);
                            $scope.selectedTime = $scope.dtp.getTime(newVal);
                            $scope.selectedDateString = filterDate(formatted);
                            $scope.selectedDateStringMini = filterDate(formatted, true);
                            $scope.dtp.highlightDay($scope.currentMonthArray, $scope.selectedDate);
                        }
                    );
                    $scope.$watch('currentMonthArray',
                        function(newVal) {
                            $scope.currentMonthName = monthName($scope.selectedDate);
                            $scope.dtp.highlightDay(newVal, $scope.selectedDate);
                        }
                    );

                    $scope.init = function() {
                        $scope.isMinimized = $scope.minimized;
                        $scope.selectedDate = new Date($scope.value);
                        $scope.currentMonthName = monthName($scope.selectedDate);
                        $scope.currentMonthArray = $scope.dtp.getMonth($scope.selectedDate.getTime());
                    };
                    $scope.init();
                }
            ]
        };
    }
)

.factory('datetimepickerService', [
    function() {
        var closestQuarter = function(minutes) {
            return 15 * Math.round(minutes / 15);
        };

        return {
            minimizeAllExcept: -1,
            getTime: function(date) {
                var mins = date.getHours() * 60;
                return mins + closestQuarter(date.getMinutes());
            },
            getMonth: function(time) {
                // Create date at time
                var d = new Date(time);
                // // Get month from current date
                var month = d.getMonth();
                // // set date to first in month
                d.setDate(1);
                // If d isn't monday, then subtract 
                if (d.getDay() !== 1)
                    d.setDate(1 - (d.getDay() === 0 ? 6 : d.getDay() - 1));

                // Array to be returned. First element in every subarray will be week number
                var ret = [];
                // Loop through weeks and days
                for (var week = 0; week < 6; ++week) {
                    var weekArr = [];
                    for (var day = 0; day < 8; ++day) {
                        if (day === 0)
                            weekArr.push(
                                {
                                    value: d.getWeekNumber(),
                                    time: -1,
                                    days: -1,
                                    month: null,
                                    class: 'dtp-week-number'
                                }
                            );
                        else {
                            weekArr.push(
                                {
                                    value: d.getDate(),
                                    time: d.getTime(),
                                    days: Math.floor(d.getTime() / 1000 / 60 / 60 / 24),
                                    month: (d.getMonth() === month ? 0 : (d.getMonth() <= month ? -1 : 1)),
                                    class: (d.getMonth() === month ? 'dtp-regular' : 'dtp-grayed')
                                }
                            );
                            d.setDate(d.getDate() + 1);
                        }
                    }
                    ret.push(weekArr);
                }

                return ret;
            },
            highlightDay: function(monthArray, time) {
                // Why + 1000 * 3600? FUCKING TIMEZONES!
                var days = Math.floor((time instanceof Date ? time.getTime() + 1000 * 3600 : time) / 1000 / 60 / 60 / 24);

                angular.forEach(monthArray, function(week, ind) {
                    angular.forEach(week, function(day, ind) {
                        day['class'] = days === day['days'] ? 'dtp-highlighted' : (!day['month'] ? 'dtp-regular' : 'dtp-grayed');
                    });
                });
            }
        };
    }]
)