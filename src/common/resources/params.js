
var params_descs = {
    "accel.deb": {
        "desc": "",
        "min": 3,
        "max": 10
    },
    "accel.lvl": {
        "desc": "Чувствительность акселерометра, mg (20-200)",
        "comment": "INT 30 30"
    },
    "accel.time": {
        "comment": "INT 60 60"
    },
    "adc.fix.du": {
        "comment": "INT 8 8"
    },
    "adc.fix.dub": {
        "comment": " - INT 31 31"
    },
    "adc.fix.umax": {
        "comment": " - INT 1063 1063"
    },
    "adc.in.1": {
        "comment": " - INT 50 50"
    },
    "adc.in.2": {
        "comment": " - INT 50 50"
    },
    "adc.photo": {
        "comment": " - INT 1921 1921"
    },
    "adc.photo.delay": {
        "comment": " - INT 3600 3600"
    },
    "adc.u.0": {
        "comment": " - INT 295 295"
    },
    "adc.u.1": {
        "comment": " - INT 342 342"
    },
    "adc.u.off": {
        "comment": " - INT 177 177"
    },
    "adc.u.on": {
        "comment": " - INT 325 325"
    },
    "akkum.block.vbat": {
        "comment": " - INT 1092 1092"
    },
    "akkum.block.vdd": {
        "comment": " - INT 295 295"
    },
    "akkum.charge.0": {
        "comment": " - INT 1086 1086"
    },
    "akkum.charge.30": {
        "comment": " - INT 1164 1164"
    },
    "akkum.charge.60": {
        "comment": " - INT 1194 1194"
    },
    "akkum.charge.temp": {
        "comment": " - INT 301 301"
    },
    "akkum.i.0": {
        "comment": " - INT 6 6"
    },
    "akkum.i.1": {
        "comment": " - INT 49 49"
    },
    "akkum.i.2": {
        "comment": " - INT 31 31"
    },
    "akkum.i.3": {
        "comment": " - INT 31 31"
    },
    "akkum.i.4": {
        "comment": " - INT 6 6"
    },
    "akkum.i.charge": {
        "comment": " - INT 49 49"
    },
    "akkum.u.0": {
        "comment": " - INT 1210 1210"
    },
    "akkum.u.1": {
        "comment": " - INT 1306 1306"
    },
    "akkum.u.2": {
        "comment": " - INT 1306 1306"
    },
    "akkum.u.3": {
        "comment": " - INT 1309 1309"
    },
    "akkum.u.4": {
        "comment": " - INT 1309 1309"
    },
    "gps.A1.0": {
        "desc": "Минимальный регистрируемый угол поворота (градусы) INT 5 5",
        "primary": true
    },
    "gps.A1.1": {
        "comment": " - INT 10 10"
    },
    "gps.A1.2": {
        "comment": " - INT 5 5"
    },
    "gps.A1.3": {
        "comment": " - INT 15 15"
    },
    "gps.AOFF.0": {
        "desc": "Выключение GPS для экономии основного питания при стоянке объекта, мин",
        "primary": true,
        "comment": "INT 1440 1440"
    },
    "gps.AOFF.1": {
        "desc": "Выключение GPS для экономии резервного питания при стоянке объекта, мин",
        "primary": true,
        "comment": "INT 30 30"
    },
    "gps.B1.0": {
        "comment": " - INT 512 512"
    },
    "gps.B1.1": {
        "comment": " - INT 512 512"
    },
    "gps.B1.2": {
        "comment": " - INT 512 512"
    },
    "gps.B1.3": {
        "comment": " - INT 512 512"
    },
    "gps.FAIL": {
        "comment": " - INT 5 5"
    },
    "gps.S1.0": {
        "comment": " - INT 1000 1000"
    },
    "gps.S1.1": {
        "comment": " - INT 1000 1000"
    },
    "gps.S1.2": {
        "comment": " - INT 500 500"
    },
    "gps.S1.3": {
        "comment": " - INT 1000 1000"
    },
    "gps.TF.MOVE": {
        "desc": "Период принудительной регистрации координат при движении объекта, сек",
        "primary": true,
        "min": 30,
        "comment": " INT 60 60"
    },
    "gps.TF.STOP.0": {
        "desc": "Период регистрации координат при остановке объекта / основное питание, сек",
        "primary": true,
        "comment": " INT 60 60"
    },
    "gps.TF.STOP.1": {
        "desc": "Период регистрации координат при остановке объекта / резервное питание, сек",
        "primary": true,
        "comment": " INT 60 60"
    },
    "gps.TF.STOP.ACC.0": {
        "desc": "Период регистрации координат при стоянке объекта / основное питание, сек",
        "primary": true,
        "comment": " INT 600 600"
    },
    "gps.TF.STOP.ACC.1": {
        "desc": "Период регистрации координат при стоянке объекта / резервное питание, сек",
        "primary": true,
        "comment": " INT 600 600"
    },
    "gps.TM0.0": {
        "comment": " - INT 10 10"
    },
    "gps.TM0.1": {
        "comment": " - INT 10 10"
    },
    "gps.TM0.2": {
        "comment": " - INT 10 10"
    },
    "gps.TM0.3": {
        "comment": " - INT 10 10"
    },
    "gps.TP0.0": {
        "comment": " - INT 720 720"
    },
    "gps.TP0.1": {
        "comment": " - INT 240 240"
    },
    "gps.TP0.2": {
        "comment": " - INT 720 720"
    },
    "gps.TP0.3": {
        "comment": " - INT 120 120"
    },
    "gps.V0.0": {
        "comment": " - INT 3 3"
    },
    "gps.V0.1": {
        "comment": " - INT 20 20"
    },
    "gps.V0.2": {
        "comment": " - INT 10 10"
    },
    "gps.V0.3": {
        "comment": " - INT 20 20"
    },
    "gps.VIGNACC": {
        "comment": " - INT 4000 4000"
    },
    "gps.VSTART": {
        "desc": "Скорость, выше которой регистрируется начало движения × 0,01852 км/ч",
        "primary": true,
        "comment": " INT 400 400"
    },
    "gps.VSTOP": {
        "desc": "Скорость, ниже которой регистрируется остановка объекта × 0,01852 км/ч",
        "primary": true,
        "comment": " INT 54 54"
    },
    "gps.flush.move": {
        "desc": "Период отправки данных на сервер при движении, сек",
        "primary": true,
        "min": 30,
        "comment": " INT 60 60 180"
    },
    "gps.flush.stop": {
        "desc": "Период отправки данных на сервер при стоянке, сек",
        "primary": true,
        "min": 30,
        "comment": " INT 60 60"
    },
    "gps.maxsendfails": {
        "comment": " - INT 3 3"
    },
    "gsm.admin": {
        "comment": " - STR16"
    },
    "gsm.admin.2": {
        "comment": " - STR16"
    },
    "gsm.admin.3": {
        "comment": " - STR16"
    },
    "gsm.alarm": {
        "comment": " - STR16"
    },
    "gsm.alarm.prop": {
        "comment": " - INT 7 7"
    },
    "gsm.apn": {
        "comment": " - STR32 www.kyivstar.net www.kyivstar.net"
    },
    "gsm.flags": {
        "comment": " - INT 0 0"
    },
    "gsm.lagtime": {
        "comment": " - INT 900 900"
    },
    "gsm.protbits": {
        "comment": " - INT 31 31"
    },
    "gsm.pwd": {
        "comment": " - STR32"
    },
    "gsm.reregtime": {
        "comment": " - INT 6 6"
    },
    "gsm.server": {
        "comment": " - STR32 point.newgps.navi.cc:80 map.navi.cc:80"
    },
    "gsm.test": {
        "comment": " - INT 1440 1440"
    },
    "gsm.user": {
        "comment": " - STR32"
    },
    "in.foo.1": {
        "desc": "Конфигурация входа 1: 0-выключен / 1-Тревога / 2-Шлейф / 3-Зажигание",
        "primary": true,
        "select": [
            {"value": 0, "title": "выключен"},
            {"value": 1, "title": "тревожная кнопка"},
            {"value": 2, "title": "шлейф"},
            {"value": 3, "title": "зажигание"}
        ],
        "comment": " INT 0 0"
    },
    "in.foo.2": {
        "desc": "Конфигурация входа 2: 0-выключен / 1-Тревога / 2-Шлейф / 3-Зажигание",
        "primary": true,
        "select": [
            {"value": 0, "title": "выключен"},
            {"value": 1, "title": "тревожная кнопка"},
            {"value": 2, "title": "шлейф"},
            {"value": 3, "title": "зажигание"}
        ],
        "comment": " INT 0 0"
    },
    "in.foo.3": {
        "desc": "Конфигурация входа 3: 0-выключен / 1-Тревога / 2-Шлейф / 3-Зажигание / 4-Датчик топлива",
        "primary": true,
        "select": [
            {"value": 0, "title": "выключен"},
            {"value": 1, "title": "тревожная кнопка"},
            {"value": 2, "title": "шлейф"},
            {"value": 3, "title": "зажигание"},
            {"value": 4, "title": "датчик топлива"}
        ],
        "comment": " INT 0 0"
    },
    "out.1": {
        "desc": "Состояние выхода 1: 0-выключен / 1-включен (активный уровень - низкий)",
        "primary": true,
        "comment": " INT 1 1"
    },
    "out.2": {
        "desc": "Состояние выхода 2: 0-выключен / 1-включен (активный уровень - низкий)",
        "primary": true,
        "comment": " INT 0 0"
    },
    "power.autooff": {
        "comment": " - INT 0 0"
    },
    "secure.code": {
        "comment": " - INT 0 0"
    },
    "service.lock": {
        "comment": " - INT 0 0"
    },

};

angular.module('resources.params', ['services.connect', 'ngResource'])

.factory('Params', ['SERVER', '$http', '$q', 'Connect', function (SERVER, $http, $q, Connect) {
    // console.log('-- params.Params', SERVER, Connect, SERVER.api.replace(/:\d/, '\\$&'));

    var Params = {
        skey: null,
        value: null
    };

    var updater = Connect.updater.on('cfg_upd', function(msg) {
        // console.log('Need update configure:', msg);
        if(msg.skey === Params.skey) {
            Params.get(Params.skey);
        }
        //$rootScope.$apply();
    });


    // Запросить значения параметров для системы skey
    Params.get = function(skey){
        var defer = $q.defer();

        // console.log('-- params.Params.get');

        $http({
            method: 'GET',
            url: SERVER.api + "/systems/" + encodeURIComponent(skey) + "/params"
        }).success(function(data){
            // console.log('params.Params.get.success', data);
            Params.skey = data.skey;
            Params.value = data.value;

            for (var k in data.value) {
                var p = data.value[k];
                angular.extend(p, params_descs[k]);
                // p.newvalue = p.value;
                p.newqueue = p.queue;
            };

            defer.resolve(Params);
        });

        return defer.promise;
    }

    // Поставить в очередь на изменение параметра (skey должен быть задан при вызове .get)
    Params.set = function(k){
        var defer = $q.defer();
        var p = Params.value[k];

        if(Params.skey == null) {
            defer.reject();
            return;
        }

        $http({
            method: 'POST',
            url: SERVER.api + "/params/queue/" + encodeURIComponent(Params.skey),
            data: {key: k, value: p.queue}
        }).success(function(data){
            // console.log('params.Params.set.success', data);
            /*if(p.value != p.newvalue){
              p.queue = p.newvalue;
            } else {
              p.queue = null;
            }*/
            p.newqueue = p.queue;

            defer.resolve();
        });
        //console.log("Params.set", k);
        return defer.promise;
    }

    // Отменить изменение параметра
    Params.cancel = function(k){
        var defer = $q.defer();
        var p = Params.value[k];

        $http({
            method: 'DELETE',
            url: SERVER.api + "/systems/" + encodeURIComponent(Params.skey) + "/params/queue/" + encodeURIComponent(k)
        }).success(function(data){
            // console.log('params.Params.del.success', data);

            // p.newvalue = p.value;
            p.queue = null;
            p.newqueue = null;
            defer.resolve();
        });

        return defer.promise;
    }

    // Отменить все изменения
    Params.cancelall = function(skey){
        var defer = $q.defer();

        $http({
            method: 'DELETE',
            url: SERVER.api + "/systems/" + encodeURIComponent(skey) + "/params/queue"
        }).success(function(data){
            // console.log('params.Params.delall.success', data);

            for (var k in Params.value) {
                var p = Params.value[k];
                // p.newvalue = p.value;
                p.queue = null;
                p.newqueue = null;
              //$scope.cancelqueue(k);
            };
            defer.resolve();
        });

        return defer.promise;
    }

    return Params;

}])

.factory('ParamsOld', ['SERVER', '$resource', 'Connect', function (SERVER, $resource, Connect) {

    // console.log('-- resources.params.Params', SERVER, Connect, SERVER.api.replace(/:\d/, '\\$&'));

    var Params = $resource(SERVER.api.replace(/:\d/, '\\$&') + "/params/:skey/:controller",
    {
        skey: "@skey",
        controller: "@controller",
        apikey: "4f679234645"
    },
    {
        set: {
            method: "POST",
            params: {
                controller: "set"
            }
        }
    });

    return Params;
}]);

