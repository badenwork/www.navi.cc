/* global angular:true, window:true */

// TODO: Можно переделать на наследника REST
angular.module('resources.account', ['i18n']);

angular.module('resources.account')

.factory('Account', ['SERVER', '$http', '$q', '$timeout', 'Connect', '$rootScope', 'System', '$filter',
    function(SERVER, $http, $q, $timeout, Connect, $rootScope, System, $filter) {
        'use strict';

        var Account = {
            account: null,
            skey: null // Выбранный skey. Используется как глобальное значение сквозь все страницы (Устаревшее)
        };

        $rootScope.$on('$routeChangeSuccess', function(angularEvent, current) {
            Account.skey = current.params.skey;
        });

        Account.get = function(reload) {
            var defer = $q.defer();

            if (!Account.account || reload) {
                if (!SERVER.api_withCredentials) {
                    Account.access_token = window.localStorage.getItem('access_token');
                    if (Account.access_token) {
                        $http.defaults.headers.common.Authorization = 'Bearer ' + Account.access_token;
                    } else {
                        delete $http.defaults.headers.common.Authorization;
                    }
                }

                $http({
                    method: 'GET',
                    url: SERVER.api + '/account'
                })
                    .success(function(data) {
                        if (data) {
                            Account.account = data;
                            Account.account.off = Account.account.off || {};
                            Account.isAuthenticated = true;
                        }

                        defer.resolve(Account);
                    });
            } else {
                defer.resolve(Account);
            }

            return defer.promise;
        };

        Account.logout = function() {
            var defer = $q.defer();

            Account.access_token = null;
            Account.account = null;
            Account.isAuthenticated = false;

            if (SERVER.api_withCredentials) {
                $http.get(SERVER.api + '/logout', {}).success(function() {
                    defer.resolve();
                });
            } else {
                window.localStorage.removeItem('access_token');
                if ($http.defaults.headers.common.Authorization) {
                    delete $http.defaults.headers.common.Authorization;
                }
                defer.resolve();
            }
            return defer.promise;
        };

        Account.login = function(username, password) {
            var defer = $q.defer();
            $http.post(SERVER.api + '/auth', {
                grant_type: 'password',
                username: username,
                password: password
            }).success(function(data) {

                if (!SERVER.api_withCredentials) {
                    window.localStorage.setItem('access_token', data.access_token);
                    $http.defaults.headers.common.Authorization = 'Bearer ' + data.access_token;
                }

                Account.account = data;

                Account.isAuthenticated = true;
                defer.resolve();

            }).error(function() {
                defer.reject();
            });
            return defer.promise;
        };

        Account.register = function(credentials) {
            var defer = $q.defer();
            $http.post(SERVER.api + '/register', credentials)
                .success(function(data, status) {
                    defer.resolve(data, status);
                })
                .error(function(data, status) {
                    var resource = data.errors[0].resource;
                    var code = data.errors[0].code;

                    if (status === 409) {
                        if (resource === 'Group') {
                            if (code === 'exist') {
                                return defer.reject('groupexist');
                            } else if (code === 'wrongpassword') {
                                return defer.reject('grouppassword');
                            }
                        } else if (resource === 'GroupMember') {
                            if (code === 'exist') {
                                return defer.reject('userexist');
                            }
                        }
                    } else if (status === 404) {
                        if (resource === 'Group') {
                            if (code === 'notfound') {
                                return defer.reject('nogroup');
                            }
                        }
                    }
                    defer.reject(data, status);
                });
            return defer.promise;
        };

        Account.systemadd = function(imeis, callback) {
            $http({
                method: 'POST',
                url: SERVER.api + '/account/systems',
                data: {
                    cmd: 'add',
                    imeis: imeis
                }
            }).success(function(data) {
                var systems = data;
                if (systems.length === 1) {
                    if (data[0].result === 'already') {
                        window.alert('Вы уже наблюдаете за этой системой.');
                        return;
                    }
                    if (data[0].result === 'notfound') {
                        window.alert($filter('translate')('system_not_found'));
                        return;
                    }
                }
                for (var i = 0; i < systems.length; i++) {
                    var item = systems[i];
                    if (item.result === 'added') {
                        Account.account.skeys.push(item.system.id);
                        callback(item.system);
                    }
                }
            });
        };

        Account.systemdel = function(skey) {
            $http({
                method: 'DELETE',
                url: SERVER.api + '/account/systems/' + encodeURIComponent(skey)
            }).success(function() {
                var i = Account.account.skeys.indexOf(skey);
                Account.account.skeys.splice(i, 1);
            });
        };

        Account.update = function(param) {
            $http({
                method: 'PATCH',
                url: SERVER.api + '/account',
                data: JSON.stringify(param)
            }).success(function() {});
        };

        // Подготовка к унификации до REST
        Account.$patch = function(field) {
            var data = {};
            data[field] = Account.account[field];

            $http({
                method: 'PATCH',
                url: SERVER.api + '/account',
                data: JSON.stringify(data)
            }).success(function() {});
        };

        Account.setSkey = function(skey) {
            Account.skey = skey;
        };

        Connect.on('account', function(message) {
            if (Account.account.username === message.id) {
                angular.extend(Account.account, message.data);
            }
        });

        return Account;
    }
]);

