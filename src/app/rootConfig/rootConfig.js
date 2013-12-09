angular.module('config.root', ['ngRoute', 'resources.account', '$strap.directives', 'resources.geogps', 'resources.system', 'app.filters'])

.config(['$routeProvider',
    function($routeProvider) {

        $routeProvider.when('/rootconfig', {
            templateUrl: 'templates/rootConfig/rootConfig.tpl.html',
            controller: 'RootConfigViewCtrl',
            resolve: {
                account: ['Account',
                    function(Account) {
                        //TODO: sure for fetch only one for the current user
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
        }).
        when('/rootconfig:skey', {
            templateUrl: 'templates/rootConfig/rootConfig.tpl.html',
            controller: 'RootConfigViewCtrl',
            resolve: {
                account: ['Account',
                    function(Account) {
                        //TODO: sure for fetch only one for the current user
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

.controller('RootConfigViewCtrl', ['$scope', 'account', 'systems', '$routeParams', 'GeoGPS',
    function($scope, account, systems, $routeParams, GeoGPS) {

        'use strict';

        $scope.account = account;
        $scope.systems = systems;
        $scope.options = GeoGPS.options;
        $scope.skey = $routeParams.skey;
        if (!$scope.skey)
            $scope.skey = account.account.skeys [0];
        $scope.system = systems [$scope.skey] || null;
        console.log($scope.system);
        var onSysSelect = function () {
            $scope.system = systems [$scope.skey];
        };
        $scope.onSysSelect = onSysSelect;
        onSysSelect ();
        $scope.changeRaw = function () {
            window.localStorage.setItem('lacalRaw', GeoGPS.options.raw);
        };
        $scope.resetSettings = function () {
            if ($scope.system && $scope.system.car) {
                for(var key in GeoGPS.options) {
                    if (key in $scope.system.car) {
                        $scope.system.car [key] = '';
                    }
                }
                $scope.system.$patch('car');
            }
        };
        
        $scope.show_stopAlg = false;            //Описание алгоритма фиксации точки начала стоянки
        $scope.show_moveAlg = false;            //Описание алгоритма фиксации точки начала движения
        $scope.show_motor_onAlg = false;        //Описание алгоритма принятия решения о том что двигатель запущен
        $scope.show_shortTripAlg = false;       //Описание алгоритма удаления коротких поездок
        $scope.show_shortStopsAlg = false;      //Описание алгоритма удаления коротких остановок
        $scope.show_ejectionAlg = false;        //Описание алгоритма удаления выбросов
        $scope.show_clearStopPointAlg = false;  //Описание алгоритма очищения точек стоянки
}]);
