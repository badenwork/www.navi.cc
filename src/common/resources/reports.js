angular.module('resources.reports', ['resources.account', '$strap.directives', 'resources.geogps', 'resources.system', 'i18n'])

.factory('Reports', ['$location', 'Account', '$http', 'SERVER', 'GeoGPS', 'System', '$rootScope', '$filter',
    function($location, Account, $http, SERVER, GeoGPS, System, $rootScope, $filter) {
       'use strict';
        
        var Reports = {
          allReports: []
        };
        Reports.removeReport = function (report) {
            var index = Reports.allReports.indexOf (report);
            Reports.allReports.splice (index, 1); 
        };
        var arraySeparator = ',';
        Reports.dateToHours = function (d) {
            d.setHours (0);
            d.setMinutes (0);
            d.setSeconds (0);
            var tz = (new Date ()).getTimezoneOffset() / 60;
            var hours = Math.floor ((d) / 1000 / 3600 + tz); 
            return hours;
        };
        Reports.hoursToDate = function (hours) {
            return new Date();
        };
        Reports.createUrl = function (skey, hoursStart, hoursStop, template) {
            var addParamToString = function (str, paramsName, params) {
                str += '&' + paramsName + '=';
                if (params.length > 0) {
                    str += params [0];
                    for (var i = 1; i < params.length; i++) {
                        str += arraySeparator + params [i];
                    }
                }
                
                return str;
            };
            var url = '?skey=' + skey + '&hStart=' + hoursStart + '&hStop=' + hoursStop;
            url = addParamToString (url, 'mE', template.mE);
            url = addParamToString (url, 'mD', template.mD);
            url = addParamToString (url, 'sE', template.sE);
            url = addParamToString (url, 'sD', template.sD);
            return url;
        };
        
        
        Reports.paramsToTemplate = function (mEStr, mDStr, sEStr, sDStr) {
            var paramsStrToArray = function (str) {
                var templateParams = str.split (arraySeparator);
                return templateParams;
            };
            var mE = paramsStrToArray (mEStr);
            var mD = paramsStrToArray (mDStr);
            var sE = paramsStrToArray (sEStr);
            var sD = paramsStrToArray (sDStr);
            return {mE: mE, mD: mD, sE: sE, sD: sD};
        };
        
        Reports.getEmptySingleReport = function (skey, hStart, hStop, template) {
            var system = System.get (skey);
            var report = {
                interval: {
                    hStart: hStart,
                    hStop: hStop
                },
                systemName: system.title,
                systemKey: skey,
                template: template,
                url: '',
                ready: false,
                reportData: {
                    mHeaders: [],
                    mRows: [],
                    sHeaders: [],
                    sRows: []
                }
            };  
            report.url = Reports.createUrl (skey, report.interval.hStart, report.interval.hStop, template);
            system.then (function (sys) {
                report.systemName = sys.title;
                report.system = sys;
            });
            return report;
        };
        
        Reports.saveReport = function (report) {
            Reports.allReports.push (report);
        };
        
        Reports.getSingleReport = function (skey, hStart, hStop, template) {
            var report;
            var urlStr = Reports.createUrl (skey, hStart, hStop, template);
            for (var i = 0; i < Reports.allReports.length; i++) {
                if (Reports.allReports [i].url === urlStr) {
                    report = Reports.allReports [i];
                }
            }
            if (!report) {
                report = Reports.getEmptySingleReport (skey, hStart, hStop, template);
                Reports.completeSingleReport (report);
            }
            return report;
        };
        var getXLSXDownloadLink = function (report) {
            var row, line, i, j, str;
            var mHeaders = [$filter("translate")('event')];
            for (i = 0; i < report.reportData.mHeaders.length; i++) {
                str = $filter("translate")(report.reportData.mHeaders [i]);
                mHeaders.push (str);
            }
            var mainReport = [mHeaders];
            for (i = 0; i < report.reportData.mRows.length; i++) {
                row = report.reportData.mRows [i];
                if (row.type == 'separator') {
                    line = [{
                        colSpan: report.reportData.mHeaders.length + 1,
                        value: row.columns [0]
                    }];
                } else {
                    str = $filter("translate")(row.event);
                    line = [str];
                    for (j = 0; j < row.columns.length; j++) {
                        line.push (row.columns [j]);
                    }
                }
                mainReport.push (line);
            }
            
            var sHeaders = [$filter("translate")('Controlled parameters')];
            for (i = 0; i < report.reportData.sHeaders.length; i++) {
                str = $filter("translate")(report.reportData.sHeaders [i]);
                sHeaders.push (str);
            }
            var summaryReport = [sHeaders];
            
            for (i = 0; i < report.reportData.sRows.length; i++) {
                row = report.reportData.sRows [i];
                str = $filter("translate")(row.event);
                line = [str];
                for (j = 0; j < row.columns.length; j++) {
                    line.push (row.columns [j]);
                }
                summaryReport.push (line);
            }
            
            var sheet = xlsx({
                worksheets: [{
                    data: mainReport,
                    name: $filter("translate")('Main report')
                }, {
                    data: summaryReport,
                    name: $filter("translate")('Summary report')
                }]
            });
        
            // data URI
            return sheet.href();
        };
        Reports.getReportInterval = function (report) {
            var startDay = Reports.hoursToDate (report.interval.hStart);
            var stopDay = Reports.hoursToDate (report.interval.hStop);
            var interval = {
                start: moment(Reports.hoursToDate (startDay)).format('DD/MM/YYYY'),
                stop: moment(Reports.hoursToDate (stopDay)).format('DD/MM/YYYY')
            };
            return interval;
        };
        Reports.downloadReport = function (report) {
            var interval = Reports.getReportInterval (report);
            var fileName = report.systemName + '_' + interval.start + '_' + interval.stop + '.xlsx';
            var link = $('<a />');
            link.attr('href', getXLSXDownloadLink(report));
            link.attr('download', fileName);
            link[0].click();
        };
        
        Reports.completeSingleReport = function (report) {
            if (report.ready)
                return;
            var pointToPointDistance = function(p1, p2) {
                var R = 6371; // km (change this constant to get miles)
                var dLat = (p2.lat - p1.lat) * Math.PI / 180;
                var dLon = (p2.lon - p1.lon) * Math.PI / 180;
                var a = Math.sin (dLat / 2) * Math.sin (dLat / 2) +
                    Math.cos (p1.lat * Math.PI / 180) * Math.cos (p2.lat * Math.PI / 180) *
                    Math.sin (dLon / 2) * Math.sin (dLon / 2);
                var c = 2 * Math.atan2 (Math.sqrt (a), Math.sqrt (1 - a));
                var d = R * c;
                return d;
            };
            
            var getRangeDuration = function (range) {
                return (range.stop.dt - range.start.dt) * 1000;
            };
            
            var getMaxSpeedFromIntervalPoints = function (points, startIndex, stopIndex) {
                var maxSpeed = 0;
                for (var i = startIndex; i <= stopIndex; i++) {
                    if (points [i].speed > maxSpeed) {
                        maxSpeed = points [i].speed;   
                    }
                }
                return Math.floor (maxSpeed * 10) / 10;
            };

            var calculateFuelChanges = function (ranges, rangeIndex, points) {
                return ;
            };
            var calculateFuelLevel = function (ranges, rangeIndex, points) {
                return ;
            };
            var calculateDuration = function (ranges, rangeIndex, points) {
                return moment.duration(getRangeDuration (ranges [rangeIndex])).humanize(); 
            };
            var calculateAverageSpeed = function (ranges, rangeIndex, points) {
                var rangeDuration = getRangeDuration (ranges [rangeIndex]);
                var distance = calculateTravelDistance (ranges, rangeIndex, points);
                var averageSpeed = distance / (rangeDuration / 1000 / 60 / 60);
                return Math.floor (averageSpeed * 10) / 10;
            };
            var calculateTravelDistance = function (ranges, rangeIndex, points) {
                var travelDistance = 0;
                var startIndex = ranges [rangeIndex].start_index;
                var stopIndex = ranges [rangeIndex].stop_index;
                var p1, p2;
                for (var i = startIndex; i < stopIndex; i++) {
                    p1 = points [i];
                    p2 = points [i + 1];
                    travelDistance += pointToPointDistance (p1, p2);
                }
                return Math.floor(travelDistance * 10) / 10;
            };
            var getEventTypeStr = function (ranges, rangeIndex, points) {
                var item = ranges [rangeIndex].start;
                var typeStr = '';
                switch (item.fsource) {
                    case 7:
                    case 2:
                    case 3: typeStr = 'ss';
                        break;
                    case 4: typeStr = 's';
                        break;
                    case 6:
                    case 8: typeStr = 'm';
                        break;
                    default: typeStr = item.fsource;
                        break;
                }
                return typeStr;
            };
            var getCoordinates = function (ranges, rangeIndex, points) {
                var item = ranges [rangeIndex].start;
                return Math.floor(item.lat * 1000000) / 1000000 + ',' + Math.floor(item.lon * 1000000) / 1000000;
            };
            var getInterval = function (ranges, rangeIndex, points) {
                var start = ranges [rangeIndex].start.dt * 1000;
                var stop = ranges [rangeIndex].stop.dt * 1000;
                return  moment(new Date(start)).format('DD/MM/YYYY') + ' - ' + moment(new Date(stop)).format('DD/MM/YYYY');
            };
            var skipMainEvent = function (eventTypeStr, template) {
                var skip = true;
                for (var i = 0; i < template.mE.length; i++) {
                    if (eventTypeStr === template.mE [i]) {
                        skip = false;
                        break;
                    }
                }
                return skip;
            };
            var getMainHeaders = function (template, hasFuelSensor) {
                var headers = [];
                for (var i = 0; i < template.mD.length; i++) {
                    var str = template.mD [i];
                    if (!hasFuelSensor && (str === 'fL' || str === 'cFL')) {
                        continue;
                    }
                        headers.push (str);
                }
                return headers;
            };
            
            /*
                        coordinates: 'Координаты',                      //c
                        interval: 'Интервал',                           //i
                        changingFuelLevel: 'Изменение уровня топлива',  //cFL
                        fuelLevel: 'Уровень топлива',                   //fL
                        duration: 'Продолжительность',                  //d
                        averageSpeed: 'Средняя скорость',               /aS
                        travelDistance: 'Пройдено'                              //dT
            */
            var getMainRow = function (row_fullData, template, hasFuelSensor) {
                var row = {event: row_fullData.eventTypeStr, columns:[]};
                for (var i = 0; i < template.mD.length; i++) {
                    switch (template.mD [i]) {
                        case 'c': row.columns.push (row_fullData.coordinates); break;
                        case 'i': row.columns.push (row_fullData.interval); break;
                        case 'cFL': if (hasFuelSensor) row.columns.push (row_fullData.fuelChanges); break;
                        case 'fL': if (hasFuelSensor) row.columns.push (row_fullData.fuelLevel); break;
                        case 'd': row.columns.push (row_fullData.duration); break;
                        case 'aS': row.columns.push (row_fullData.averageSpeed); break;
                        case 'dT': row.columns.push (row_fullData.travelDistance); break;
                        default: continue;
                    }
                }
                return row;
            };
            
            if (!report.system) {
                report.system = System.get (report.systemKey);
            }
            
            GeoGPS.select (report.systemKey);
            var track = GeoGPS.getTrack (report.interval.hStart, report.interval.hStop);
            
            track.then (function (track) {
                report.reportData.mHeaders = [];
                report.reportData.mRows = [];
                report.reportData.sHeaders = [];
                report.reportData.sRows = [];
                var mHeaders = [];
                var mRows = [];
                var sHeaders = [];
                var sRows = [];
                if (!track || !track.points || track.points.length === 0) {
                    report.ready = true;
                    return;
                } 
                var template = report.template;
                var hasFuelSensor = report.system.car.hasFuelSensor;
                mHeaders = getMainHeaders (template, hasFuelSensor);
                sHeaders = angular.copy (template.sD);
                
                var ranges = track.ranges.reverse();
                var item, i;
                var points = track.points;
                var rows_fullData = []; 
                for (i = 0; i < ranges.length; i++) {
                    var row_fullData = {};
                    row_fullData.eventTypeStr = getEventTypeStr (ranges, i, points);
                    row_fullData.fuelChanges = calculateFuelChanges (ranges, i, points);
                    row_fullData.duration = calculateDuration (ranges, i, points);
                    row_fullData.fuelLevel = calculateFuelLevel (ranges, i, points);
                    row_fullData.coordinates = getCoordinates (ranges, i, points);
                    row_fullData.averageSpeed = calculateAverageSpeed (ranges, i, points);
                    row_fullData.travelDistance = calculateTravelDistance (ranges, i, points);
                    row_fullData.interval = getInterval (ranges, i, points);
                    row_fullData.range = ranges [i];
                    rows_fullData.push (row_fullData);
                }
                
                for (i = 0; i < rows_fullData.length; i++) {
                    item = rows_fullData [i];
                    if (!skipMainEvent (item.eventTypeStr, template)) {
                        var row = getMainRow (item, template, hasFuelSensor);
                        row.data = item.range;
                        mRows.push (row);
                    }
                }
                
                    
    ///////////////// SUMMARY REPORT
       
                var calculateTotalTraveledDistance = function (ranges, points) {
                    var totalDistance = 0;
                    var eventStr;
                    for (var i = 0; i < ranges.length; i++) {
                        eventStr = getEventTypeStr (ranges, i, points);
                        if (eventStr === 'm') 
                            totalDistance += calculateTravelDistance (ranges, i, points);
                    }
                    return Math.floor(totalDistance * 10) / 10;
                };
                var calculateTotalTraveledTime = function (ranges, points) {
                    var totalTime = 0;
                    var eventStr;
                    for (var i = 0; i < ranges.length; i++) {
                        eventStr = getEventTypeStr (ranges, i, points);
                        if (eventStr === 'm')
                            totalTime += getRangeDuration (ranges [i]);
                    }
                    return totalTime;
                };
                var calculateTotalStopedTime = function (ranges, points) {
                    var totalTime = 0;
                    var eventStr;
                    for (var i = 0; i < ranges.length; i++) {
                        eventStr = getEventTypeStr (ranges, i, points);
                        if (eventStr !== 'm')
                            totalTime += getRangeDuration (ranges [i]);
                    }
                    return moment.duration(totalTime).humanize();
                };
                var calculateMaxSpeed = function (ranges, points) {
                    return getMaxSpeedFromIntervalPoints (points, 0, points.length - 1);
                };
                var calculateTotalAverageSpeed = function (ranges, points) {
                    var totalTime = calculateTotalTraveledTime (ranges, points);
                    var totalDistance = calculateTotalTraveledDistance (ranges, points);
                    var totalAverageSpeed = totalDistance / (totalTime / 1000 / 60 / 60);
                    return Math.floor(totalAverageSpeed * 10) / 10;
                };
                var calculateFuelConsumption_sensor = function (ranges, points) {
                    return ;
                };
                var calculateFuelConsumption_analytically = function (ranges, points) {
                    return ;
                };
                var calculateTotalDrainFuel = function (ranges, points) {
                    return ;
                };
                var calculateTotalRefueling = function (ranges, points) {
                    return;
                };

                var getSummaryRow = function (event, hasFuelSensor) {
                    var sRow;
                    var createRow = function (event, value) {
                      return {event: event, columns: [value]};  
                    };
                    switch (event) {
                        case  'dT': sRow = createRow (event, summary_row_full.totalTraveledDistance); break;
                        case  'tTT': sRow = createRow (event, summary_row_full.totalTraveledTime); break;
                        case  'aS': sRow = createRow (event, summary_row_full.totalAverageSpeed); break;
                        case  'tTOPAS': sRow = createRow (event, summary_row_full.totalStopedTime); break;
                        case  'mS': sRow = createRow (event, summary_row_full.maxSpeed); break;
                        case  'fCs': if (hasFuelSensor) sRow = createRow (event, summary_row_full.fuelConsumption_sensor); break;
                        case  'fCa': sRow = createRow (event, summary_row_full.fuelConsumption_analytically); break;
                        case  'tF': if (hasFuelSensor) sRow = createRow (event, summary_row_full.totalRefueling); break;
                        case  'tDF': if (hasFuelSensor) sRow = createRow (event, summary_row_full.totalDrainFuel); break;
                    }
                    return sRow;
                };
                var summary_row_full = [];
                summary_row_full.totalTraveledDistance = calculateTotalTraveledDistance (ranges, points) + ' км';
                summary_row_full.totalTraveledTime = moment.duration(calculateTotalTraveledTime (ranges, points)).humanize();
                summary_row_full.totalStopedTime = calculateTotalStopedTime (ranges, points);
                summary_row_full.maxSpeed = calculateMaxSpeed (ranges, points) + ' км/ч';
                summary_row_full.totalAverageSpeed = calculateTotalAverageSpeed (ranges, points) + ' км/ч';
                summary_row_full.fuelConsumption_sensor = calculateFuelConsumption_sensor (ranges, points) + ' л';
                summary_row_full.fuelConsumption_analytically = calculateFuelConsumption_analytically (ranges, points) + ' л';
                summary_row_full.totalDrainFuel = calculateTotalDrainFuel (ranges, points) + ' л';
                summary_row_full.totalRefueling = calculateTotalRefueling (ranges, points) + ' л';
                for (i = 0; i < template.sE.length; i++) {
                    var sRow_final = getSummaryRow (template.sE [i]);
                    if (sRow_final) {
                        sRows.push (sRow_final);
                    }
                }
                report.reportData.mHeaders = mHeaders;
                report.reportData.mRows = mRows;
                report.reportData.sHeaders = sHeaders;
                report.reportData.sRows = sRows;
                report.ready = true;
                console.log ('report ready! :', report);
            });
        };
        return Reports;
}]);