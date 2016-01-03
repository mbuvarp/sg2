(function() {

    "use strict";

    // jQuery
    $(document).ready(function() {
        var right = 'main #view-vaktsys #shift-display #right ';
        var left = 'main #view-vaktsys #shift-display #left ';

        // Make active tab look active and save active bar in localStorage
        $(document).on('click', left + 'li:not(.blank)', function() {
            $('main #view-vaktsys #shift-display #left li').removeClass('active');
            $(this).addClass('active');

            var bar = $(this).attr('id').split('-')[1];
            localStorage['vaktsys_bar_active'] = bar;
        });
    });

    // App
    angular.module('sg2')

    .controller('VaktsysController', ['$log', '$scope', 'vaktsys.sharedService', VaktsysController]);

    function VaktsysController($log, $scope, sharedService) {
        var vm = this;

        vm.date = moment().format('YYYY-MM-DD');
        vm.changeDate = changeDate;

        // Public
        function changeDate(newDate) {
            var newDate = newDate || vm.date;
            sharedService.setDate(newDate);
        }

        // Events
        $scope.$on('vaktsys.update', handleUpdate);
        function handleUpdate(event, args) {
            // Only update if variable already exists. All relevant variables for this controller should be already declared.
            if (vm[args.what] !== undefined)
                vm[args.what] = args.newVal;
        }
    }

}());