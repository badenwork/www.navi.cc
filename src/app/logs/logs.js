/* global angular:true */

angular.module('logs', ['ngRoute', 'resources.account', 'resources.system', 'resources.logs', 'pasvaz.bindonce'])

.config(['$routeProvider',
    function($routeProvider) {
        'use strict';
        $routeProvider.when('/logs', {
            templateUrl: 'templates/logs/logs.tpl.html',
            controller: 'LogsViewCtrl',
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
                ],
                logs: [
                    function() {
                        return {
                            data: []
                        };
                    }
                ]
            }
        })
            .when('/logs/:skey', {
                templateUrl: 'templates/logs/logs.tpl.html',
                controller: 'LogsViewCtrl',
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
                    ],
                    logs: ['Logs', '$route',
                        function(Logs, $route) {
                            return Logs.get($route.current.params.skey);
                        }
                    ]
                }
            });
    }
])

.controller('LogsViewCtrl', ['$scope', '$location', '$route', '$routeParams', 'account', 'systems', 'logs', 'Logs',
    function($scope, $location, $route, $routeParams, account, systems, logs, Logs) {
        'use strict';
        $scope.account = account.account;
        $scope.systems = systems;
        $scope.skey = $routeParams.skey;

        $scope.logs = logs.data;
        $scope.comment = 'Данные еще не получены';

        $scope.onSysSelect = function() {
            if ($scope.skey) {
                $location.path('/logs/' + $scope.skey);
                $location.replace();
            } else {
                $location.path('/logs');
                $location.replace();
            }
        };

        $scope.onReload = function() {
            $route.reload();
        };

        $scope.onRemove = function(lkey, i){
            window.console.log('Log remove', lkey, i, $scope.logs);
            Logs.del_by_key(lkey)
            .then(function(data){
                console.log('Del ok', data);
                $scope.logs.splice(i, 1);
            }, function(data){
                console.log('Del fail', data);
            });

        };

        $scope.isAdmin = function(){
            return $.inArray('admin', account.account.groups) >= 0;
        };
    }
]);
