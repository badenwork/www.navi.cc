angular.module('singleReport', ['ngRoute', 'resources.reports', '$strap.directives', 'i18n'])

.config(['$routeProvider',
    function($routeProvider, $routeParams) {

        // $routeProvider.when('/singleReport:skey:hStart:hStop:mE:mD:sE:sD', {
        $routeProvider.when('/singleReport', {
            templateUrl: 'templates/reports/report_single.tpl.html',
            controller: 'SingleReportViewCtrl',
            resolve: {
                report: ['Reports', '$route',
                    function(Reports, $route) {
                        //$locationProvider.html5Mode(true);
                        //console.log ('$routeParams : ', $routeParams);
                        var skey = $route.current.params.skey;
                        var hStart = $route.current.params.hStart;
                        var hStop = $route.current.params.hStop;
                        var mEStr = $route.current.params.mE;
                        var mDStr = $route.current.params.mD;
                        var sEStr = $route.current.params.sE;
                        var sDStr = $route.current.params.sD;
                        var template = Reports.paramsToTemplate (mEStr, mDStr, sEStr, sDStr);
                       return Reports.getSingleReport (skey, hStart, hStop, template);
                    }
                ]
            },
            reloadOnSearch: true
        });
    }
])

.controller('SingleReportViewCtrl', ['$scope', '$location', '$http', 'SERVER', 'GeoGPS', 'System', '$route', '$routeParams', 'i18n', 'report', 'Reports', '$rootScope', '$filter',
    function($scope, $location, $http, SERVER, GeoGPS, System, $route, $routeParams, i18n, report, Reports, $rootScope, $filter) {
        $scope.interval = Reports.getReportInterval (report);
        $scope.report = report;
        $scope.Reports = Reports;
        $scope.updateDowloadLink = function () {  
            
        };
        $scope.mapconfig = {
                autobounds: true, // Автоматическая центровка трека при загрузке
                animation: false, // Анимация направления трека
                numbers: true, // Нумерация стоянок/остановок
                centermarker: true
            };
        $scope.track = null;
        $scope.center = null;
        $scope.mapShow = false;
        
        var createTrack = function (row) {
            var track = {};
            var points = $scope.report.reportData.track.points;
            var startIndex = 0;
            var stopIndex = points.length;
            if (row) {
                startIndex = row.data.start_index;
                stopIndex = row.data.stop_index;
                /*if ($scope.track && $scope.track.startIndex === startIndex) {
                    $scope.hideMap ();
                    return;
                }*/
            }
            var system = $scope.report.system;
            track.events = GeoGPS.getEventsFromPoints (points, startIndex, stopIndex, system);
            track.track = GeoGPS.getTrackFromPoints (points, startIndex, stopIndex);
            track.points = GeoGPS.getPointsFromPoints (points, startIndex, stopIndex);
            track.bounds = GeoGPS.getBoundsFromPoints (points, startIndex, stopIndex);
            return track;
        };
        
        $scope.showMap = function (row) {
            var track = null;
            if (!row) {
                if (!$scope.fullTrack)
                    $scope.fullTrack = createTrack (null);
                track = $scope.fullTrack;
            } else {
                track = createTrack (row);
            }
            $scope.track = track;
            $scope.mapShow = true;
            $scope.$broadcast('setTrack', track);
        };
        $scope.hideMap = function () {
            $scope.mapShow = false;
        };
        Reports.completeSingleReport ($scope.report);
        //TODO: оптимизировать
        var updateUI = function (miliseconds) {
            setTimeout (function () {
                if (report.ready) {
                    $scope.$apply (function () {
                        if (report.reportData.addressesIsReady) {
                            report.dowloadData = Reports.getSingleReportDowloadData ($scope.report);
                            return;
                        }
                    });
                }
                updateUI (miliseconds);
            }, miliseconds);
        };
        updateUI (1000); // Не самое элегантное решение но пока не знаю как заставить оюновлять таблицу при изменении её значений
    }]);
