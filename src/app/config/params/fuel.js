/* global angular:true, $:true */

angular.module('config.system.params.fuel', ['ngRoute', 'app.filters', 'directives.chart'])

.config(['$routeProvider',
    function($routeProvider) {
        'use strict';
        $routeProvider.when('/config/:skey/params/fuel', {
            templateUrl: 'templates/config/params/fuel.tpl.html',
            controller: 'ConfigParamsFuelCtrl',
            resolve: {
                system: ['System', '$route',
                    function(System, $route) {
                        return System.get($route.current.params.skey);
                    }
                ]
            }
        });
    }
])

.controller('ConfigParamsFuelCtrl', ['$scope', 'system', '$timeout',
    function($scope, system, $timeout) {
        'use strict';
        $scope.filtered = true;
        $scope.system = system;
        $scope.valid = null;

        $scope.$watch('system.params.fuel', function(fuel) {
            if (fuel.length === 0) {
                $scope.valid = {
                    index: 0,
                    title: 'Нет даннных'
                };
                return;
            }

            for (var i = 1; i < fuel.length; i++) {
                if (fuel[i].liters <= fuel[i - 1].liters) {
                    $scope.valid = {
                        index: i,
                        title: 'Значения объема топлива должны быть в возрастающей последовательности!'
                    };
                    return;
                }
                if (fuel[i].voltage < fuel[i - 1].voltage) {
                    $scope.valid = {
                        index: i,
                        title: 'Значение напряжения должны быть в неубывающей последовательности!'
                    };
                    return;
                }
            }
            $scope.valid = null;
        }, true);

        $scope.onAdd = function() {
            var liters = 0,
                voltage = 0,
                fuel = $scope.system.params.fuel;
            angular.forEach(fuel, function(l) {
                if (l.liters > liters) liters = l.liters;
                if (l.voltage > voltage) voltage = l.voltage;
            });

            var dliters = 5,
                dvoltage = 0.5,
                len = fuel.length;

            if (len >= 2) {
                dliters = fuel[len - 1].liters - fuel[len - 2].liters;
                dvoltage = fuel[len - 1].voltage - fuel[len - 2].voltage;
            }
            liters = Math.round(liters + dliters); // Округлим до 1
            voltage = Math.round((voltage + dvoltage) * 100) / 100; // Округлим до 0.01

            if (voltage > 10.5)
                voltage = 10.5;

            fuel.push({
                liters: liters,
                voltage: voltage
            });

            $timeout(function() {
                var element = $('ul.config-fuel li:last-child input');
                element[0].focus();
            }, 250);
        };

        $scope.onRemove = function(index) {
            $scope.system.params.fuel.splice(index, 1);
        };

        $scope.sortableOptions = {
            handle: '.msp',
            // revert: true,    // Имеет баг с прокруткой. Если в будущем исправят, то стоит вернуть.
            scrollSpeed: 5,
            cursor: 'crosshair',
            placeholder: 'config-fuel-ui-sortable-placeholder',
            axis: 'y'
        };

    }
]);
