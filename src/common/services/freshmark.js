/* global angular:true */

angular.module('newgps.services', ['resources.geogps'])

/**
 * @ngdoc object
 * @name newgps.services.$freshmark
 * @requires $log
 *
 * @description
 * Этот сервис используется для определения степень 'свежести' данных о ТС
 *
 */
.factory('$freshmark', ['$log', 'GeoGPS',
    function($log, GeoGPS) {
        'use strict';
        // console.log('$freshmark:run', GeoGPS);
        var $freshmark = {

            /**
             * @ngdoc function
             * @name newgps.services.$freshmark#get
             * @methodOf newgps.services.$freshmark
             *
             * @description
             * Возвращает объект, описывающий степень свежести данных
             *
             * @param {object} dynamic
             * @return {object} freshmark
             */
            get: function(dynamic) {
                // console.log('$freshmark:get', dynamic);
                // 1) Зелёный - объект движется. (move)
                // 2) Красный - объект стоит. (stop)
                // 3) Синий - трекер не выходил на связь более 10 минут. (old)
                // 4) Серый - трекер выключен. (off)
                var now = Math.round((new Date()).valueOf() / 1000),
                    delta = now - dynamic.lastping,
                    state = {
                        class: 'freshmark-broken',
                        title: 'Состояние неизвестно'
                    };

                // console.log('freshmark element', delta);
                // $scope.value = Math.floor(delta / 60);
                if (delta > 24 * 60 * 60) { // Не выходил на связь более 24х часов
                    state.class = 'freshmark-broken';
                    state.title = 'Не выходит на связь';
                } else if (delta > 10 * 60) { // Не выходил на связь более 10ти минут
                    state.class = 'freshmark-offline';
                    state.title = 'Не выходит на связь более 10ти минут';
                } else if (dynamic.fsource) {
                    if (GeoGPS.isStop(dynamic.fsource)) {
                        state.class = 'freshmark-stop';
                        state.title = 'Стоит';
                    } else {
                        state.class = 'freshmark-move';
                        state.title = 'Движется';
                    }
                }
                return state;
            }
        };

        return $freshmark;
    }
]);
