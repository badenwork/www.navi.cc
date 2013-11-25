/* global angular:true, $:true */

angular.module('map', ['ngRoute', 'resources.account', 'directives.gmap', 'directives.main', 'directives.timeline', 'resources.geogps', 'i18n', 'directives.language', 'resources.system'])

.config(['$routeProvider',
    function($routeProvider) {
        'use strict';
        $routeProvider.when('/map', {
            templateUrl: 'templates/map/map.tpl.html',
            controller: 'MapCtrl',
            resolve: {
                account: ['Account',
                    function(Account) {
                        return Account.get();
                    }
                ],
                systems: ['System',
                    function(System) {
                        return System.getall();
                    }
                ]
            },
            reloadOnSearch: false
        })

        .when('/map/:skey', {
            templateUrl: 'templates/map/map.tpl.html',
            controller: 'MapCtrl',
            resolve: {
                account: ['Account',
                    function(Account) {
                        return Account.get();
                    }
                ],
                systems: ['System',
                    function(System) {
                        return System.getall();
                    }
                ]
            },
            reloadOnSearch: false
        });
    }
])

.controller('MapCtrl', ['$scope', '$location', '$route', '$routeParams', 'account', 'systems', 'GeoGPS', '$log', 'i18n',
    function($scope, $location, $route, $routeParams, account, systems, GeoGPS, $log, i18n) {
        'use strict';
        $scope.account = account;
        $scope.systems = systems;
        $scope.skey = $routeParams.skey;
        $scope.day = $routeParams.day || 0;
        $scope.track = null;
        $scope.points = 0;
        $scope.mapDelegat = {};

        var dp = $('#datepicker').datepicker({
            language: i18n.shortLang(),
            beforeShowDay: function(date) {
                date.setHours(-date.getTimezoneOffset() / 60);
                var hour = (date.valueOf() / 1000 / 3600) | 0,
                    day = (hour / 24) | 0;
                // console.log('beforeShowDay', day, hour);
                return GeoGPS.checkDay(day) ? 'enabled' : 'disabled';
            }
        }).on('changeDate', function(ev) {
            var date = ev.date;
            // var tz = (new Date()).getTimezoneOffset() / 60;
            var tz = (date).getTimezoneOffset() / 60;
            var hourfrom = date.valueOf() / 1000 / 3600;
            var day = (hourfrom - tz) / 24;
            // console.log('changeDate', date, tz, hourfrom, day);
            $scope.$apply(function() { // Без этого не будет индикации процесса загрузки
                var params = angular.copy($routeParams);
                angular.extend(params, {
                    day: day
                });
                $location.search(params);
                $location.replace();
                $scope.updateTrack ();
            });
        });

        var load_date = function() {
            GeoGPS.select($scope.skey);
            GeoGPS.getHours(0, 1000000)
                .then(function() {
                    var day = $scope.day || 0;
                    // Недокументированный метод. Метод update изменяет текущий месяц
                    $('#datepicker').datepicker('fill');

                    var tz = (new Date()).getTimezoneOffset() / 60,
                        hourfrom, date;

                    if ((1 * day) === 0) {
                        hourfrom = (new Date((new Date()).toDateString())).valueOf() / 1000 / 3600;
                        date = new Date(hourfrom * 3600 * 1000);
                    } else if ((1 * day) === -1) {
                        hourfrom = (new Date((new Date()).toDateString())).valueOf() / 1000 / 3600 - 24;
                    } else {
                        hourfrom = day * 24 + tz;
                    }
                    date = new Date(hourfrom * 3600 * 1000);
                    $scope.datetime = hourfrom * 3600;

                    // Имеет баг (я так думаю) UTC
                    var dateline = dp.datepicker.DPGlobal.formatDate(new Date(date.valueOf() - tz * 3600 * 1000), 'mm-dd-yyyy', 'ru');
                    dp.datepicker('update', dateline);

                });
        };

        var gettrack = function() {
            if (angular.isUndefined($scope.day)) return;

            var tz = (new Date()).getTimezoneOffset() / 60;
            var hourfrom = $scope.day * 24 + tz;

            GeoGPS.getTrack(hourfrom, hourfrom + 23) // +23? не 24?
            .then(function(data) {
                data.update = !!$scope.isUpdate;
                if ($scope.mapDelegat.setTrack)
                    $scope.mapDelegat.setTrack (data);
                $scope.track = data;
                $scope.points = data.track.length;
                $scope.timeline = data.ranges;
            });   
        };
        var loadTrack = function () {
            $scope.isUpdate = false;
            load_date();
            gettrack();
        };
        
        var updateTrack = function () {
            //console.log("updateTrack");
            $scope.isUpdate = true;
            load_date();
            gettrack();
        };
        $scope.updateTrack = updateTrack;
        if ($scope.skey) {
            loadTrack ();
        }
        
        
        $scope.$on('$routeUpdate', function() {
            $scope.skey = $routeParams.skey;
            $scope.day = $routeParams.day;
            loadTrack ();
        });

        $scope.onSelect = function(skey) {
            if (angular.isUndefined(skey)) return;

            var s = systems[skey];
            if ($scope.skey === skey) {
                $scope.updateTrack ();
            }
            $scope.skey = skey;
            var params = angular.copy($routeParams);
            angular.extend(params, {
                skey: skey
            });
            
            $location.search(params);
            if (s.dynamic && s.dynamic.latitude && s.dynamic.longitude) {
                $scope.center = {
                    lat: s.dynamic.latitude,
                    lon: s.dynamic.longitude
                };
            }
        };

        $scope.onTimelineHover = function() {};

        $scope.onTimelineClick = function(d) {
            $scope.$apply(function() {
                if ($scope.track.select === d) {
                    delete $scope.track.select;
                } else {
                    $scope.track.select = d;
                }
            });
        };

        $scope.onHide = function(){
            $scope.points = 0;
            $scope.timeline = [];
            if($scope.track.select) delete $scope.track.select;
            var params = angular.copy($routeParams);
            if(params.hasOwnProperty('day')) delete params.day;
            $location.search(params);
            $location.replace();
        };

        $scope.mapconfig = {
            autobounds: true, // Автоматическая центровка трека при загрузке
            animation: false, // Анимация направления трека
            numbers: true, // Нумерация стоянок/остановок
            centermarker: false // Не показывать маркер центра карты
        };

        // $scope.$watch('map', function(map){
        //     if(!map) return;
        //     console.log('map = ', map);
        // });
    }
]);
