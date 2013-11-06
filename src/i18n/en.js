/* global angular:true */

angular.module('i18n.en', ['pascalprecht.translate'])

.config(['$translateProvider',
    function($translateProvider) {

        'use strict';

        // Simply register translation table as object hash
        $translateProvider.translations('en_EN', {
            'translate': 'Ошибка описания',
            'error_msg': 'Ooooops. Something happened. Try using one of the following links:',

            // Login page
            'enter': 'Enter',
            'enter_help': 'Enter the user name and password of your account.',
            'enter_comment': 'To use the service to log into the system.',
            'enter_comment2': 'To create a new account, make up a name and password, your account is automatically created.',
            'user_name': 'User name',
            'user_password': 'Password',
            'enter_cmd': 'Confirm',
            'register_cmd': 'Register',
            'enter_as': 'You enter as {{ value }}',
            'Display name': 'Display name',
            'Register date': 'Register date',
            'Administrator': 'Administrator',
            'Observed systems': 'Observed systems',
            'for_recovery': 'To recover your password',
            'error_auth': 'Authorization error, double-check the data.',

            'Login': 'Login',
            'Map': 'Map',
            'Logs': 'Logs',
            'Reports': 'Reports',
            'Export GPS': 'Export GPS',
            'Config': 'Config',
            'Help': 'Help',
            'User': 'User',

            // Map
            'Display Settings': 'Display Settings',
            'Hide track': 'Hide track',
            'Show track': 'Show track',
            'points_in_track': 'Points in track: {{value}}',

            'AUTO_BOUND_TRACK': 'Automatic bound track',
            'ANIMATION_DIR': 'Animation direction',
            'STOP_NUMBERS': 'Numbering of stops / parks',

            // Config page
            'add_system': 'Add system',
            'system_not_found': 'The system is not found. Possible cause:\n1. The system still does not communicate.\n2. Check the correct input IMEI.',

            // params
            'contenteditableTitle': 'To change the description, place the cursor in the field',
            'Has a fuel sensor': 'Has a fuel level sensor',

            // report
            'Generate report': 'Generate report',
            'event': 'Event',
            'Start date:': 'Start date:',
            'Stop date:': 'Stop date:',
            'System:': 'System:',
            'Select system': 'Select the system',
            'Template': 'Template',
            'All reports': 'All reports',
            'System Name': 'System Name',
            'Date': 'Date',
            'Open in new tab': 'Open in new tab',
            'Download': 'Download',
            'Remove': 'Remove',
            'Templates settings': 'Customization of reports',
            'Template name': 'Template name',
            'Add new template': 'Create new template',
            'Main report': 'Main report',
            'Summary report': 'Final report',
            'Events': 'Events',
            'Select main report data': 'Select the data you want to monitor in the main report',
            'Select summary report data': 'Select the data you want to track in the final report',
            'Data': 'Data',
            'c': 'Coordinates',
            'i': 'Time interval',
            'cFL': 'Changing the fuel level',
            'fL': 'Fuel level',
            'd': 'Duration',
            'aS': 'Average speed',
            'dT': 'Distance traveled',
            're': 'Refueling',
            'fD': 'Drain fuel',
            'tTT': 'Total travel time',
            'tTOPAS': 'The total time of parking and stopping',
            'mS': 'Maximum speed',
            'fCs': 'Been spent fuel (sensor readings)',
            'fCa': 'Been spent fuel (analytically)',
            'tF': 'Total filled with fuel',
            'tDF': 'Total drained of fuel',
            'v': 'Value',
            'm': 'Movement',
            's': 'Parking',
            'Empty data': 'No data for display',
            'Download report': 'Download',
            'Controlled parameters': 'Controlled parameters',
            'Report options': 'Report Options',
            'Full template': 'Full template'
        });
    }
]);
