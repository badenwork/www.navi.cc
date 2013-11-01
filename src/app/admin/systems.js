
angular.module('admin.systems', ['ngRoute'])

.config(['$routeProvider',
    function($routeProvider) {
        'use strict';

        $routeProvider.when('/admin/systems', {
            templateUrl: 'templates/admin/systems.tpl.html',
            controller: 'AdminSystemsViewCtrl',
            resolve: {
                systems: ['System',
                    function(System) {
                        return System.get('all');
                    }
                ]
            }
        });
    }
])

.controller('AdminSystemsViewCtrl', ['$scope', 'systems',
    function($scope, systems) {
        'use strict';
        $scope.systems = systems;
        console.log('systems=', systems);


    }
])

.directive('blobData', [
    function(){
        'use strict';
        return {
            restrict: 'E',
            scope: {
                data: '=',
                field: '@'
            },
            replace: true,
            template: '<a href="#" download="imei-full.txt">Загрузить</a>',
            link: function(scope, element){

                scope.$watch('data', function(){
                    console.log('data=', scope.data);
                    var out = [];
                    scope.data.forEach(function(d){
                        out.push(d[scope.field] + '\n');
                    });

                    var blob = new Blob([out.join('')], { type: "application/text" });
                    var blobURL = URL.createObjectURL(blob);
                    console.log("blob=", blob, blobURL);
                    element[0].href = blobURL;
                });
            }
        };
    }
]);
