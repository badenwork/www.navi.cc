/* global angular:true, $:true, google:true */

angular.module('config.system.info', ['ngRoute', '$strap', 'resources.params', 'app.filters', 'config.system.params.master', 'config.system.params.fuel', 'services.tags'])

.config(['$routeProvider',
    function($routeProvider) {
        'use strict';
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
        'use strict';
        $scope.system = system;
        $scope.skey = $routeParams.skey;
        if(system.dynamic && system.dynamic.latitude && system.dynamic.longitude) {
            $scope.dynamicAddress = Math.floor (system.dynamic.latitude * 10000) / 10000 + ', ' + Math.floor (system.dynamic.longitude * 10000) / 10000;
        } else {
            $scope.dynamicAddress = '?';
        }
        system.balance = 5;
        var geocoder = new google.maps.Geocoder();
        var formatPosition = function () {
            if(system.dynamic && system.dynamic.latitude && system.dynamic.longitude) {
                geocoder.geocode({
                        'latLng': new google.maps.LatLng (system.dynamic.latitude, system.dynamic.longitude)
                    },
                    function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var address = '';
                            var parts = results [0].address_components;
                            var sep = '';
                            var types = {
                                country :'',                //страна
                                locality:'',                //город
                                //sublocality :'',
                                street_number:'',           //номер дома
                                //establishment:'',
                                route:'',                   //улица
                                /*postal_code:'',
                                administrative_area_level_1:'',
                                administrative_area_level_2:'',
                                administrative_area_level_3:''*/
                            };
                            for (var i = parts.length - 1; i >= 0; --i) {
                                if (parts [i].types[0] in types) {
                                    address += sep + parts [i].long_name;
                                    sep = ', ';
                                }
                            }
                            $scope.$apply (function () {
                                $scope.dynamicAddress = address;
                            });
                        } else {
                            //повторно запросить
                            setTimeout(function() {
                                formatPosition ();
                            }, 2000);
                        }
                });
            }
        };
        formatPosition ();

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

        $scope.caricons = ('caricon-reddit caricon-plancast caricon-angellist caricon-home caricon-cloud caricon-umbrella caricon-star ' +
            'caricon-star-empty caricon-attention caricon-flight caricon-flight-1 caricon-accessibility caricon-paper-plane-1 ' +
            'caricon-money caricon-beaker caricon-truck-1 caricon-attach caricon-guidedog caricon-lightbulb caricon-blind ' +
            'caricon-basket caricon-paper-plane caricon-traffic-cone caricon-cc caricon-emo-happy caricon-aboveground-rail caricon-airfield ' +
            'caricon-airport caricon-emo-devil caricon-belowground-rail caricon-bicycle caricon-bus caricon-ferry caricon-garden ' +
            'caricon-giraffe caricon-grocery-store caricon-heliport caricon-pitch caricon-police caricon-rail caricon-skiing ' +
            'caricon-swimming caricon-crown caricon-twitter caricon-user-md caricon-ambulance caricon-fighter-jet caricon-h-sigh ' +
            'caricon-github caricon-shield caricon-extinguisher caricon-rocket caricon-anchor caricon-apple caricon-android ' +
            'caricon-linux caricon-female caricon-male caricon-bug caricon-twitter-1 caricon-evernote caricon-globe caricon-globe-alt ' +
            'caricon-award caricon-rocket-1 caricon-truck' //+
            //' caricon_set_2-truck caricon_set_2-icon_765 caricon_set_2-icon_1609 caricon_set_2-icon_15944 caricon_set_2-icon_8622 caricon_set_2-icon_609 caricon_set_2-icon_12525 caricon_set_2-icon_23424 caricon_set_2-icon_16784 caricon_set_2-icon_22821 caricon_set_2-icon_13135 caricon_set_2-icon_11868 caricon_set_2-icon_7504 caricon_set_2-icon_1892 caricon_set_2-icon_12844 caricon_set_2-icon_12241 caricon_set_2-icon_17587 caricon_set_2-icon_23115 caricon_set_2-icon_2558 caricon_set_2-icon_26574 caricon_set_2-icon_19523 caricon_set_2-icon_2690 caricon_set_2-icon_14692 caricon_set_2-icon_1340 caricon_set_2-icon_4506 caricon_set_2-icon_18560 caricon_set_2-icon_11427 caricon_set_2-icon_22186 caricon_set_2-icon_7883 caricon_set_2-icon_18512 caricon_set_2-icon_20591 caricon_set_2-icon_118682 caricon_set_2-icon_17054 caricon_set_2-icon_18540 caricon_set_2-noun_project_22186 caricon_set_2-noun_project_10661 caricon_set_2-icon_9258 caricon_set_2-icon_7727 caricon_set_2-icon_24929 caricon_set_2-icon_26574 caricon_set_2-icon_10144 caricon_set_2-icon_13082 caricon_set_2-icon_1360 caricon_set_2-icon_17187 caricon_set_2-icon_21007 caricon_set_2-icon_22277 caricon_set_2-icon_19359 caricon_set_2-icon_17004 caricon_set_2-icon_1514 caricon_set_2-icon_23560 caricon_set_2-icon_4699 caricon_set_2-icon_5375'
                          ).split(' ').map(function(i) {
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

        $scope.hwids = function(hwid) {
            return System.hwids[hwid] || '?';
        };
    }
]);
