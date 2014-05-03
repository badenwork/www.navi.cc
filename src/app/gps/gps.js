/* global angular:true, $:true */

angular.module('gps', ['ngRoute', 'resources.account', 'resources.params', 'resources.geogps', 'app.filters', 'config.system.params.master', 'pasvaz.bindonce', 'infinite-scroll', 'i18n', 'services.xlsx'])

.config(['$routeProvider',
    function($routeProvider) {
        'use strict';
        $routeProvider.when('/gps', {
            templateUrl: 'templates/gps/gps.tpl.html',
            controller: 'GPSViewCtrl',
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
            }
        })
            .when('/gps/:skey', {
                templateUrl: 'templates/gps/gps.tpl.html',
                controller: 'GPSViewCtrl',
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
                }
            })
            .when('/gps/:skey/:day', {
                templateUrl: 'templates/gps/gps.tpl.html',
                controller: 'GPSViewCtrl',
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
                }
            });
    }
])

.controller('GPSViewCtrl', ['$scope', '$route', '$routeParams', '$location', 'account', 'systems', 'GeoGPS', '$filter', 'i18n', 'XLSX', '$timeout',
    function($scope, $route, $routeParams, $location, account, systems, GeoGPS, $filter, i18n, XLSX, $timeout) {
        'use strict';
        var day = $scope.day = $routeParams.day || 0;

        $scope.skey = $routeParams.skey;
        $scope.account = account;
        $scope.systems = systems;
        $scope.track = null;

        var date;
        var hourfrom;

        // var tz = (new Date()).getTimezoneOffset() / 60;
        var tz;

        if ((1 * day) === 0) {
            hourfrom = (new Date((new Date()).toDateString())).valueOf() / 1000 / 3600;
            date = new Date(hourfrom * 3600 * 1000);
        } else if ((1 * day) === -1) {
            hourfrom = (new Date((new Date()).toDateString())).valueOf() / 1000 / 3600 - 24;
        } else {
            hourfrom = day * 24;
            tz = (new Date(hourfrom * 3600 * 1000)).getTimezoneOffset() / 60;   // Уточняем временную зону
            hourfrom = day * 24 + tz;
        }
        date = new Date(hourfrom * 3600 * 1000);
        $scope.datetime = hourfrom * 3600;

        $scope.onSysSelect = function() {
            if ($scope.skey) {
                $location.path('/gps/' + $scope.skey);
                $location.replace();
            } else {
                $location.path('/gps');
                $location.replace();
            }
        };

        $scope.gpsdata = [{
            lat: 1.0,
            lon: 1.0
        }];
        $scope.disableFilters = sessionStorage.getItem('sessionRaw') === 'true';
        console.log ("disableFilters : ", $scope.disableFilters);
        $scope.mapconfig = {
            autobounds: true, // Автоматическая центровка трека при загрузке
            animation: false, // Анимация направления трека
            numbers: true, // Нумерация стоянок/остановок
            filtersOn: !$scope.disableFilters, //Отключить фильтры
            centermarker: true
        };

        $scope.exporturl = null;
        var xlsxdoc = function(data){
            var worksheets = [
            {
                data: [
                    [{
                        value: 'Время',
                        autoWidth: true
                        // width: '5cm'
                    },{
                        value: 'Координаты',
                        autoWidth: true
                    },{
                        value: 'Спутники',
                        autoWidth: true
                    }, {
                        value: 'Скорость',
                        autoWidth: false
                    }, {
                        value: 'Uосн',
                        autoWidth: true
                    }, {
                        value: 'Uрез',
                        autoWidth: true
                    }, {
                        value: 'Топл',
                        autoWidth: false
                    }]
                ],
                table: true,
                name: 'Экспорт GPS'
                // colWidth: ['1cm', '2cm', '3cm', '4cm', '5cm', '6cm', '7cm']
            }];
            // console.log('data', data);
            var datetimeFilter = $filter('datetime');
            var numberFilter = $filter('number');

            data.points.forEach(function(p){
                worksheets[0].data.push([
                    datetimeFilter(p.dt),
                    numberFilter(p.lat, 4) + ',' + numberFilter(p.lon, 4),
                    p.sats,
                    {
                        formatCode: '0.0',
                        value: p.speed
                    },
                    {
                        formatCode: '0.0',
                        value: p.vout
                    },
                    {
                        formatCode: '0.0',
                        value: p.vin
                    },
                    {
                        formatCode: '0.0',
                        value: p.fuel
                    }
                ]);
            });

            var sheet = new XLSX.document('exportgps', worksheets);
            $scope.exporturl = sheet.url();
        };

        var getTrack = function () {
            GeoGPS.select($scope.skey);
            // GeoGPS.setOptions({raw: true});
            if ($scope.disableFilters)
                GeoGPS.options.raw = true;
            else
                GeoGPS.options.raw = false;
            GeoGPS.getTrack(hourfrom, hourfrom + 23, $scope.disableFilters)
                .then(function(data) {
                    if ($scope.isUpdate) {
                        data.update = true;
                        $scope.isUpdate = false;
                    }
                    $scope.track = data;
                    $scope.$broadcast('setTrack', data);
                    $scope.myPagingFunction();

                    if(0) xlsxdoc(data);

                    // console.log('$scope.exporturl=', $scope.exporturl);

                });

            $scope.onMouseOver = function(g) {
                $scope.center = g;
            };
        };

        if ($scope.skey && ($scope.skey !== '') && ($scope.skey !== '+')) {
            getTrack ();
        }
        $scope.$watch ('mapconfig.filtersOn', function (filtersOn) {
            $scope.disableFilters = !filtersOn;
            if ($scope.disableFilters)
                sessionStorage.setItem('sessionRaw', true);
            else
                sessionStorage.removeItem('sessionRaw');
            if (angular.isUndefined ($scope.isUpdate))
                $scope.isUpdate = false;
            else {
                $scope.isUpdate = true;
                getTrack ();
            }
        });

        var items = $scope.items = [];
        var ITEMS = 100; // По идее нужно вычислять в зависимости от высоты страницы

        var last_target;
        $scope.onMouse = function(e) {
            var target = e.target;
            for (var i = 0;
                (i < 10) && !target.className.match(/georow/); i++) { // Не самое элегантное решение, но сойдет.
                target = target.parentNode;
            }
            if (last_target !== target) {
                last_target = target;
                var index = target.getAttribute('index');
                $scope.center = items[index];
            }
        };

        $scope.alldata = false;
        $scope.myPagingFunction = function() {
            if (!$scope.track) return;
            var offset = items.length;

            // Нужен обратный порядок.
            var l = $scope.track.points.length;
            // TODO: Грязный хак. Почему-то если точка всего одна, то данные не отображаются, впоследствии нужно разобраться
            if(l === 1) {
                items.push ($scope.track.points[0]);
                return;
            }
            var start = Math.max(0, l - offset - 1);
            var stop = Math.max(0, l - offset - 1 - ITEMS);
            if ((start === 0) && (stop === 0)) return;
            for (var i = start; i >= stop; i--) {
                items.push ($scope.track.points[i]);
            }
            if(items.length >= $scope.track.points.length) {
                $scope.alldata = true;
            }
        };

        $scope.allprogress = 'icon-forward';
        $scope.loadAllData = function(){
            $scope.allprogress = "icon-repeat icon-spin";
            $timeout(function(){
                while(items.length < $scope.track.points.length) {
                    $scope.myPagingFunction();
                }
                $scope.allprogress = "";
            }, 200);
        };

        var dp = $('#inputDate').datepicker({
            language: i18n.shortLang(),
            todayBtn: 'linked',
            autoclose: true
        }).on('changeDate', function(ev) {
            $scope.$apply(function() {
                var date = ev.date;
                var tz = (date).getTimezoneOffset() / 60;
                var newday = (date.valueOf() / 1000 / 3600 - tz) / 24;
                $location.path('/gps/' + $scope.skey + '/' + newday);
            });
        });

        tz = (date).getTimezoneOffset() / 60;

        var dateline = dp.datepicker.DPGlobal.formatDate(new Date(date.valueOf() - tz * 3600 * 1000), 'mm-dd-yyyy', 'ru');
        dp.datepicker('update', dateline);

        $scope.selectday = function(day) {
            $location.path('/gps/' + $scope.skey + '/' + day);
        };

        $scope.geogpsconfig = GeoGPS.getOptions();
        // console.log("$scope.geogpsconfig=", $scope.geogpsconfig);


    }
]);
