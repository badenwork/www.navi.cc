/* global angular:true, d3:true, moment:true */

angular.module('admin.gpspurge', ['ngRoute', 'app.services.imeicheck', 'resources.geogps2', 'directives.datepicker'])

.config(['$routeProvider',
    function($routeProvider) {
        'use strict';

        $routeProvider.when('/admin/systems/purge/:skey?', {
            templateUrl: 'templates/admin/gpspurge.tpl.html',
            controller: 'AdminSystemsPurgeViewCtrl',
            resolve: {
                // system: ['System', '$route',
                //     function(System, $route) {
                //         var skey = $route.current.params.skey;
                //         window.console.log('key=', skey);

                //         return System.get($route.current.params.skey);
                //     }
                // ],

                // hours: ['GeoGPS2', '$route', function(GeoGPS2, $route){
                //     var skey = $route.current.params.skey;
                //     return GeoGPS2.getHours(skey, 0, 1000000);
                // }]

            }
        });
    }
])

// .controller('AdminSystemsPurgeViewCtrl', ['$scope', 'system', 'hours', 'System', 'imeicheck', 'GeoGPS2', 'Logs',
//     function($scope, system, hours, System, imeicheck, GeoGPS2, Logs) {
.controller('AdminSystemsPurgeViewCtrl', ['$scope', 'System', 'imeicheck', 'GeoGPS2', 'Logs',
    function($scope, System, imeicheck, GeoGPS2, Logs) {
        'use strict';
        // $scope.system = system;
        // $scope.hours = hours;
        // window.console.log('system=', system);
        // window.console.log('hours=', hours);

        $scope.trackers = [];


        $scope.hwids = function(hwid) {
            return System.hwids[hwid] || '?';
        };

        $scope.onFromFiles = function() {
            // angular.forEach($scope.files, function(value, key){
            //     $scope.addOne(value);
            // });
            angular.forEach($scope.files, $scope.addOne);
        };

        $scope.addOne = function(imei){
            var isNew = true;
            angular.forEach($scope.trackers, function(value){
                if(value.imei === imei) isNew = false;
            });
            if(!isNew) return;
            window.console.log('addOne', imei);
            var skey = System.imei2key(imei);
            GeoGPS2.getHours(skey, 0, 1000000)
                .then(function(data){
                    window.console.log('Hours data=', data);
                    var nowhour = (+(new Date()) / 3600 / 1000) | 0;
                    var minmax = d3.extent(data.hours.filter(function(d){return d < nowhour;}));
                    window.console.log('minmax=', minmax);
                    $scope.trackers.push({
                        imei: imei,
                        msg: '',
                        valid: true,
                        hours: data.hours.length,
                        min: minmax[0] * 3600,
                        max: minmax[1] * 3600 + 3599
                    });
                }, function(data){
                    window.console.log('error', data);
                    $scope.trackers.push({
                        imei: imei,
                        msg: '',
                        valid: false,
                        hours: 0
                    });
                });
            $scope.purge_waring = false;
            $scope.purge_range = false;
        };

        $scope.onRemove = function(index){
            $scope.trackers.splice(index, 1);
            return false;
        };

        var format = d3.time.format('%d/%m/%Y');
        var today = format.parse(format(moment().toDate()));

        $scope.dateFrom = today;
        $scope.dateTo = moment(today).add('seconds', 24*60*60-1).toDate();
        $scope.range = true;

        $scope.changeDate = function(){
            window.console.log('changeDate');
        };

        var format_full = d3.time.format('%d/%m/%Y %H:%M:%S');
        $scope.format = function(date){
            return format_full(date);
        };

        $scope.onPurgeAll = function(){
            $scope.onPurgeRange(new Date(0), new Date(1e13));
            $scope.onPurgeLogs();
        };

        $scope.onPurgeRange = function(dateFrom, dateTo){
            window.window.console.log('onPurgeRange', dateFrom, dateTo);
            angular.forEach($scope.trackers, function(value){
                var skey = System.imei2key(value.imei);
                var hourFrom = (dateFrom / 1000 / 3600) | 0;
                var hourTo = (dateTo / 1000 / 3600) | 0;
                window.window.console.log('onPurgeRange', value, hourFrom, hourTo);
                GeoGPS2.del(skey, hourFrom, hourTo)
                .then(function(data){
                    console.log('GeoGPS2 del ok', data);
                    value.msg +='Точки удалены. ';
                    value.success = true;
                }, function(data){
                    console.log('GeoGPS2 del fail', data);
                    value.msg +='Точки не удалены. ';
                });
            });
        };

        $scope.onPurgeLogs = function(){
            window.window.console.log('onPurgeLogs');
            // Logs()
            angular.forEach($scope.trackers, function(value){
                var skey = System.imei2key(value.imei);
                window.window.console.log('onPurgeLogs', value);
                Logs.del(skey, 'all')
                .then(function(data){
                    console.log('Del ok', data);
                    value.msg += 'События удалены. ';
                    value.success = true;
                }, function(data){
                    console.log('Del fail', data);
                    value.msg += 'События не удалены. ';
                });
            });
        };

    }
]);


