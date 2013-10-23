angular.module('gps', ['ngRoute', 'resources.account', 'resources.params', 'resources.geogps', 'app.filters', 'config.system.params.master', 'pasvaz.bindonce', 'infinite-scroll', 'i18n'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/gps', {
        templateUrl:'templates/gps/gps.tpl.html',
        controller:'GPSViewCtrl',
        resolve:{
            account:['Account', function (Account) {
                return Account.get();
            }],
            systems: ['System', function (System) {
                return System.getall();
            }]
        }
    })
    .when('/gps/:skey', {
        templateUrl:'templates/gps/gps.tpl.html',
        controller:'GPSViewCtrl',
        resolve:{
            account:['Account', function (Account) {
                return Account.get();
            }],
            systems: ['System', function (System) {
                return System.getall();
            }]
        }
    })
    .when('/gps/:skey/:day', {
        templateUrl:'templates/gps/gps.tpl.html',
        controller:'GPSViewCtrl',
        resolve:{
            account:['Account', function (Account) {
                return Account.get();
            }],
            systems: ['System', function (System) {
                return  System.getall();
            }]
        }
    });
}])

.controller('GPSViewCtrl', ['$scope', '$route', '$routeParams', '$location', 'account', 'systems', 'GeoGPS', '$filter', 'i18n', function ($scope, $route, $routeParams, $location, account, systems, GeoGPS, $filter, i18n) {
    var day = $scope.day = $routeParams['day'] || 0;

    $scope.skey = $routeParams['skey'];
    $scope.account = account;
    $scope.systems = systems;
    $scope.track = null;

    var date;
    var hourfrom;

    var tz = (new Date()).getTimezoneOffset()/60;

    if((1*day) === 0){
        hourfrom = (new Date((new Date()).toDateString())).valueOf() / 1000 / 3600;
        date = new Date(hourfrom * 3600 * 1000);
    } else if((1*day) === -1){
        hourfrom = (new Date((new Date()).toDateString())).valueOf() / 1000 / 3600 - 24;
    } else {
        hourfrom = day * 24 + tz;
    }
    date = new Date(hourfrom * 3600 * 1000);
    $scope.datetime = hourfrom * 3600;

    $scope.onSysSelect = function(){
        if($scope.skey){
            $location.path('/gps/' + $scope.skey);
        } else {
            $location.path('/gps');
        }
    }

    $scope.gpsdata = [{lat: 1.0, lon: 1.0}];

    $scope.mapconfig = {
        autobounds: true,   // Автоматическая центровка трека при загрузке
        animation: false,   // Анимация направления трека
        numbers: true,      // Нумерация стоянок/остановок
        centermarker: true
    };

    if($scope.skey && ($scope.skey != '') && ($scope.skey != '+')){
        GeoGPS.select($scope.skey);
        GeoGPS.getTrack(hourfrom, hourfrom+23)
            .then(function(data){
                $scope.track = data;
                $scope.myPagingFunction();
            });

        $scope.onMouseOver = function(g) {
            $scope.center = g;
        };
    }

    var items = $scope.items = [];
    var ITEMS = 100;    // По идее нужно вычислять в зависимости от высоты страницы

    var last_target;
    $scope.onMouse = function(e){
        var target = e.target;
        for(var i=0; (i<10) && !target.className.match(/georow/); i++){    // Не самое элегантное решение, но сойдет.
            target = target.parentNode;
        }
        if(last_target !== target){
            last_target = target;
            var index = target.getAttribute('index');
            $scope.center = items[index];
        }
    }

    $scope.myPagingFunction = function(){
        if(!$scope.track) return;
        var offset = items.length;

        // Нужен обратный порядок.
        var l = $scope.track.points.length;
        var start = Math.max(0, l - offset - 1);
        var stop = Math.max(0, l - offset - 1 - ITEMS);
        if((start===0) && (stop===0)) return;
        for(var i = start; i >= stop; i--){
            items.push($scope.track.points[i]);
        }
    }

    var dp = $('#inputDate').datepicker({
        language: i18n.shortLang(),
        todayBtn: "linked",
        autoclose: true
    }).on('changeDate', function(ev){
        $scope.$apply(function(){
            var date = ev.date;
            var newday = (date.valueOf() / 1000 / 3600 - tz) / 24;
            $location.path('/gps/' + $scope.skey + '/' + newday);
        });
    });

    dateline = dp.datepicker.DPGlobal.formatDate(new Date(date.valueOf() - tz * 3600 * 1000), "mm-dd-yyyy", "ru");
    dp.datepicker("update", dateline);

    $scope.selectday = function(day){
        $location.path('/gps/' + $scope.skey + '/' + day);
    }

}]);
