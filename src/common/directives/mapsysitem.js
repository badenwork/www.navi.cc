angular.module('directives.main', ['newgps.services'])

.directive('mapsyslist', [function() {
    return {
        restrict: 'E',
        // require: '?ngModel',
        scope: {
            // zoom: "@",
            account: '=',
            systems: '=',
            skey: '=',
            select: '='
            // select: "&"        // Используется чтобы навесить обработчик на выбор ng-click="select()"
        },
        templateUrl: 'templates/map/mapsyslist.tpl.html',
        replace: true,
        controller: ['$element', '$scope', '$attrs', function($element, $scope, $attrs) {
            $scope.filters = [
                {
                    desc: "личные"
                },
                {
                    desc: "служебные"
                },
                {
                    desc: "партнеры"
                }
            ];

            $scope.zoomlist = 1;
            $scope.doZoomList = function(){
                $scope.zoomlist += 1;
                if($scope.zoomlist >= 3) $scope.zoomlist = 0;
            };

            $scope.popup = function(skey){
                // console.log('mapsyslist:popup', skey);
            };

            $scope.onSysSelect = function(skey){
                // console.log('mapsyslist:onSysSelect', skey);
                $scope.select(skey);
            }

        }]
    }
}])

.directive('mapsysitem', ["$location", "$routeParams", "$freshmark", function($location, $routeParams, $freshmark) {
    return {
        restrict: 'E',
        require: '^mapsyslist',
        scope: {
            zoomlist: "@",
            item: "=",
            skey: "=",
            select: "&"        // Используется чтобы навесить обработчик на выбор ng-click="select()"
         },
        replace: true,
        templateUrl: 'templates/map/mapsysitem.tpl.html',

        controller: ['$element', '$scope', '$attrs', function($element, $scope, $attrs) {

            $scope.popup = false;
            $scope.$routeParams = $routeParams;
            $scope.$freshmark = $freshmark;

            $scope.onClick = function(skey){
                var params = angular.copy($routeParams);
                angular.extend(params, {skey: skey});
                $location.search(params);
                $scope.select(skey);
            };

            $scope.showPopup = function(){
                if($scope.popup !== ''){
                    $scope.popup = 'active';
                } else {
                    $scope.popup = '';
                }
            }
        }]

    };
}]);
