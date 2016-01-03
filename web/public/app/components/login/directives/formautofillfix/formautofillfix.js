(function() {

    "use strict";

    angular.module('sg2')

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
                                    $('input, textarea, select', element)
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

}());