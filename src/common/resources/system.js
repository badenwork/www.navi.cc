/* global angular:true, d3:true */

angular.module('resources.system', ['services.connect'])

.factory('System', ['REST',
    function(REST) {
        'use strict';

        var Systems = new REST('system');

        // Models.prototype.$add

        // Построим формулу преобразования значения АЦП в объем топлива
        // В цепи измерения делитель: 22k/10k
        // В перспективе значение должно быть привязано к hwid
        // Systems.$fuel = function(system, value){
        var fuelscale = function(fuel) {
            var r1 = 22,
                r2 = 10,
                vdd = 3.3;
                // vmin = fuel[0].voltage, // Предполагается что функция неубывающая.
                // vmax = fuel[fuel.length - 1].voltage;

            var scale = d3.scale.linear()
                .domain(fuel.map(function(d) {
                    return d.voltage * 1024 * r2 / (vdd * (r1 + r2));
                }))
                .range(fuel.map(function(d) {
                    return d.liters;
                }))
                .clamp(true);

            return scale;
        };

        var fuel = function(fuel, value) {
            return fuelscale(fuel)(value);
        };

        Systems.$fuelscale = function(id) {
            var system = this.cached(id);
            if (system && system.params && system.params.fuel) {
                return fuelscale(system.params.fuel);
            } else {
                return function() {
                    return 0;
                };
            }
        };

        var removeSysErrors = function(sys) {
            if (sys.dynamic) {
                switch (sys.dynamic.fsource) {
                    case 2:
                    case 3:
                    case 4:
                    case 7:
                        sys.dynamic.speed = 0;
                        break;
                    default:
                        break;
                }
            }
            if (sys.car && angular.isUndefined(sys.car.hasFuelSensor))
                sys.car.hasFuelSensor = false;
        };

        Systems.$update = function() {
            if (this.dynamic && this.dynamic.fuel) {
                this.dynamic.fuel = fuel(this.params.fuel, this.dynamic.fuel);
            }
            removeSysErrors(this);
        };

        Systems.hwids = {
            "3031": "GGT-200-01",
            "3041": "P220-01",
            "3051": "6000-01",
            "3052": "6000-02",
            "3054": "6000-04",
            "3055": "6000-04Y",
            "3061": "XL200-01",
            "3071": "MT400-01",
            "3073": "MT400-03",
            "3081": "MT300-01",
            "3083": "MT300-03"
        };

        return Systems;

    }
]);
