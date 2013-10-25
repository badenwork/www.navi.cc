/* global angular:true, $:true */

angular.module('config.system.info', ['ngRoute', '$strap', 'resources.params', 'app.filters', 'config.system.params.master', 'config.system.params.fuel', 'services.tags'])

.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/config/:skey/info', {
            templateUrl: 'templates/config/info.tpl.html',
            controller: 'ConfigInfoCtrl',
            resolve: {
                account: ['Account',        // Да, вот такие жертвы ради списка ярлыков
                    function(Account) {
                        return Account.get();
                    }
                ],
                system: ['System', '$route',
                    function(System, $route) {
                        return System.get($route.current.params.skey);
                    }
                ]
            }
        });
    }
])

.controller('ConfigInfoCtrl', ['$scope', '$route', '$routeParams', 'account', 'system', 'System', 'Tags',
    function($scope, $route, $routeParams, account, system, System, Tags) {
        $scope.system = system;
        $scope.skey = $routeParams.skey;

        $scope.tofuel = function() {
            return System.$fuel(system, system.dynamic.fuel);
        };

        $scope.filtered = function(items) {
            var result = {};
            angular.forEach(items, function(value, key) {
                if ($scope.showall || value.hasOwnProperty('primary')) {
                    result[key] = value;
                }
            });
            return result;
        };

        $scope.caricons = ('caricon-android-1 caricon-reddit caricon-plancast caricon-angellist caricon-home caricon-cloud caricon-umbrella caricon-star ' +
            'caricon-star-empty caricon-attention caricon-flight caricon-flight-1 caricon-accessibility caricon-paper-plane-1 ' +
            'caricon-money caricon-beaker caricon-truck-1 caricon-attach caricon-guidedog caricon-lightbulb caricon-blind ' +
            'caricon-basket caricon-paper-plane caricon-traffic-cone caricon-cc caricon-emo-happy caricon-aboveground-rail caricon-airfield ' +
            'caricon-airport caricon-emo-devil caricon-belowground-rail caricon-bicycle caricon-bus caricon-ferry caricon-garden ' +
            'caricon-giraffe caricon-grocery-store caricon-heliport caricon-pitch caricon-police caricon-rail caricon-skiing ' +
            'caricon-swimming caricon-crown caricon-twitter caricon-user-md caricon-ambulance caricon-fighter-jet caricon-h-sigh ' +
            'caricon-github caricon-shield caricon-extinguisher caricon-rocket caricon-anchor caricon-apple caricon-android ' +
            'caricon-linux caricon-female caricon-male caricon-bug caricon-twitter-1 caricon-evernote caricon-globe caricon-globe-alt ' +
            'caricon-award caricon-rocket-1 caricon-truck').split(' ').map(function(i) {
            return {
                class: i
            };
        });

        $scope.changeIcon = function() {
            var options = {};
            $('#carIconsModal').modal(options);
        };

        $scope.setIcon = function(icon) {
            $('#carIconsModal').modal('hide');
            system.icon = icon.class;
            system.$patch('icon');
        };

        Tags.reload();
        $scope.alltags = Tags.all;

        $scope.tagname = '';
        $scope.edittags = false;
        $scope.addTag = function(){
            $('#addTag').modal('show');
        };

        $('#addTag').modal({
            show: false
        }).on('show.bs.modal', function() {
            $scope.edittags = false;
            // console.log("new tagname=", $scope.tagname);
        });

        $scope.addTagThis = function(tagname){
            // console.log('add tag done', $scope.tagname);
            if($scope.edittags){
                var index = $scope.alltags.indexOf(tagname);
                $scope.alltags.splice(index, 1);
                Tags.save();
                // console.log('remove', tagname);
            } else {
                if((tagname !== '') && ($scope.system.tags.indexOf(tagname) === -1)){
                    $scope.system.tags.push(tagname);
                    $scope.system.$patch('tags');
                }
                $('#addTag').modal('hide');
            }
        };

        $scope.addTagDone = function(){
            $scope.addTagThis($scope.tagname);
        };

        $scope.removeTag = function(key){
            // console.log('removeTag key=', key);
            $scope.system.tags.splice(key, 1);
            $scope.system.$patch('tags');
        };
        // $('[rel=tooltip]').tooltip();
    }
]);
