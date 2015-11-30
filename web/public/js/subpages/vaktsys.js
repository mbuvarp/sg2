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
var app = angular.module("vaktsys", []);

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
            return moment(this.startDate).add(this.dateDelta, 'days').norsk('dddd D. MMMM YYYY').capitalize();
        },
        getSimpleStartDate: function() {
            return this.startDate.format('YYYY-MM-DD');
        }
    }

    // Function to set open to true in @scope.bars
    var setBarOpen = function(bar) {
        $.each($scope.bars.names, function(ind, elmt) {
            if (elmt.name === bar)
                elmt.open = true;
        });
    };
    // Custom sorting for shifts
    var shiftSort = function(keyA, keyB) {
        if (keyA === 'Sent')
            if (keyB === 'Tidlig')       // Sent kommer etter tidlig
                return 1;
            else                         // .. men før alt annet
                return -1;
        else if (keyA === 'Tidlig')      // Tidlig er alltid først
            return -1;
        else if (keyA === 'Bacalao')     // Bacalao er alltid sist
            return 1;
        else
            if (keyB === 'Bacalao')
                return -1;
            else
                return 1;
    }
    // Function to sort shift in one bar by description ("Tidlig", "Sent", "Bacalao", custom)
    var sortByDescription = function(data) {
        // Firt we place all shifts in an object per their description
        var items = {};
        $.each(data, function(ind, elmt) {
            if (!(elmt.description in items))
                items[elmt.description] = [];

            items[elmt.description].push({
                user_id: elmt.user_id,
                name: elmt.name,
                image: elmt.image,
                role: elmt.role,
                start: elmt.start,
                stop: elmt.stop
            });
        });

        // Then we restructure that shit into an array
        // Slow you say? Fuck that, I've been working on this for 6 hours
        var names = Object.getOwnPropertyNames(items);
        names.sort(shiftSort);

        var ret = [];
        $.each(names, function(ind, name) {
            ret.push({
                shift: name,
                people: items[name]
            });
        });

        return ret;
    };

    // Retrieve bars
    $scope.retrieveBars = function() {
        $http({
            method: 'GET',
            url: '/api/bars',
        }).then(
            // Success
            function(res) {
                $.each(res.data, function(ind, elmt) {
                    $scope.bars.names.push({ name: elmt.name, open: false });
                })
                $scope.bars.names[0].selected = true;
            },
            // Error
            function(res) {
                console.log(res);
            }
        );
    };
    // Retrieve shifts
    $scope.retrieveShifts = function(date) {
        if (date === undefined)
            var date = $scope.dateslider.getSimpleStartDate();

        $http({
            method: 'GET',
            url: '/api/shifts/' + date,
        }).then(
            // Success
            function(res) {
                for (var key in res.data) {
                    if (res.data.hasOwnProperty(key)) {
                        // Set this bar as open
                        setBarOpen(key);
                        $scope.shifts[key] = sortByDescription(res.data[key]);
                    }
                }
            },
            // Error
            function(res) {
                console.log(res);
            }
        );
    };
});