/* global angular:true, $:true, d3:true */

angular.module('config.system.params.fuel.an', ['ngRoute', 'app.filters', 'directives.chart'])

.config(['$routeProvider',
    function($routeProvider) {
        'use strict';
        $routeProvider.when('/config/:skey/params/fuel-an', {
            templateUrl: 'templates/config/params/fuel-an.tpl.html',
            controller: 'ConfigParamsFuelAnCtrl',
            resolve: {
                system: ['System', '$route',
                    function(System, $route) {
                        return System.get($route.current.params.skey);
                    }
                ]
            }
        });
    }
])

.controller('ConfigParamsFuelAnCtrl', ['$scope', 'system', '$timeout', '$filter',
    function($scope, system, $timeout, $filter) {
        'use strict';

        var x = d3.scale.pow().exponent(0.2)
            .domain([0.5, 4])
            .range([0, 500])
            .clamp(true);

        $scope.system = system;
        console.log('Fuel Analityc', system);


        if(system.params.fuelan){
            $scope.data = angular.copy(system.params.fuelan);
        } else {
            $scope.data = {
                middle: 10,
                stop: 1.2
            };
            $scope.data.corr = [
                {speed: 5, value: 3.2},
                {speed: 30, value: 1.6},
                {speed: 60, value: 1.0},
                {speed: 90, value: 0.8},
                {speed: 120, value: 1.0},
                {speed: 150, value: 1.26},
                {speed: 180, value: 1.6}
            ];
        }


        $scope.onLogChange = function(i){
            var coef = x.invert($scope.data.corr[i].logvalue);
            $scope.data.corr[i].outvalue = $filter('number')(coef * $scope.data.middle, 2);
            $scope.data.corr[i].value = coef;
        };

        $scope.onChange = function(i){
            var coef = $scope.data.corr[i].outvalue / $scope.data.middle;
            $scope.data.corr[i].logvalue = x(coef);
            $scope.data.corr[i].value = coef;
        };

        $scope.$watch('data.middle', function(){
            // console.log('boo', $scope.data.middle);
            $scope.data.corr.map(function(d){
                d.logvalue = x(d.value);
                d.outvalue = $filter('number')(d.value * $scope.data.middle, 2);
            });
        });

        $scope.$watch('$scope.data.corr', function(){
            console.log('booooooo');
        }, true);

        $scope.onSave = function(){
            // system.params.fuelan = angular.copy($scope.data);
            system.params.fuelan = {
                middle: $scope.data.middle,
                stop: $scope.data.stop,
                corr: []
            };
            $scope.data.corr.map(function(d){
                system.params.fuelan.corr.push({
                    speed: d.speed,
                    value: d.value
                });
            });
            // console.log('save', system);
            system.$patch('params');
        };

    }
]);

/*
.directive('fuelanchart', [
    function() {
        'use strict';

        var link = function(scope, element){
            console.log('fuelanchart link', scope, element);


        var margin = {top: 20, right: 50, bottom: 20, left: 50},
            width = 650 - margin.left - margin.right,
            height = 350 - margin.bottom - margin.top,
            moving,
            currentValue = 0,
            targetValue = 1,
            alpha = .2;



        var x = d3.scale.pow().exponent(.2)
            .domain([0.5, 4])
            .range([0, width])
            .clamp(true);

        var brush = d3.svg.brush()
            .x(x)
            .extent([0, 0])
            .on("brush", brushed);


        var svg = d3.select(element[0]).append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height / 2 + ")")
            .call(d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .tickFormat(function(d) { return d + "×"; })
              .tickSize(0)
              .tickPadding(12))
          .select(".domain")
          .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "halo");

        var slider = svg.append("g")
            .attr("class", "slider")
            .call(brush);

        slider.selectAll(".extent,.resize")
            .remove();

        slider.select(".background")
            .attr("height", height);

        var handle = slider.append("circle")
            .attr("class", "handle")
            .attr("transform", "translate(0," + height / 2 + ")")
            .attr("r", 9);

        slider
            .call(brush.event)
          // .transition() // gratuitous intro!
          //   .duration(750)
            .call(brush.extent([targetValue, targetValue]))
            .call(brush.event);

        function brushed() {
          if (d3.event.sourceEvent) { // not a programmatic event
            targetValue = x.invert(d3.mouse(this)[0]);
            handle.attr("cx", x(targetValue));
            // move();
          } else {
            currentValue = brush.extent()[0];
            handle.attr("cx", x(currentValue));
            console.log('set value', currentValue);
            // d3.select("body").style("background-color", d3.hsl(currentValue, .8, .8));
          }
        }

        function move() {
            console.log('move', targetValue);
            if (moving) return false;
            moving = true;
            currentValue = targetValue;
            slider
                .call(brush.extent([targetValue, targetValue]))
                .call(brush.event);
            // d3.timer(function() {
            //     currentValue = Math.abs(currentValue - targetValue) < 1e-3
            //         ? targetValue
            //         : targetValue * alpha + currentValue * (1 - alpha);

            //     slider
            //         .call(brush.extent([currentValue, currentValue]))
            //         .call(brush.event);

            //     return !(moving = currentValue !== targetValue);
            // });
        }



            scope.$watch('data', function(){
                console.log('TBD redraw');
//                redraw();
            }, true);


        }

        return {
            restrict: 'E',
            scope: {
                data: '='
            },
            // template: '<svg width='500px' height='250px' class='chart'></svg>',
            // template: '<div class="fuelanchart" width="100%" height="50%" viewBox="0 0 600 300" perserveAspectRatio="xMinYMid"></div>',
            template: '<div class="fuelanchart" width="100%" height="50%"></div>',
            replace: true,
            link: link
            // controller: ['$scope', '$element', function($scope, $element){}]
        };
    }
]);
*/


/*
            var data = scope.data;

            var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 35
            },
                width = 650 - margin.left - margin.right,
                height = 350 - margin.top - margin.bottom;

            var x = d3.scale.pow().exponent(.2)
                .range([0, width])
                .domain([0.5, 4])   // Изменение коэффициента от 0.5x до 4x с логарифмической зависимостью
                .clamp(true);

            // Управление мышкой по оси X
            var brush = d3.svg.brush()
                .x(x)
                .extent([0, 0])
                .on("brush", brushed);

            var y = d3.scale.linear()
                .range([height, 0]);

            y.domain(d3.extent(data.corr, function(d) {
                // console.log('speed', d);
                return d.speed;
            }));


            var xAxis = d3.svg.axis()
                .scale(x)
                // .tickSubdivide(3)
                // .tickSize(5, 3, 0)
                .orient('bottom');

            var yAxis = d3.svg.axis()
                .scale(y)
            // .tickValues([1, 2, 3, 5, 8, 13, 21])
            .tickSubdivide(1)
                .tickSize(4, 2, 0)
                .orient('left');

            var svg = d3.select(element[0]).append('svg')
                // .attr('width', width + margin.left + margin.right)
                // .attr('height', height + margin.top + margin.bottom)
                .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
                .attr('perserveAspectRatio', 'xMinYMid')
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis)
                .append('text')
                .attr('x', width)
                .attr('y', -6)
                .style('text-anchor', 'end')
                .text('Коэфициент');

            svg.append('g')
                .attr('class', 'y axis')
                .call(yAxis)
                .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('y', 6)
                .attr('dy', '.71em')
                .style('text-anchor', 'end')
                .text('Скорость');


            svg.selectAll('.yline').data([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).enter().append('line')
                .attr('class', 'tick minor yline')
                .attr('x1', 0)
                .attr('y1', function(d) {
                    return d * height / 10;
                })
                .attr('x2', width)
                .attr('y2', function(d) {
                    return d * height / 10;
                })
                .attr('stroke', '#eee');

// basis - a B-spline, with control point duplication on the ends.
// basis-open - an open B-spline; may not intersect the start or end.
// basis-closed - a closed B-spline, as in a loop.
// bundle - equivalent to basis, except the tension parameter is used to straighten the spline.
// cardinal - a Cardinal spline, with control point duplication on the ends.
// cardinal-open - an open Cardinal spline; may not intersect the start or end, but will intersect other control points.
// cardinal-closed - a closed Cardinal spline, as in a loop.
// monotone - cubic interpolation that preserves monotonicity in y.


            function brushed() {
                var value = x.invert(d3.mouse(this)[0]);
                console.log('FIRE brushed', this, value, d3.event);
                // if (d3.event.sourceEvent) { // not a programmatic event
                //     targetValue = x.invert(d3.mouse(this)[0]);
                //     move();
                // } else {
                //     currentValue = brush.extent()[0];
                //     handle.attr("cx", x(currentValue));
                //     d3.select("body").style("background-color", d3.hsl(currentValue, .8, .8));
                // }
            }

            var line = d3.svg.line()
                .interpolate('cardinal')
                .x(function(d) {
                    return x(d.value);
                })
                .y(function(d) {
                    return y(d.speed);
                });

            svg.append('path')
                .datum(data.corr)
                .attr('class', 'line')
                .attr('d', line);


            var redraw = function(){
                svg.select('path.line')
                    .datum(data.corr) //.transition()
                    .attr('d', line);

                var dots = svg.selectAll('.dot')
                    .data(data.corr);

                dots.enter().append('circle')
                    .attr('class', 'dot')
                    .attr('r', 5)
                    .call(brush);
                    // .on('mousedown', function(d){
                    //     console.log('mousedown', d, this);
                    //     // this.on('mouseup')
                    // })
                    // .append('title')
                    //     .text(function(d) {
                    //         console.log('enter text', d);
                    //         return d.value;
                    //     })
                    //     .attr('y1', 0)
                    //     .attr('y2', 0);

                dots
                    // .transition()
                    .attr('cx', function(d) {
                        return x(d.value);
                    })
                    .attr('cy', function(d) {
                        return y(d.speed);
                    })
                    .select('title')
                    .text(function(d) {
                        return d.speed + ' : ' + d.value;
                    });

                dots.exit().remove();

            }
            // redraw
}
*/
