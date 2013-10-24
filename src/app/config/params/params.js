/* global angular:true, $:true */

(function() {
    'use strict';

    var params_descs = {
        'accel.deb': {
            'desc': '',
            'min': 3,
            'max': 10
        },
        'accel.lvl': {
            'desc': 'Чувствительность акселерометра, mg (20-200)',
            'comment': 'INT 30 30'
        },
        'accel.time': {
            'comment': 'INT 60 60'
        },
        'adc.fix.du': {
            'comment': 'INT 8 8'
        },
        'adc.fix.dub': {
            'comment': ' - INT 31 31'
        },
        'adc.fix.umax': {
            'comment': ' - INT 1063 1063'
        },
        'adc.in.1': {
            'comment': ' - INT 50 50'
        },
        'adc.in.2': {
            'comment': ' - INT 50 50'
        },
        'adc.photo': {
            'comment': ' - INT 1921 1921'
        },
        'adc.photo.delay': {
            'comment': ' - INT 3600 3600'
        },
        'adc.u.0': {
            'comment': ' - INT 295 295'
        },
        'adc.u.1': {
            'comment': ' - INT 342 342'
        },
        'adc.u.off': {
            'comment': ' - INT 177 177'
        },
        'adc.u.on': {
            'comment': ' - INT 325 325'
        },
        'akkum.block.vbat': {
            'comment': ' - INT 1092 1092'
        },
        'akkum.block.vdd': {
            'comment': ' - INT 295 295'
        },
        'akkum.charge.0': {
            'comment': ' - INT 1086 1086'
        },
        'akkum.charge.30': {
            'comment': ' - INT 1164 1164'
        },
        'akkum.charge.60': {
            'comment': ' - INT 1194 1194'
        },
        'akkum.charge.temp': {
            'comment': ' - INT 301 301'
        },
        'akkum.i.0': {
            'comment': ' - INT 6 6'
        },
        'akkum.i.1': {
            'comment': ' - INT 49 49'
        },
        'akkum.i.2': {
            'comment': ' - INT 31 31'
        },
        'akkum.i.3': {
            'comment': ' - INT 31 31'
        },
        'akkum.i.4': {
            'comment': ' - INT 6 6'
        },
        'akkum.i.charge': {
            'comment': ' - INT 49 49'
        },
        'akkum.u.0': {
            'comment': ' - INT 1210 1210'
        },
        'akkum.u.1': {
            'comment': ' - INT 1306 1306'
        },
        'akkum.u.2': {
            'comment': ' - INT 1306 1306'
        },
        'akkum.u.3': {
            'comment': ' - INT 1309 1309'
        },
        'akkum.u.4': {
            'comment': ' - INT 1309 1309'
        },
        'gps.A1.0': {
            'desc': 'Минимальный регистрируемый угол поворота, градусы',
            'primary': true
        },
        'gps.A1.1': {
            'comment': ' - INT 10 10'
        },
        'gps.A1.2': {
            'comment': ' - INT 5 5'
        },
        'gps.A1.3': {
            'comment': ' - INT 15 15'
        },
        'gps.AOFF.0': {
            'desc': 'Выключение GPS для экономии основного питания при стоянке объекта, мин',
            'primary': true,
            'comment': 'INT 1440 1440'
        },
        'gps.AOFF.1': {
            'desc': 'Выключение GPS для экономии резервного питания при стоянке объекта, мин',
            'primary': true,
            'comment': 'INT 30 30'
        },
        'gps.B1.0': {
            'comment': ' - INT 512 512'
        },
        'gps.B1.1': {
            'comment': ' - INT 512 512'
        },
        'gps.B1.2': {
            'comment': ' - INT 512 512'
        },
        'gps.B1.3': {
            'comment': ' - INT 512 512'
        },
        'gps.FAIL': {
            'comment': ' - INT 5 5'
        },
        'gps.S1.0': {
            'comment': ' - INT 1000 1000'
        },
        'gps.S1.1': {
            'comment': ' - INT 1000 1000'
        },
        'gps.S1.2': {
            'comment': ' - INT 500 500'
        },
        'gps.S1.3': {
            'comment': ' - INT 1000 1000'
        },
        'gps.TF.MOVE': {
            'desc': 'Период принудительной регистрации координат при движении объекта, сек',
            'primary': true,
            'min': 30,
            'comment': ' INT 60 60'
        },
        'gps.TF.STOP.0': {
            'desc': 'Период регистрации координат при остановке объекта / основное питание, сек',
            'primary': true,
            'comment': ' INT 60 60'
        },
        'gps.TF.STOP.1': {
            'desc': 'Период регистрации координат при остановке объекта / резервное питание, сек',
            'primary': true,
            'comment': ' INT 60 60'
        },
        'gps.TF.STOP.ACC.0': {
            'desc': 'Период регистрации координат при стоянке объекта / основное питание, сек',
            'primary': true,
            'comment': ' INT 600 600'
        },
        'gps.TF.STOP.ACC.1': {
            'desc': 'Период регистрации координат при стоянке объекта / резервное питание, сек',
            'primary': true,
            'comment': ' INT 600 600'
        },
        'gps.TM0.0': {
            'comment': ' - INT 10 10'
        },
        'gps.TM0.1': {
            'comment': ' - INT 10 10'
        },
        'gps.TM0.2': {
            'comment': ' - INT 10 10'
        },
        'gps.TM0.3': {
            'comment': ' - INT 10 10'
        },
        'gps.TP0.0': {
            'comment': ' - INT 720 720'
        },
        'gps.TP0.1': {
            'comment': ' - INT 240 240'
        },
        'gps.TP0.2': {
            'comment': ' - INT 720 720'
        },
        'gps.TP0.3': {
            'comment': ' - INT 120 120'
        },
        'gps.V0.0': {
            'comment': ' - INT 3 3'
        },
        'gps.V0.1': {
            'comment': ' - INT 20 20'
        },
        'gps.V0.2': {
            'comment': ' - INT 10 10'
        },
        'gps.V0.3': {
            'comment': ' - INT 20 20'
        },
        'gps.VIGNACC': {
            'comment': ' - INT 4000 4000'
        },
        'gps.VSTART': {
            'desc': 'Скорость, выше которой регистрируется начало движения × 0,01852 км/ч',
            'primary': true,
            'comment': ' INT 400 400'
        },
        'gps.VSTOP': {
            'desc': 'Скорость, ниже которой регистрируется остановка объекта × 0,01852 км/ч',
            'primary': true,
            'comment': ' INT 54 54'
        },
        'gps.flush.move': {
            'desc': 'Период отправки данных на сервер при движении, сек',
            'primary': true,
            'min': 30,
            'comment': ' INT 60 60 180'
        },
        'gps.flush.stop': {
            'desc': 'Период отправки данных на сервер при стоянке, сек',
            'primary': true,
            'min': 30,
            'comment': ' INT 60 60'
        },
        'gps.maxsendfails': {
            'comment': ' - INT 3 3'
        },
        'gsm.admin': {
            'comment': ' - STR16'
        },
        'gsm.admin.2': {
            'comment': ' - STR16'
        },
        'gsm.admin.3': {
            'comment': ' - STR16'
        },
        'gsm.alarm': {
            'comment': ' - STR16'
        },
        'gsm.alarm.prop': {
            'comment': ' - INT 7 7'
        },
        'gsm.apn': {
            'comment': ' - STR32 www.kyivstar.net www.kyivstar.net'
        },
        'gsm.flags': {
            'comment': ' - INT 0 0'
        },
        'gsm.lagtime': {
            'comment': ' - INT 900 900'
        },
        'gsm.protbits': {
            'comment': ' - INT 31 31'
        },
        'gsm.pwd': {
            'comment': ' - STR32'
        },
        'gsm.reregtime': {
            'comment': ' - INT 6 6'
        },
        'gsm.server': {
            'comment': ' - STR32 point.newgps.navi.cc:80 map.navi.cc:80'
        },
        'gsm.test': {
            'comment': ' - INT 1440 1440'
        },
        'gsm.user': {
            'comment': ' - STR32'
        },
        'in.foo.1': {
            'desc': 'Конфигурация входа 1: 0-выключен / 1-Тревога / 2-Шлейф / 3-Зажигание',
            'primary': true,
            'select': [{
                'value': 0,
                'title': 'выключен'
            }, {
                'value': 1,
                'title': 'тревожная кнопка'
            }, {
                'value': 2,
                'title': 'шлейф'
            }, {
                'value': 3,
                'title': 'зажигание'
            }],
            'comment': ' INT 0 0'
        },
        'in.foo.2': {
            'desc': 'Конфигурация входа 2: 0-выключен / 1-Тревога / 2-Шлейф / 3-Зажигание',
            'primary': true,
            'select': [{
                'value': 0,
                'title': 'выключен'
            }, {
                'value': 1,
                'title': 'тревожная кнопка'
            }, {
                'value': 2,
                'title': 'шлейф'
            }, {
                'value': 3,
                'title': 'зажигание'
            }],
            'comment': ' INT 0 0'
        },
        'in.foo.3': {
            'desc': 'Конфигурация входа 3: 0-выключен / 1-Тревога / 2-Шлейф / 3-Зажигание / 4-Датчик топлива',
            'primary': true,
            'select': [{
                'value': 0,
                'title': 'выключен'
            }, {
                'value': 1,
                'title': 'тревожная кнопка'
            }, {
                'value': 2,
                'title': 'шлейф'
            }, {
                'value': 3,
                'title': 'зажигание'
            }, {
                'value': 4,
                'title': 'датчик топлива'
            }],
            'comment': ' INT 0 0'
        },
        'out.1': {
            'desc': 'Состояние выхода 1: 0-выключен / 1-включен (активный уровень - низкий)',
            'primary': true,
            'comment': ' INT 1 1'
        },
        'out.2': {
            'desc': 'Состояние выхода 2: 0-выключен / 1-включен (активный уровень - низкий)',
            'primary': true,
            'comment': ' INT 0 0'
        },
        'power.autooff': {
            'comment': ' - INT 0 0'
        },
        'secure.code': {
            'comment': ' - INT 0 0'
        },
        'service.lock': {
            'comment': ' - INT 0 0'
        },

    };

    angular.module('config.system.params', ['ngRoute', '$strap', 'resources.params', 'app.filters', 'config.system.params.master', 'config.system.params.fuel'])

    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.when('/config/:skey/params', {
                templateUrl: 'templates/config/params/params.tpl.html',
                controller: 'ConfigParamsCtrl',
                resolve: {
                    params: ['Params', '$route',
                        function(Params, $route) {
                            return Params.get($route.current.params.skey);
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

    .value('extend', function() {
        return params_descs;
    })

    .controller('ConfigParamsCtrl', ['$scope', '$route', '$routeParams', 'params', 'system', 'System',
        function($scope, $route, $routeParams, params, system, System) {
            $scope.system = system;
            $scope.skey = $routeParams.skey;
            $scope.params = params;
            $scope.filtered = true;

            $scope.tooltip = {
                'title': '<hr>Показать все параметры<hr>Внимание! Изменение некоторых параметров может привести к выходу трекера из строя.',
                'checked': false
            };

            $scope.extend = function(key) {
                return params_descs[key];
            };

            $scope.isFiltered = function(item) {
                if (!$scope.filtered) {
                    return true;
                }
                return item.filter;
            };

            $scope.cancelqueue = function(k) {
                delete params.queue[k];
                params.$patch('queue'); // Сохраним очередь
            };

            $scope.stopqueue = function() {
                params.queue = {};
                params.$patch('queue'); // Сохраним очередь
            };

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

            $scope.param = {
                key: null,
                value: null
            };

            $('#changeParamModal').modal({
                show: false
            }).on('hidden.bs.modal', function() {
                var key = $scope.param.key,
                    value = $scope.param.value;

                params.queue = params.queue || {};
                if (params.queue[key] === value) return; // Значение уже в очереди
                if (angular.isUndefined(params.queue[key]) && (params.data[key].value === value)) return; // Значение не изменяется

                params.queue[key] = value;
                params.$patch('queue'); // Сохраним очередь
            });

            $scope.changeParam = function(key) {
                params.queue = params.queue || {};
                var param = params.data[key];
                var queue = params.queue[key];
                $scope.param.key = key;
                $scope.param.value = queue || param.value;
                $('#changeParamModal').modal('show');
            };

            $scope.setIcon = function(icon) {
                $('#carIconsModal').modal('hide');
                system.icon = icon.class;
                system.$patch('icon');
            };

            $scope.tagname = '';
            $scope.addTag = function(){
                $('#addTag').modal('show');
            }

            // $('#addTag').modal({
            //     show: false
            // }).on('hidden.bs.modal', function() {
            //     // console.log("new tagname=", $scope.tagname);
            // });

            $scope.addTagDone = function(){
                // console.log('add tag done', $scope.tagname);
                if(($scope.tagname !== '') && ($scope.system.tags.indexOf($scope.tagname) === -1)){
                    $scope.system.tags.push($scope.tagname);
                    $scope.system.$patch('tags');
                }
                $('#addTag').modal('hide');
            }

            $scope.removeTag = function(key){
                // console.log('removeTag key=', key);
                $scope.system.tags.splice(key, 1);
                $scope.system.$patch('tags');
            }
            // $('[rel=tooltip]').tooltip();
        }
    ])

    .filter('isFiltered', function() {
        return function(value, status) {
            if (!status) {
                return value;
            }
            var out = [];
            for (var i = 0; i < value.length; i++) {
                if (value[i].filter) {
                    out.push(value[i]);
                }
            }
            return out;
        };
    });

})();
