/* global angular:true */

angular.module('app.services.imeicheck', [])

/**
 * @ngdoc object
 * @name app.services.imeicheck
 * @requires $log
 *
 * @description
 * Проверка правильности ввода IMEI
 *
 */
.factory('imeicheck', [
    function() {
        'use strict';

        var replace = {0: 0, 1: 2, 2: 4, 3: 6, 4: 8, 5: 1, 6: 3, 7: 5, 8: 7, 9: 9};

        // Алгоритм Луна
        var lunaCRC = function(str) {
            var even = 0,
                odd = 0,
                i;

            var crc = str[str.length-1]|0;

            for(i=0; i<str.length-1; i++){
                var d = str[i] | 0;
                if((i & 1) === 0){
                    even += d;
                } else {
                    odd += replace[d];
                }
            }

            var iterResult = odd + even;

            var controlNum;

            if((iterResult === 0) || (iterResult % 10 === 0)) {
                controlNum = 0;
            } else {
                var maybeNum = Math.round(iterResult / 10) * 10;
                controlNum = maybeNum - iterResult;
            }
            return crc === controlNum;
        };

        var imeicheck = function(imei) {
            // IMEI может быть двух основных форматов:
            // 1. 15 цифр
            // 2. 15 цифр - код 1-5 цифр

            if((typeof imei) !== 'string') return false;

            if(imei.match(/^[0-9]{15,15}$/)) {                      // Просто IMEI (15 цифр)
                return lunaCRC(imei);
            } else if(imei.match(/^[0-9]{15,15}-[0-9]{1,5}$/)) {    // IMEI-code
                var imeiOnly = imei.slice(0, 15);
                var code = imei.slice(16) | 0;
                return lunaCRC(imeiOnly) && (code < 32768) && (code !== 0);
            }

            return false;
        };

        return imeicheck;
    }
]);
