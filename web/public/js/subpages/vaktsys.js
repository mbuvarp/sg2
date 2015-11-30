// Aesthetic
$(document).ready(function() {
    $(document).on('click', 'main #shift-display #left li', function() {
        $('main #shift-display #left li').removeClass('selected');
        $(this).addClass('selected');
    });
    $(document).on('click', 'main #shift-admin #add-shifts', function() {
        $('main #shift-admin #add-shifts,#remove-shifts').fadeOut(200, function() {
            $('main #shift-admin #add-container').show();
        });
    });
    $(document).on('click', 'main #shift-admin #remove-shifts', function() {
        $('main #shift-admin #add-shifts,#remove-shifts').fadeOut(200);
    });
    // This listener makes sure the max-height property of the shift-list
    // is always equal to the height og the tabs on the left
    $(document).on('DOMSubtreeModified', 'main #shift-display #left ul', function() {
        $('main #shift-display #right').css('max-height', $(this).height());
    });
});


// Dynamical
var app = angular.module("main", []);

app.controller("shift-admin", function($scope) {

});

app.controller("shift-display", function($scope, $http) {
    $scope.bars = {
        curBar: "Bodegaen",
        names: []
    };
    $scope.shifts = {

    };

    // Initialize dateslider
    $scope.dateslider = {
        startDate: moment(),
        dateDelta: 0,
        getDate: function() {
            return moment(this.startDate).add(this.dateDelta, 'days').norsk('D. MMMM YYYY');
        }
    }

    // Retrieve bars
    $http({
        method: 'GET',
        url: '/api/bars',
    }).then(
        // Success
        function(res) {
            $scope.bars.names = res.data;
            $scope.bars.names[0].class = 'selected';
        },
        // Error
        function(res) {
            console.log(res);
        }
    );

    // Retrieve shifts
    var fDate = $scope.dateslider.startDate.format('YYYY-MM-DD');
    $http({
        method: 'GET',
        url: '/api/shifts/' + fDate,
    }).then(
        // Success
        function(res) {
            for (var key in res.data) {
                if (res.data.hasOwnProperty(key)) {
                    $scope.shifts[key] = res.data[key];
                }
            }
        },
        // Error
        function(res) {
            console.log(res);
        }
    );

});