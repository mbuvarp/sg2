$(document).ready(function() {
    // Events

    // Icon menu DOM-path
    var menu = 'header #inner #menu';
    // Add an event-listener to all the icon-buttons
    $(document).on('click', menu + ' #strip li',
        function() {

            // Hide all submenus
            $('.strip-menu-btn', menu).removeClass('active');
            $('.dropdown', menu).hide();

            $(this).addClass('active');

            // Get the id of the sub menu (will always be id of strip button minus "btn-"), and find width
            var id = $(this).attr('id').split("-")[1];
            var ul = $('ul#strip', menu);
            var width = $('li', ul).last().offset().left - $('li', ul).first().offset().left + $('li', ul).last().outerWidth(true);

            // Show the relevant submenu
            var sub = $('#' + id, menu);
            sub.css('width', width);
            sub.show();
        }
    );
    // Close submenu at click anywhere else
    $(document).mouseup(function(e) {
        // Get submenu
        var container = $('.dropdown', menu);
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.hide();
            $('li', menu + ' #strip').removeClass('active');
        }
    });
});

app

.controller('headerController', ['$scope',
    function($scope) {
        $scope.lol = function(cell) {
            console.log(cell);
        }

        function sortByRow() {

            for (var m = 0; m < $scope.menu.length; ++m) {
                var groups = $scope.menu[m].itemGroups;

                var largest = 0;
                for (var g = 0; g < groups.length; ++g)
                    if (groups[g].items.length > largest)
                        largest = groups[g].items.length;

                var ret = [];

                for (var x = 0; x < groups.length; ++x) {

                    var group = groups[x];
                    for (var y = 0; y < largest; ++y) {
                        if (ret.length < y + 1)
                            ret.push([]);

                        var item = group.items[y] || { empty: true };

                        ret[y].push(item);
                    }
                }

                $scope.menuByRow.push(ret);
            }
        }
        $scope.init = function() {
            $scope.menu = [
                {
                    title: 'Innhold',
                    id: 'content',
                    itemGroups: [
                        {
                            title: 'Vakter',
                            items: [
                                {
                                    text: 'Vaktsys',
                                    state: 'vaktsys'
                                },
                                {
                                    text: 'Møtereferater',
                                    state: 'motereferater'
                                },
                                {
                                    text: 'Sitater',
                                    state: 'sitater'
                                },
                                {
                                    text: 'Konkurranser',
                                    state: 'konkurranser'
                                }
                            ]
                        }
                    ]
                },
                {
                    title: 'Medlemmer',
                    id: 'members',
                    itemGroups: [
                        {
                            title: 'Administrasjon',
                            items: [
                                {
                                    text: 'Styret',
                                    state: 'gjenger/styret'
                                },
                                {
                                    text: 'Økonomi',
                                    state: 'gjenger/okonomi'
                                },
                                {
                                    text: 'Arrangement',
                                    state: 'gjenger/arrangement'
                                }
                            ]
                        },
                        {
                            title: 'Barene',
                            items: [
                                {
                                    text: 'Barsjefene',
                                    state: 'gjenger/barsjefene'
                                },
                                {
                                    text: 'Bartenderne',
                                    state: 'gjenger/bartenderne'
                                },
                                {
                                    text: 'Spritbarsjefene',
                                    state: 'gjenger/spritbarsjefene'
                                },
                                {
                                    text: 'Spritbartenderne',
                                    state: 'gjenger/spritbartenderne'
                                },
                                {
                                    text: 'Daglighallen',
                                    state: 'gjenger/daglighallen'
                                }
                            ]
                        },
                        {
                            title: 'Servering',
                            items: [
                                {
                                    text: 'Kaféansvarlige',
                                    state: 'gjenger/kafeansvarlige'
                                },
                                {
                                    text: 'Baristaene',
                                    state: 'gjenger/baristaene'
                                },
                                {
                                    text: 'Hovmesterne',
                                    state: 'gjenger/hovmesterne'
                                },
                                {
                                    text: 'Barservitørerne',
                                    state: 'gjenger/barservitorerne'
                                },
                                {
                                    text: 'Souschefene',
                                    state: 'gjenger/souschefene'
                                },
                                {
                                    text: 'Kokkene',
                                    state: 'gjenger/kokkene'
                                }
                            ]
                        },
                        {
                            title: 'Annet',
                            items: [
                                {
                                    text: 'Aktive hangarounds',
                                    state: 'gjenger/aktivehangarounds'
                                },
                                {
                                    text: 'Aktive panger',
                                    state: 'gjenger/aktivepanger'
                                },
                                {
                                    text: 'Savnet',
                                    state: 'gjenger/savnet'
                                }
                            ]
                        },
                    ]
                },
                {
                    title: 'Bank',
                    id: 'bank',
                    itemGroups: [
                        {
                            title: 'Alt',
                            items: [
                                {
                                    text: 'Forbruk',
                                    state: 'bank/forbruk'
                                },
                                {
                                    text: 'Innskudd',
                                    state: 'bank/innskudd'
                                },
                                {
                                    text: 'Overføring',
                                    state: 'bank/overforing'
                                },
                                {
                                    text: 'Prisliste',
                                    state: 'bank/prisliste'
                                },
                                {
                                    text: 'Wanted',
                                    state: 'bank/wanted'
                                }
                            ]
                        }
                    ]
                },
                {
                    title: 'Informasjon',
                    id: 'information',
                    itemGroups: [
                        {
                            title: 'Interngjenger',
                            items: [
                                {
                                    text: 'Styret',
                                    state: 'info/styret'
                                },
                                {
                                    text: 'Arrangement',
                                    state: 'info/arrangement'
                                },
                                {
                                    text: 'Økonomi',
                                    state: 'info/okonomi'
                                },
                                {
                                    text: 'Barsjefene',
                                    state: 'info/barsjefene'
                                },
                                {
                                    text: 'Spritgjengen',
                                    state: 'info/spritgjengen'
                                }
                            ]
                        },
                        {
                            title: 'Lokaler',
                            items: [
                                {
                                    text: 'Lyche',
                                    state: 'info/lokaler/lyche'
                                },
                                {
                                    text: 'Edgar',
                                    state: 'info/lokaler/edgar'
                                },
                                {
                                    text: 'Strossa',
                                    state: 'info/lokaler/strossa'
                                },
                                {
                                    text: 'Selskapssiden',
                                    state: 'info/lokaler/selskapssiden'
                                },
                                {
                                    text: 'Rundhallen',
                                    state: 'info/lokaler/rundhallen'
                                },
                                {
                                    text: 'Klubben',
                                    state: 'info/lokaler/klubben'
                                },
                                {
                                    text: 'Bodegaen',
                                    state: 'info/lokaler/bodegaen'
                                },
                                {
                                    text: 'Daglighallen',
                                    state: 'info/lokaler/daglighallen'
                                },
                                {
                                    text: 'Knaus',
                                    state: 'info/lokaler/knaus'
                                },
                                {
                                    text: 'Biblioteket',
                                    state: 'info/lokaler/biblioteket'
                                }
                            ]
                        },
                        {
                            title: 'Annet',
                            items: [
                                {
                                    text: 'Bindingstider',
                                    state: 'info/bindingstider'
                                },
                                {
                                    text: 'Lingoliste',
                                    state: 'info/lingoliste'
                                },
                                {
                                    text: 'Hybelreglene',
                                    state: 'info/hybelreglene'
                                },
                                {
                                    text: 'StrossaGuiden',
                                    state: 'info/strossaguiden'
                                }
                            ]
                        }
                    ]
                    
                },
                {
                    title: 'Administrator',
                    id: 'admin',
                    itemGroups: [
                        {
                            title: 'Bruker',
                            items: [
                                {
                                    text: 'Min bruker',
                                    state: 'minbruker'
                                },
                                {
                                    text: 'Logg ut',
                                    state: 'logout'
                                }
                            ]
                        }
                    ]
                },

            ];
            $scope.menuByRow = [];

            sortByRow();
        };

        $scope.init();
    }]
);