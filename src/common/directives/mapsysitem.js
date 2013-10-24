/* global angular:true */

angular.module('directives.main', ['newgps.services'])

.directive('mapsyslist', [
    function() {
        'use strict';

        return {
            restrict: 'E',
            scope: {
                account: '=',
                systems: '=',
                skey: '=',
                select: '='
            },
            templateUrl: 'templates/map/mapsyslist.tpl.html',
            replace: true,
            controller: ['$element', '$scope',
                function($element, $scope) {
                    var skeys = $scope.account.account.skeys;
                    var set = {};
                    $scope.filters = [];

                    for (var i = skeys.length - 1; i >= 0; i--) {
                        var skey = skeys[i];
                        var system = $scope.systems[skey];
                        if(system.tags){
                            system.tags.map(function(tag){
                                if(!set.hasOwnProperty(tag)){
                                    set[tag] = tag;
                                    $scope.filters.push({
                                        desc: tag,
                                        filter: tag
                                    });
                                }
                            })
                        }
                    };

                    $scope.zoomlist = 1;
                    $scope.doZoomList = function() {
                        $scope.zoomlist += 1;
                        if ($scope.zoomlist >= 3) $scope.zoomlist = 0;
                    };

                    $scope.popup = function() {
                    };

                    $scope.onSysSelect = function(skey) {
                        $scope.select(skey);
                    };

                    $scope.$watch('sfilter', function(){
                        console.log('fire sfilter', $scope.sfilter);
                    });

                    $scope.filtered = function(list){
                        console.log('filtered', list);
                    }

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
                zoomlist:   '@',
                item:       '=',
                skey:       '=',
                select:     '&'
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

.filter('systemfilter', ['System', function(System){
    return function(list, param){
        if(angular.isUndefined(param) || (param === null)) return list;
        var out = [];
        var tag = param.filter;
        list.map(function(skey){
            var system = System.cached(skey);
            if(system && system.tags){
                if(system.tags.indexOf(tag) >= 0) out.push(skey);
            }
        })
        return out;
    }
}]);
