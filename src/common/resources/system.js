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

        var liters = scale(v);

        return Math.round(liters * 10) / 10; // округление до 0.1
    }

    Systems.$update = function(){
        if(this.dynamic && this.dynamic.fuel){
            this.dynamic.fuel = fuel(this.params.fuel, this.dynamic.fuel);
        }
    }

    return Systems;

}])

// Устаревшее описание. Пока не удаляю, так как еще нужно разобраться с топливом, возможно вариант с массивом будет лучше
.factory('System2', ['SERVER', '$http', '$q', 'Connect', function (SERVER, $http, $q, Connect) {

    // Построим формулу преобразования значения АЦП в объем топлива
    // В цепи измерения делитель: 22k/10k
    // В перспективе значение должно быть привязано к hwid
    // Результат преобразования является массив 0..1023 для 10тибитного АЦП
    System.fuelrecalc = function(fuel) {
        var r1 = 22,
            r2 = 10,
            vdd = 3.3,
            out = [],
            vmax = fuel[fuel.length-1].voltage,
            lmax = fuel[fuel.length-1].liters,
            // Функция поиска индекса по напряжению.
            // Предполагается что напряжения в возрастающей последовательности.
            b = d3.bisector(function(d){return d.voltage}).right;

        // console.log('fuel = ', fuel);

        for(var i=0; i<1024; i++){
            var v = (i * vdd / 1024) * (r1+r2) / r2 ; // +- 1lsb?
            if(v >= vmax){
                out.push(lmax);
            } else {
                var index = b(fuel, v);
                if(index == 0){
                    out.push(0);
                } else if(index >= fuel.length){
                    out.push(lmax);
                } else {
                    // console.log('index=', index, fuel, fuel[index]);
                    var v1 = fuel[index-1].voltage,
                        v2 = fuel[index].voltage,
                        l1 = fuel[index-1].liters,
                        l2 = fuel[index].liters,
                        vdelta = v2 - v1,
                        ldelta = l2 - l1,
                        liters = l1 + (l2 - l1) * (v - v1) / (v2 - v1);

                    out.push(Math.round(liters * 100) / 100); // округление до 0.01
                }
            }
        }
        // console.log('out=', out);
        // data.fuelarray = out;
        return out;
    }
    return System;
}]);
