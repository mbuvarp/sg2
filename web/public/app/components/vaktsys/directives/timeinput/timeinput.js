(function() {

    "use strict";

    angular.module('sg2')

    .directive('timeInput', function() {
        return {
            require: 'ngModel',
            link:
            function(scope, element, attrs, ngModelController) {
                ngModelController.$parsers.push(
                    function(data) {
                        // Convert data from view format to model format
                        var ret = moment(ngModelController.$modelValue).format('YYYY-MM-DD');
                        ret += ' ' + data;
                        return (moment(ret).isValid() ? moment(ret).format() : ngModelController.$modelValue);
                    }
                );

                ngModelController.$formatters.push(
                    function(data) {
                        // Convert data from model format to view format
                        data = moment(data).format('HH:mm');
                        return data; //converted
                    }
                );
            }
        }
    });

}());