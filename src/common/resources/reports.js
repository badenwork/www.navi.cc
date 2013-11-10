angular.module('resources.reports', ['resources.account', '$strap.directives', 'resources.geogps', 'resources.system', 'i18n'])

.factory('Reports', ['$location', 'Account', '$http', 'SERVER', 'GeoGPS', 'System', '$rootScope', '$filter',
    function($location, Account, $http, SERVER, GeoGPS, System, $rootScope, $filter) {
       'use strict';
        var humanizeMiliseconds = $filter ('humanizeMiliseconds');
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
            var tz = (new Date ()).getTimezoneOffset () / 60;
            var hours = d.valueOf() / 1000 / 3600 + tz; 
            return Math.floor (hours);
        };
        Reports.hoursToDate = function (hours) {
            var tz = (new Date ()).getTimezoneOffset () / 60;
            var d = new Date ((hours - tz) * 60 * 60 * 1000);
            return d;
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
            var report = {
                interval: {
                    hStart: hStart,
                    hStop: hStop
                },
                systemName: '',
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
                start: moment (startDay).format ('DD/MM/YYYY'),
                stop: moment (stopDay).format ('DD/MM/YYYY')
            };
            return interval;
        };
        Reports.downloadReport = function (report) {
            var interval = Reports.getReportInterval (report);
            var fileName = report.systemName + '_' + interval.start + '_' + interval.stop + '.xlsx';
            var link = $('<a />');
            link.attr ('href', getXLSXDownloadLink (report));
            link.attr ('download', fileName);
            link [0].click ();
        };
        
        Reports.completeSingleReport = function (report) {
            if (report.ready)
                return;
            
            var geocoder = new google.maps.Geocoder();
            var formatPosition = function (report, index, coordinatesIndex) {
                if (index === report.reportData.mRows.length || report.reportData.mRows.length === 0) {
                    report.reportData.addressesIsReady = true;
                    return;
                }
                var eventType = report.reportData.mRows [index].event;
                if (eventType === 'm') {
                    formatPosition (report, index + 1, coordinatesIndex);
                    return;
                }
                geocoder.geocode({
                        'latLng': new google.maps.LatLng (report.reportData.mRows [index].data.start.lat, report.reportData.mRows [index].data.start.lon)
                    },
                    function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var address = '';
                            var parts = results [0].address_components;
                            for (var i = parts.length - 1; i >= 0; --i) {
                                address += parts [i].long_name + ((i === 0) ? '' : ', ');
                            }
                            var item = report.reportData.mRows [index].columns [coordinatesIndex] = address;
                            setTimeout(function() {
                                formatPosition(report, index + 1, coordinatesIndex);
                            }, 1100);
    
                        } else {
                            //console.log ('formatPosition --> MARK_6');
                            //повторно запросить
                            setTimeout(function() {
                                formatPosition(report, index, coordinatesIndex);
                            }, 2000);
                        }
                    });
            };
            var convertCoordinatesToAdresses = function (report) {
                var coordinatesIndex = -1;
                for (var i = 0; i < report.template.mE.length; i++) {
                    if (report.template.mD [i] === 'c') {
                        coordinatesIndex = i;
                        break;
                    }
                }
                if (coordinatesIndex >= 0) {
                    formatPosition   (report, 0, coordinatesIndex);
                }
            };
            var pointToPointDistance = function(p1, p2) {
                return GeoGPS.distance (p1, p2);
                /*var R = 6371; // km (change this constant to get miles)
                var dLat = (p2.lat - p1.lat) * Math.PI / 180;
                var dLon = (p2.lon - p1.lon) * Math.PI / 180;
                var a = Math.sin (dLat / 2) * Math.sin (dLat / 2) +
                    Math.cos (p1.lat * Math.PI / 180) * Math.cos (p2.lat * Math.PI / 180) *
                    Math.sin (dLon / 2) * Math.sin (dLon / 2);
                var c = 2 * Math.atan2 (Math.sqrt (a), Math.sqrt (1 - a));
                var d = R * c;
                return d;*/
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
                return maxSpeed;
            };

            var calculateFuelChanges = function (ranges, rangeIndex, points, systemParams) {
                return ;//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            };
            var calculateFuelLevel = function (ranges, rangeIndex, points, systemParams) {
                return ;//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            };
            var calculateDuration = function (ranges, rangeIndex, points, systemParams) {
                return humanizeMiliseconds (getRangeDuration (ranges [rangeIndex]));
                //return moment.duration (getRangeDuration (ranges [rangeIndex])).humanize (); 
            };
            var calculateAverageSpeed = function (ranges, rangeIndex, points, systemParams) {
                var rangeDuration = getRangeDuration (ranges [rangeIndex]);
                var distance = calculateTravelDistance (ranges, rangeIndex, points, systemParams);
                var averageSpeed = distance / (rangeDuration / 1000 / 60 / 60);
                return averageSpeed;
            };
            var calculateTravelDistance = function (ranges, rangeIndex, points, systemParams) {
                var travelDistance = 0;
                var startIndex = ranges [rangeIndex].start_index;
                var stopIndex = ranges [rangeIndex].stop_index;
                var p1, p2;
                for (var i = startIndex; i < stopIndex; i++) {
                    p1 = points [i];
                    p2 = points [i + 1];
                    travelDistance += pointToPointDistance (p1, p2);
                }
                return travelDistance;
            };
            var getEventTypeStr = function (ranges, rangeIndex, points, systemParams) {
                var range = ranges [rangeIndex];
                var typeStr = (range.type === 'MOVE') ? 'm' : 's';
                var duration = 0;
                if (typeStr == 's') {
                    duration = getRangeDuration (range); 
                    if (duration < systemParams.stopTime) {
                        typeStr = 'ss';   
                    }
                }
                return typeStr;
            };
            var getCoordinates = function (ranges, rangeIndex, points) {
                var item = ranges [rangeIndex].start;
                return Math.floor (item.lat * 1000000) / 1000000 + ',' + Math.floor(item.lon * 1000000) / 1000000;
            };
            var getIntervalStr = function (ranges, rangeIndex, points) {
                var start = ranges [rangeIndex].start.dt * 1000;
                var stop = ranges [rangeIndex].stop.dt * 1000;
                return  moment (new Date (start)).format ('DD/MM HH:mm') + ' - ' + moment (new Date (stop)).format ('DD/MM HH:mm');
            };
            var skipMainRow = function (row, template) {
                var skip = true;
                var eventTypeStr = row.eventTypeStr;
                for (var i = 0; i < template.mE.length; i++) {
                    if (eventTypeStr === template.mE [i]) {
                        skip = false;
                        break;
                    }
                }
                return skip;
            };
            var getMainHeaders = function (template, systemParams) {
                var headers = [];
                for (var i = 0; i < template.mD.length; i++) {
                    var str = template.mD [i];
                    if (!systemParams.hasFuelSensor && (str === 'fL' || str === 'cFL')) {
                        continue;
                    }
                        headers.push (str);
                }
                return headers;
            };
            
            var getFullMainRow = function (ranges, i, points, systemParams) {
                var row_fullData = {};
                row_fullData.eventTypeStr = getEventTypeStr (ranges, i, points, systemParams);
                row_fullData.fuelChanges = calculateFuelChanges (ranges, i, points, systemParams);
                row_fullData.duration = calculateDuration (ranges, i, points, systemParams);
                row_fullData.fuelLevel = calculateFuelLevel (ranges, i, points, systemParams);
                row_fullData.coordinates = getCoordinates (ranges, i, points, systemParams);
                row_fullData.averageSpeed = calculateAverageSpeed (ranges, i, points, systemParams);
                row_fullData.travelDistance = calculateTravelDistance (ranges, i, points, systemParams);
                row_fullData.interval = getIntervalStr (ranges, i, points, systemParams);
                row_fullData.range = ranges [i];
                return row_fullData;
            };
            var concatMainRows = function (row2, row1) {
                var newRow = {};
                newRow.eventTypeStr = row1.eventTypeStr;
                newRow.fuelChanges = row1.fuelChanges + row2.fuelChanges;
                var duration_milisec = (row1.range.stop.dt - row2.range.start.dt) * 1000;
                newRow.duration = humanizeMiliseconds (duration_milisec);  //moment.duration (duration_milisec).humanize ();
                newRow.fuelLevel = '';
                newRow.coordinates = '';
                newRow.travelDistance = (row2.travelDistance + row1.travelDistance);
                newRow.averageSpeed = newRow.travelDistance / (duration_milisec / 1000 / 60 / 60);
                var start = row1.range.stop.dt * 1000;
                var stop = row2.range.start.dt * 1000;
                newRow.interval = moment (new Date (stop)).format ('DD/MM HH:mm') + ' - ' + moment (new Date (start)).format ('DD/MM HH:mm');
                var newRange = {};
                newRange.start = row2.range.start;
                newRange.stop = row1.range.stop;
                newRange.start_index = row2.range.start_index;
                newRange.stop_index = row1.range.stop_index;
                newRange.type = row1.type;
                newRow.range = newRange;
                return newRow;
            };
            var adaptDataToEvent = function (fullRow) {
                var eventType = fullRow.eventTypeStr;
                if (eventType === 'm') {
                    fullRow.coordinates = '';
                } else {
                    fullRow.averageSpeed = '';
                    fullRow.travelDistance = '';
                }
            };
            var getMainRow = function (row_fullData, template, systemParams) {
                adaptDataToEvent (row_fullData);
                var row = {event: row_fullData.eventTypeStr, columns:[], data: row_fullData.range};
                for (var i = 0; i < template.mD.length; i++) {
                    switch (template.mD [i]) {
                        case 'c': row.columns.push (row_fullData.coordinates); break;
                        case 'i': row.columns.push (row_fullData.interval); break;
                        case 'cFL': if (systemParams.hasFuelSensor) row.columns.push (Math.floor (row_fullData.fuelChanges * 10) / 10); break;
                        case 'fL': if (systemParams.hasFuelSensor) row.columns.push (Math.floor (row_fullData.fuelLevel * 10) / 10); break;
                        case 'd': row.columns.push (row_fullData.duration); break;
                        case 'aS': row.columns.push (Math.round (row_fullData.averageSpeed * 10) / 10); break;
                        case 'dT': row.columns.push (Math.round (row_fullData.travelDistance * 100) / 100); break;
                        default: continue;
                    }
                }
                return row;
            };
            
            
            
            var sys = System.get (report.systemKey);

            sys.then (function (sys) {
                report.system = sys;
                report.systemName = sys.title;
                GeoGPS.select (report.systemKey);
                var data = GeoGPS.getTrack (report.interval.hStart, report.interval.hStop);
                data.then (function (track) {
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
                    var systemParams = report.system.params;
                    if(!systemParams.fuelan) {
                        systemParams.fuelan = {
                            middle: 10,
                            stop: 1.2,
                            corr: [
                                {speed: 5, value: 3.2},
                                {speed: 30, value: 1.6},
                                {speed: 60, value: 1.0},
                                {speed: 90, value: 0.8},
                                {speed: 120, value: 1.0},
                                {speed: 150, value: 1.26},
                                {speed: 180, value: 1.6}
                            ]
                        };
                    }
                    // на всякий случай сортируем по возростанию скорости
                    systemParams.fuelan.corr.sort (function(obj1, obj2) {
                      if (obj1.speed < obj2.speed) return -1;
                      if (obj1.speed > obj2.speed) return 1;
                      return 0;
                    });
                    systemParams.fuelan.getCoef = function (speed) {
                        var corr = systemParams.fuelan.corr;
                        var coef = corr [corr.length - 1].value,
                            intervalStart, intervalStop;
                        for (var i = 0; i < corr.length - 1; i++) {
                            intervalStart = corr [i];
                            intervalStop = corr [i + 1];
                            if (intervalStart.speed > speed) {
                                coef = intervalStart.value;
                                break;
                            } else if (intervalStop.speed > speed) {
                                var first = speed - intervalStart.speed;
                                var second = intervalStop.speed - speed;
                                var total = intervalStop.speed - intervalStart.speed;
                                coef = (1 - first / total) * intervalStart.value + (1 - second / total) * intervalStop.value;
                                break;
                            }
                        }
                        return coef;
                    };
                    systemParams.hasFuelSensor = report.system.car.hasFuelSensor;
                    systemParams.stopTime = (report.system.car.stop | 3) * 60 * 1000;
                    mHeaders = getMainHeaders (template, systemParams);
                    sHeaders = angular.copy (template.sD);
                    
                    var ranges = track.ranges;
                    var item, i;
                    var points = track.points;
                    report.reportData.points = points;
                    var rows_fullData = [];
                    var row_fullData, prevMainRow;
                    for (i = 0; i < ranges.length; i++) {
                        row_fullData = getFullMainRow (ranges, i, points, systemParams);
                        rows_fullData.push (row_fullData);
                    }
                    
                    for (i = 0; i < rows_fullData.length; i++) {
                        row_fullData = rows_fullData [i];
                        if (!skipMainRow (row_fullData, template)) {
                            /*var row = getMainRow (row_fullData, template, systemParams);
                                row.data = row_fullData.range;
                                mRows.push (row);*/
                            if (prevMainRow && prevMainRow.eventTypeStr === 'm' &&
                                row_fullData.eventTypeStr === 'm') {
                                //console.log ('full main row concatted!! prevMainRow : ', prevMainRow, ' currentMainRow : ', row_fullData);
                                row_fullData = concatMainRows (prevMainRow, row_fullData);
                            } else if (prevMainRow) {
                                mRows.push (getMainRow (prevMainRow, template, systemParams));
                            }
                            prevMainRow = row_fullData;
                        }
                    }
                    
                    if (!skipMainRow (prevMainRow, template)) {
                        var row = getMainRow (prevMainRow, template, systemParams);
                        mRows.push (row);
                    }
                        
        ////////////////// SUMMARY REPORT
           
                    var calculateTotalTraveledDistance = function (ranges, points, systemParams) {
                        var totalDistance = 0;
                        var eventStr;
                        for (var i = 0; i < ranges.length; i++) {
                            eventStr = getEventTypeStr (ranges, i, points, systemParams);
                            if (eventStr === 'm') 
                                totalDistance += calculateTravelDistance (ranges, i, points, systemParams);
                        }
                        return Math.round (totalDistance * 10) / 10;
                    };
                    var calculateTotalTraveledTime = function (ranges, points, systemParams) {
                        var totalTime = 0;
                        var eventStr;
                        for (var i = 0; i < ranges.length; i++) {
                            eventStr = getEventTypeStr (ranges, i, points, systemParams);
                            if (eventStr === 'm' || eventStr === 'ss')
                                totalTime += getRangeDuration (ranges [i]);
                        }
                        return totalTime;
                    };
                    var calculateTotalStopedTime = function (ranges, points, systemParams) {
                        var totalTime = 0;
                        var eventStr;
                        for (var i = 0; i < ranges.length; i++) {
                            eventStr = getEventTypeStr (ranges, i, points, systemParams);
                            if (eventStr === 's')
                                totalTime += getRangeDuration (ranges [i]);
                        }
                        return totalTime;
                    };
                    var calculateMaxSpeed = function (ranges, points, systemParams) {
                        var maxSpeed = 0, tmp = 0;
                        var eventStr;
                        for (var i = 0; i < ranges.length; i++) {
                            eventStr = getEventTypeStr (ranges, i, points, systemParams);
                            if (eventStr === 'm') {
                                tmp = getMaxSpeedFromIntervalPoints (points, ranges [i].start_index, ranges [i].stop_index);
                                if (tmp > maxSpeed) {
                                    maxSpeed = tmp;   
                                }
                            }
                        }
                        return maxSpeed;
                    };
                    var calculateTotalAverageSpeed = function (ranges, points) {
                        var totalTime = calculateTotalTraveledTime (ranges, points, systemParams);
                        if (totalTime === 0)
                            return 0;
                        var totalDistance = calculateTotalTraveledDistance (ranges, points, systemParams);
                        var totalAverageSpeed = totalDistance / (totalTime / 1000 / 60 / 60);
                        return Math.round (totalAverageSpeed * 10) / 10;
                    };
                    var calculateFuelConsumption_sensor = function (ranges, points, systemParams) {
                        return ;//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    };
                    var calculateFuelConsumption_analytically = function (ranges, points, systemParams) {
                        var eventType, 
                            totalSSTime = 0, 
                            fuelConsumption = 0,
                            distance,
                            speed,
                            coef;
                        for (var i = 0; i < ranges.length; i++) {
                            eventType = getEventTypeStr (ranges, i, points, systemParams);
                            if (eventType === 'm') {
                                speed = calculateAverageSpeed (ranges, i, points, systemParams);
                                distance = calculateTravelDistance (ranges, i, points, systemParams);
                                coef = systemParams.fuelan.getCoef (speed);
                                fuelConsumption += (distance / 100) * systemParams.fuelan.middle * coef;
                            } else if (eventType === 'ss') {
                                totalSSTime += getRangeDuration (ranges [i]);
                            }
                        }
                        fuelConsumption += systemParams.fuelan.stop * (totalSSTime / 1000 / 60 / 60);
                        return Math.round (fuelConsumption * 10) / 10;
                    };
                    var calculateTotalDrainFuel = function (ranges, points, systemParams) {
                        return ;//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    };
                    var calculateTotalRefueling = function (ranges, points, systemParams) {
                        return ;//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    };
    
                    var getSummaryRow = function (event, systemParams) {
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
                            case  'fCs': if (systemParams.hasFuelSensor) sRow = createRow (event, summary_row_full.fuelConsumption_sensor); break;
                            case  'fCa': sRow = createRow (event, summary_row_full.fuelConsumption_analytically); break;
                            case  'tF': if (systemParams.hasFuelSensor) sRow = createRow (event, summary_row_full.totalRefueling); break;
                            case  'tDF': if (systemParams.hasFuelSensor) sRow = createRow (event, summary_row_full.totalDrainFuel); break;
                        }
                        return sRow;
                    };
                    var summary_row_full = [];
                    summary_row_full.totalTraveledDistance = calculateTotalTraveledDistance (ranges, points, systemParams) + ' км';
                    summary_row_full.totalTraveledTime = humanizeMiliseconds (calculateTotalTraveledTime (ranges, points, systemParams));
                    summary_row_full.totalStopedTime = humanizeMiliseconds (calculateTotalStopedTime (ranges, points, systemParams));
                    summary_row_full.maxSpeed = Math.round (calculateMaxSpeed (ranges, points, systemParams)) + ' км/ч';
                    summary_row_full.totalAverageSpeed = calculateTotalAverageSpeed (ranges, points, systemParams) + ' км/ч';
                    summary_row_full.fuelConsumption_sensor = calculateFuelConsumption_sensor (ranges, points, systemParams) + ' л';
                    summary_row_full.fuelConsumption_analytically = calculateFuelConsumption_analytically (ranges, points, systemParams) + ' л';
                    summary_row_full.totalDrainFuel = calculateTotalDrainFuel (ranges, points, systemParams) + ' л';
                    summary_row_full.totalRefueling = calculateTotalRefueling (ranges, points, systemParams) + ' л';
                    for (i = 0; i < template.sE.length; i++) {
                        var sRow_final = getSummaryRow (template.sE [i], systemParams);
                        if (sRow_final) {
                            sRows.push (sRow_final);
                        }
                    }
                    report.reportData.mHeaders = mHeaders;
                    report.reportData.mRows = mRows;
                    report.reportData.sHeaders = sHeaders;
                    report.reportData.sRows = sRows;                
                    report.reportData.addressesIsReady = false;
                    convertCoordinatesToAdresses (report);
                    report.ready = true;
                    return report;
                });
            });
        };
        return Reports;
}]);