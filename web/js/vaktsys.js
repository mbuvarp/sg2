var app = angular.module("main", []);

app.controller("workplaces", function($scope) {
    $scope.workplaces = {
        locales: [
            { name: "Lyche", class:"selected" },
            { name: "Edgar" },
            { name: "Daglighallen" },
            { name: "Klubben" },
            { name: "Bodegaen" },
            { name: "Rundhallen" },
            { name: "Storsalen Syd" },
            { name: "Storsalen Nord" },
            { name: "Støvrommet" }
        ]
    };
    $scope.people = {
        persons: [
            
        ]
    }
});