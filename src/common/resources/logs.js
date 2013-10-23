(function(angular) {
    'use strict';

    angular.module('resources.logs', ['services.connect'])

    .factory('Logs', ['SERVER', '$http', 'Connect', '$rootScope', '$q',
        function(SERVER, $http, Connect, $rootScope, $q) {

            var Logs = {
                data: []
            };

            Logs.get = function(skey) {
                var defer = $q.defer();
                $http({
                    method: 'GET',
                    url: SERVER.api + '/systems/' + encodeURIComponent(skey) + '/logs'
                }).success(function(data) {
                    Logs.data = data;
                    defer.resolve(Logs);
                });
                return defer.promise;
            };

            return Logs;

        }
    ]);

})(this.angular);
