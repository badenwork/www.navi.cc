/* global angular:true, moment:true */
(function() {

'use strict';

var fdigits = function(value, digits) {
    return ('00000000000' + value).slice(-digits);
};

var fsource = {
    0: {
        title: '-',
        icons: ['icon-question']
    },
    1: {
        title: 'SUDDENSTOP',
        icons: ['icon-warning', 'icon-pause']
    },
    2: {
        title: 'STOPACC',
        icons: ['icon-eject', 'icon-pause']
    },
    3: {
        title: 'TIMESTOPACC',
        icons: ['icon-time', 'icon-stop']
    },
    4: {
        title: 'SLOW',
        icons: ['icon-pause']
    },
    5: {
        title: 'TIMEMOVE',
        icons: ['icon-time', 'icon-play']
    },
    6: {
        title: 'START',
        icons: ['icon-play']
    },
    7: {
        title: 'TIMESTOP',
        icons: ['icon-time', 'icon-pause']
    },
    8: {
        title: 'ANGLE',
        icons: ['icon-share-alt']
    },
    9: {
        title: 'DELTALAT',
        icons: ['icon-resize-full']
    },
    10: {
        title: 'DELTALONG',
        icons: ['icon-resize-full']
    },
    11: {
        title: 'DELTA',
        icons: ['icon-resize-full']
    },
};

angular.module('app.filters', []).

filter('datetime', function() {
    return function(text, seconds, format) {
        var d = new Date(parseInt(text, 10) * 1000);

        if (format === 'date') {
            return '' + fdigits(d.getDate(), 2) + '/' + fdigits(d.getMonth() + 1, 2) + '/' + d.getFullYear();
        } else if (format === 'time') {
            if ((seconds === false) || (seconds === 'false')) {
                return fdigits(d.getHours(), 2) + ':' + fdigits(d.getMinutes(), 2);
            } else {
                return fdigits(d.getHours(), 2) + ':' + fdigits(d.getMinutes(), 2) + ':' + fdigits(d.getSeconds(), 2);
            }
        }

        if ((seconds === false) || (seconds === 'false')) {
            return '' + fdigits(d.getDate(), 2) + '/' + fdigits(d.getMonth() + 1, 2) + '/' + d.getFullYear() + ' ' +
                fdigits(d.getHours(), 2) + ':' + fdigits(d.getMinutes(), 2);
        } else {
            return '' + fdigits(d.getDate(), 2) + '/' + fdigits(d.getMonth() + 1, 2) + '/' + d.getFullYear() + ' ' +
                fdigits(d.getHours(), 2) + ':' + fdigits(d.getMinutes(), 2) + ':' + fdigits(d.getSeconds(), 2);
        }
    };
}).

filter('fromnow', function() {
    return function(text) {
        // var d = new Date(parseInt(text, 10) * 1000);
        return moment(parseInt(text, 10) * 1000).fromNow();
    };
}).

// Преобразование значения напряжения на резервном аккумуляторе в остаточную емкость в %
filter('vin', function() {
    return function(vin) {
        if (vin) {
            var v = Math.max(0, Math.min(4.2, vin));
            // Пока делаем линейно 3.5...4.2  -> 0% .. 100%
            var per = Math.round((v - 3.5) * 100 / (4.2 - 3.5));
            return per + '%';
        }
        return '?';
    };
}).

filter('yesno', function() {
    return function(state) {
        return state ? 'да' : 'нет';
    };
}).

filter('fsource', function() {
    return function(index) {
        return fsource[1 * index];
    };
})

.filter('isoff', function() {
    return function(data, off) {
        // console.log('isoff filter', data, off);
        var filtered = [];
        data.map(function(item) {
            if (!off.hasOwnProperty(item)) filtered.push(item);
        });
        return filtered;
    };
})

.filter('humanizeMiliseconds', function() {
    return function(miliseconds, format) {
        console.log ('humanizeMiliseconds : ', miliseconds);
        var daysStr = ' дн.';
        var hoursStr = ' час';
        var minutesStr = ' мин';
        var secondsStr = ' сек';
        var separator = ' ';
        //var days = Math.floor(miliseconds/86400000);
        //var hours = Math.floor(((miliseconds/86400000)%1)*24);
        //var minutes = Math.floor(((miliseconds/3600000)%1)*60);
        //var seconds = Math.round(((miliseconds/60000)%1)*60);
        
        var days = Math.floor(miliseconds / 86400000);
        var hours = Math.floor((miliseconds % 86400000) / 3600000);
        var minutes = Math.floor((miliseconds % 3600000) / 60000);
        var seconds = Math.round((miliseconds % 60000) / 1000);
        var humanizedStr = '';
        if (days > 0) {
            humanizedStr += days + daysStr + separator;
        }
        if (hours > 0) {
            humanizedStr += hours + hoursStr + separator;
        } else if (humanizedStr.length > 0) {
            humanizedStr += '00' + hoursStr + separator;
        }

        if (minutes > 0) {
            humanizedStr += minutes + minutesStr;
        } else if (humanizedStr.length > 0) {
            humanizedStr += '00' + minutesStr;
        }

        if (seconds > 0) {
            if (humanizedStr.length > 0) {
                humanizedStr += separator;
            }
            humanizedStr += seconds + secondsStr;
        } else if (humanizedStr.length === 0) {
            humanizedStr += seconds + secondsStr;
        }
        return humanizedStr;
    };
});

})();
