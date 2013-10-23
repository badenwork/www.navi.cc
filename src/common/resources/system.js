angular.module('resources.system', ['services.connect'])

.factory('System', ['REST', function (REST) {
    var Systems = new REST('system');

    // Построим формулу преобразования значения АЦП в объем топлива
    // В цепи измерения делитель: 22k/10k
    // В перспективе значение должно быть привязано к hwid
    // Systems.$fuel = function(system, value){
    var fuel = function(fuel, value){
        var r1 = 22,
            r2 = 10,
            vdd = 3.3,
            vmin = fuel[0].voltage,             // Предполагается что функция неубывающая.
            vmax = fuel[fuel.length-1].voltage;

        var v = (value * vdd / 1024) * (r1+r2) / r2 ; // +- 1lsb?
        v = Math.max(v, vmin);
        v = Math.min(v, vmax);

        var scale = d3.scale.linear()
            .domain(fuel.map(function(d){return d.voltage}))
            .range(fuel.map(function(d){return d.liters}));
        return scale(v);
    }

    Systems.$update = function(){
        if(this.dynamic && this.dynamic.fuel){
            this.dynamic.fuel = fuel(this.params.fuel, this.dynamic.fuel);
        }
    }

    return Systems;

}]);
