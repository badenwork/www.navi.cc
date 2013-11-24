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
        
        Reports.completeSingleReport ($scope.report);
        //TODO: оптимизировать
        var updateUI = function (miliseconds) {
            setTimeout (function () {
                $scope.$apply (function () {
                    if (report.reportData.addressesIsReady) {
                        report.dowloadData = Reports.getSingleReportDowloadData ($scope.report);
                        return;
                    }
                    updateUI (miliseconds);
                });
            }, miliseconds);
        };
        updateUI (1000); // Не самое элегантное решение но пока не знаю как заставить оюновлять таблицу при изменении её значений
    }]);
