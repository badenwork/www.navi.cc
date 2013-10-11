angular.module('map', ['ngRoute', 'resources.account', 'directives.gmap', 'directives.main', 'directives.timeline', 'resources.geogps', 'i18n', 'directives.language', 'resources.system'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/map', {
        templateUrl:'templates/map/map.tpl.html',
        controller:'MapCtrl',
        resolve:{
            account:['Account', function (Account) {
                //TODO: need to know the current user here
                return Account.get();
            }],
          systems: ['System', function (System) {
            return System.getall();
          }]
        },
        reloadOnSearch: false
    }).
    when('/map/:skey', {
        templateUrl:'templates/map/map.tpl.html',
        controller:'MapCtrl',
        resolve:{
            account:['Account', function (Account) {
                //TODO: need to know the current user here
                return Account.get();
            }],
            systems: ['System', function (System) {
                return System.getall();
            }]
        },
        reloadOnSearch: false
    });
}])

.controller('MapCtrl', ['$scope', '$location', '$route', '$routeParams', 'account', 'systems', 'GeoGPS', '$log', function ($scope, $location, $route, $routeParams, account, systems, GeoGPS, $log) {
    $scope.account = account;
    $scope.systems = systems;
    $scope.skey = $routeParams['skey'];
    $scope.day = $routeParams['day'] || 0;
    $scope.track = null;
    // var fulltrack = null;
    //console.log('MapCtrl', account, systems);
    //$scope.systems = account.account.systems;

    var dp = $('#datepicker').datepicker({
        beforeShowDay: function(date) {
            var hour = (date.valueOf()/1000/3600) | 0,
                day = (hour/24) | 0;
            // console.log("beforeShowDay", day, (hour%2 === 0)?'enabled':'disabled');
            return GeoGPS.checkDay(day)?'enabled':'disabled';
        }
    }).on('changeDate', function(ev){
        var date = ev.date;
        var tz = (new Date()).getTimezoneOffset()/60;
        // var hourfrom = date.valueOf() / 1000 / 3600 + tz;
        var hourfrom = date.valueOf() / 1000 / 3600;
        var day = (hourfrom - tz) / 24;
        // console.log(["datepicker: on changeDate", ev, date]);
        // $log.warn("datepicker:changeDate. Bad path point inn the $scope.path array ");
        // $log.error("datepicker:changeDate. Bad path point inn the $scope.path array ");
        // $log.info("datepicker:changeDate.", $scope);
        $scope.$apply(function(){   // Без этого не будет индикации процесса загрузки
            var params = angular.copy($routeParams);
            angular.extend(params, {day: day});
            $location.search(params);
        });
    });

    // var fake_timeline = function(){
    //     // Пока сгенерируем фальшивые данные
    //     var start = 0;
    //     var data = d3.range(~~(Math.random() * 10)+2).map(function(i){
    //         var stop = start + ~~(Math.random() * 500);
    //         var point = {
    //             counter: i+1,
    //             move: (i%2) === 1,
    //             start: start,
    //             stop: stop
    //         };
    //         start = stop;
    //         return point;
    //     });
    //     if(data[data.length-1].stop < 2500){
    //         data[data.length-1].stop = 2500;
    //     }
    //     // console.log("data=", data);
    //     $scope.timeline = data;
    // }

    // WARNING!!! Это грязный хак!!!
    // Это подавит перезагрузку ng-view и устранит мерцание страницы.
    // var lastRoute = $route.current;
    // $scope.$on('$locationChangeSuccess', function(event) {
    //     $route.current = lastRoute;
    //     console.log("~~~~~~~~~~~~~~~~====> $locationChangeSuccess:", $route, event);
    //     // account.setSkey(skey);
    //     // $scope.$apply();
    // });

    var load_date = function(){
        GeoGPS.select($scope.skey);
        GeoGPS.getHours(0, 1000000)
            .then(function(){
                var day = $scope.day || 0;
                // Недокументированный метод. Метод update изменяет текущий месяц
                $('#datepicker').datepicker("fill");

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

                // console.log("=> Selected day :", day);
                // console.log("=> Selected hour range:", hourfrom, hourfrom + 23);
                // console.log("=> Selected date range:", date, new Date((hourfrom + 24) * 3600 * 1000 - 1000));

                // Имеет баг (я так думаю) UTC
                dateline = dp.datepicker.DPGlobal.formatDate(new Date(date.valueOf() - tz * 3600 * 1000), "mm-dd-yyyy", "ru");
                // console.log('dateline=', dateline);
                dp.datepicker("update", dateline);

            });
    }
    var gettrack = function(){
        if(angular.isUndefined($scope.day)) return;

        var tz = (new Date()).getTimezoneOffset()/60;
        // var day = (hourfrom - tz) / 24;
        var hourfrom = $scope.day * 24 + tz;

        GeoGPS.getTrack(hourfrom, hourfrom+23)  // +23? не 24?
            .then(function(data){
                $scope.track = data;
                $scope.points = data.track.length;
                // fake_timeline();
                $scope.timeline = data.ranges;
            });
    }

    if($scope.skey){
        load_date();
        gettrack();
    }

    $scope.$on("$routeUpdate", function(a, b, c){
        // console.log("~~~~~~~~~~~~~~~~====> $routeUpdate:", a, b, c);
        $scope.skey = $routeParams['skey'];
        $scope.day = $routeParams['day'];
        load_date();
        gettrack();
    });

    $scope.onSelect = function(skey){
        if(angular.isUndefined(skey)) return;

        var s = systems[skey];
        $scope.skey = skey;
        var params = angular.copy($routeParams);
        angular.extend(params, {skey: skey});
        $location.search(params);
        console.log('onSelect', skey, s);
        if(s.dynamic && s.dynamic.latitude && s.dynamic.longitude){
            $scope.center = {lat: s.dynamic.latitude, lon: s.dynamic.longitude};
        }
    }

    // $scope.onSysSelect = function(skey){
    //     // loadTrack(skey);

    //     GeoGPS.select(skey);
    //     GeoGPS.getHours(0, 1000000)
    //         .then(function(){
    //             // Недокументированный метод. Метод update изменяет текущий месяц
    //             $('#datepicker').datepicker("fill");
    //         });
    // };
    $scope.hideTrack = false;
    $scope.track_hide = null;
    $scope.timeLine_hide = [];
    $scope.revertVisibleTrack = function(){
        // console.log("Hide track");
        // //GeoGPS.hideTrack();
        // if(path) {
        //     path.setMap(null);
        //     path = null;
        // }
        if ($scope.hideTrack) {
            $scope.track = $scope.track_hide;
            $scope.timeline = $scope.timeLine_hide
            $scope.track_hide = null;
            $scope.timeLine_hide = [];
            $scope.hideTrack = false;

        } else {
            $scope.track_hide = $scope.track;
            $scope.timeLine_hide = $scope.timeline
            $scope.track = null;
            $scope.timeline = [];
            $scope.hideTrack = true;
        }


    };

    $scope.onTimelineHover = function(d){
        // console.log("onTimelineHover", d);
    }

    $scope.onTimelineClick = function(d){
        // console.log("onTimelineClick", d, $scope.track);
        $scope.$apply(function(){
            if($scope.track.select === d) {
                delete $scope.track.select;
            } else {
                $scope.track.select = d;
            }
        });
    }

    $scope.mapconfig = {
        autobounds: true,   // Автоматическая центровка трека при загрузке
        animation: false,   // Анимация направления трека
        numbers: true,      // Нумерация стоянок/остановок
        centermarker: false // Не показывать маркер центра карты
    };

    $scope.$watch('mapconfig.numbers', function(){
                if ($scope.mapconfig.numbers) {
                    $(".eventmarker .track.STOP span").attr("class", "");
                } else {
                    $(".eventmarker .track.STOP span").attr("class", "hide");
                }
            });

    $scope.showconfig = false;
    // $scope.toggleShowConfig = function(){
    //     $scope.showconfig = !$scope.showconfig;
    //     console.log($scope.showconfig);
    // };
}])

.directive("configMapItem", function(){
    return{
        restrict: 'EA',
        scope: {
            item: "=",
            iconOn: "@",
            iconOff: "@"
         },
        replace: true,
        transclude: true,
        template: '<li ng-click="toggleValue()"><span></span><span ng-transclude></span></li>',
        link: function(scope, element, attrs) {
            var icon = element[0].querySelector('span');
            scope.toggleValue = function(){
                // console.log("toggle", scope.item, scope);
                scope.item = !scope.item;
            };
            scope.$watch("item", function(item){
                icon.className = "icon-" + (item?scope.iconOn:scope.iconOff) + " icon-large";
                if(item){
                    element.addClass("on");
                    element.removeClass("off");
                } else {
                    element.addClass("off");
                    element.removeClass("on");
                }
                // element[0].class =
            });
        }
    };
});

