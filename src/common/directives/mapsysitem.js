/* global angular:true */

angular.module('directives.main', ['newgps.services', 'services.tags'])

.directive('mapsyslist', [
    function() {
        'use strict';

        return {
            restrict: 'E',
            scope: {
                account: '=',
                systems: '=',
                skey: '=',
                select: '=',
                // onFilter: '='
                sfilter: '='
            },
            templateUrl: 'templates/map/mapsyslist.tpl.html',
            replace: true,
            controller: ['$element', '$scope', 'Tags',
                function($element, $scope, Tags) {
                    var skeys = $scope.account.account.skeys;

                    Tags.reload();
                    $scope.filters = Tags.filters;

                    $scope.zoomlist = (localStorage.getItem('maplist.zoomlist') || '1') | 0;
                    $scope.doZoomList = function() {
                        $scope.zoomlist += 1;
                        if ($scope.zoomlist >= 3) $scope.zoomlist = 0;
                        localStorage.setItem('maplist.zoomlist', $scope.zoomlist);
                    };

                    $scope.popup = function() {};

                    $scope.onSysSelect = function(skey) {
                        $scope.select(skey);
                    };

                    // $scope.$watch('sfilter', function(filter) {
                    //     console.log('change filter', filter);
                    // });
                    //     console.log($scope.onFilter, $scope.sfilter);
                    //     $scope.onFilter($scope.sfilter);
                    // //     console.log('fire sfilter', $scope.sfilter);
                    // });

                    // $scope.filtered = function(list) {
                    //     console.log('filtered', list);
                    // };

                }
            ]
        };
    }
])

.directive('mapsysitem', ['$location', '$routeParams', '$freshmark',
    function($location, $routeParams, $freshmark) {
        'use strict';

        return {
            restrict: 'E',
            require: '^mapsyslist',
            scope: {
                zoomlist: '@',
                item: '=',
                skey: '=',
                select: '&'
            },
            replace: true,
            templateUrl: 'templates/map/mapsysitem.tpl.html',

            controller: ['$element', '$scope',
                function($element, $scope) {
                    $scope.popup = false;
                    $scope.$routeParams = $routeParams;
                    $scope.$freshmark = $freshmark;

                    $scope.onClick = function(skey) {
                        var params = angular.copy($routeParams);
                        angular.extend(params, {
                            skey: skey
                        });
                        $location.search(params);
                        $location.replace();
                        $scope.select(skey);
                    };

                    $scope.showPopup = function() {
                        if ($scope.popup !== '') {
                            $scope.popup = 'active';
                        } else {
                            $scope.popup = '';
                        }
                    };
                }
            ]

        };
    }
])

.filter('systemfilter', ['System',
    function(System) {
        return function(list, param) {
            if (angular.isUndefined(param) || (param === null)) return list;
            var out = [];
            var tag = param.filter;
            list.map(function(skey) {
                var system = System.cached(skey);
                if (system && system.tags) {
                    if (system.tags.indexOf(tag) >= 0) out.push(skey);
                }
            });
            return out;
        };
    }
]);
