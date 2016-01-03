(function() {

    "use strict";

    angular.module('sg2')

    .directive('datetimepicker',
        function() {
            return {
                restrict: 'E',
                templateUrl: '/app/shared/datetimepicker/datetimepicker.html',
                scope: {
                    value: '=',
                    filter: '@',
                    minimized: '@',
                    type: '@',
                }
            };
        }
    )

    .controller('DatetimePickerController', ['$log', '$scope', '$filter', 'dateTimePickerService', DatetimePickerController])

    .factory('dateTimePickerService', [dateTimePickerService]);

    function DatetimePickerController($log, $scope, $filter, dateTimePickerService) {
        var vm = this;

        // Exports
        // ====================
        vm.isMinimized = true;
        vm.selectedTime = 0;
        vm.selectedDate = '';
        vm.selectedDateString = '';
        vm.selectedDateStringMini = '';
        vm.currentMonthName = '';
        vm.currentMonthArray = [];
        // Functions
        vm.toggleMinimized = toggleMinimized;
        vm.changeTime = changeTime;
        vm.selectDate = selectDate;
        vm.toggleMinimized = toggleMinimized;
        vm.showTime = showTime;
        vm. showDate = showDate;

        // Private variables
        // ====================
        var firstOpen = true;

        // Public
        // ====================
        function changeTime(offset, actual) {
            var offset = offset || 0;
            var newDate = new Date(vm.selectedDate.getTime());
            // 'actual' means that we should use the actual time in vm.selectedTime, and not an offset
            if (actual) {
                var t = offset;
                var h = Math.floor(t / 60);
                var m = t % 60;
                newDate.setHours(h);
                newDate.setMinutes(m);
            }
            else
                newDate.setMinutes(newDate.getMinutes() + offset);
            changeSelectedDate(newDate);
        }
        // The days-parameter will (hopefylly heh) be days since 1970-01-01
        function selectDate(day) {
            if (moment(day.time).isValid()) 
                changeSelectedDate(new Date(day.time));
            if (day.month !== 0)
                vm.changeMonth();
        }
        function changeMonth(offset) {
            var offset = offset || 0;
            var newDate = new Date(vm.selectedDate.getTime());
            newDate.setMonth(newDate.getMonth() + offset);
            changeSelectedDate(newDate);
            changeCurrentMonth(dateTimePickerService.getMonth(vm.selectedDate.getTime()));
        }
        function toggleMinimized(confirm) {
            if (confirm) {
                var formatted = formatDate(vm.selectedDate);
                vm.value = formatted;
            } else {
                changeSelectedDate(new Date(vm.value));
                changeCurrentMonth(dateTimePickerService.getMonth(vm.selectedDate.getTime()));
            }
            if (firstOpen && vm.isMinimized) {
                buildFirstTime();
                firstOpen = false;
            }
            vm.isMinimized = !vm.isMinimized;
        }
        function showTime() {
            return vm.type === 'time' || vm.type === 'both';
        }
        function showDate() {
            return vm.type === 'date' || vm.type === 'both';
        }

        // Private
        function changeSelectedDate(to) {
            var formatted = formatDate(to);
            vm.selectedDate = to;
            vm.selectedTime = dateTimePickerService.getTime(to);
            vm.selectedDateString = filterDate(formatted);
            vm.selectedDateStringMini = filterDate(formatted, true);
            dateTimePickerService.highlightDay(vm.currentMonthArray, vm.selectedDate);
        }
        function changeCurrentMonth(to) {
            vm.currentMonthName = monthName(vm.selectedDate);
            vm.currentMonthArray = to;
            dateTimePickerService.highlightDay(to, vm.selectedDate);
        }
        function buildFirstTime() {
            vm.currentMonthName = monthName(vm.selectedDate);
            changeCurrentMonth(dateTimePickerService.getMonth(vm.selectedDate.getTime()));
        }

        // Helpers
        // ====================
        function formatDate(dateObj) {
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
        }
        function filterDate(val, mini) {
            return mini ? $filter('date')(new Date(val), 'HH:mm')
                        : norskify($filter('date')(new Date(val), vm.filter));
        }
        function monthName(date, year) {
            return norskify($filter('date')(date, 'MMMM' + (!year ? ' yyyy' : ''))).capitalize();
        }

        // Init
        // ====================
        function init() {
            vm.value = $scope.value;
            vm.filter = $scope.filter;
            vm.isMinimized = ($scope.minimized !== undefined ? $scope.minimized === 'true' : true);
            vm.type = $scope.type || 'both';

            changeSelectedDate(new Date(vm.value));
        };
        init();
    }

    function dateTimePickerService() {
        // Helpers
        function closestQuarter(minutes) {
            return 15 * Math.round(minutes / 15);
        }

        // Public
        function getTime(date) {
            var mins = date.getHours() * 60;
            return mins + closestQuarter(date.getMinutes());
        }
        function getMonth(time) {
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
        }
        function highlightDay(monthArray, time) {
            // Why + 1000 * 3600? FUCKING TIMEZONES!
            var days = Math.floor((time instanceof Date ? time.getTime() + 1000 * 3600 : time) / 1000 / 60 / 60 / 24);

            angular.forEach(monthArray, function(week, ind) {
                angular.forEach(week, function(day, ind) {
                    day['class'] = days === day['days'] ? 'dtp-highlighted' : (!day['month'] ? 'dtp-regular' : 'dtp-grayed');
                });
            });
        }

        return {
            getTime: getTime,
            getMonth: getMonth,
            highlightDay: highlightDay
        };
    }

}());