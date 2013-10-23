// (function(window, I18n){
// 'use strict';

// I18n.translations = I18n.translations || {};

// I18n.translations.en = {
//     enter: 'Enter',
//     enter_help: 'Enter the user name and password of your account.',
//     enter_comment: 'To use the service to log into the system.',
//     enter_comment2: 'To create a new account, make up a name and password, your account is automatically created.',
//     user_name: 'User name',
//     user_password: 'Password',
//     enter_cmd: 'Confirm'
//   };

// // window.console.log('i18n.en init', I18n);

// })(this, I18n);


angular.module('i18n.en', ['pascalprecht.translate'])
.config(['$translateProvider', function ($translateProvider) {

    // Simply register translation table as object hash
    $translateProvider.translations('en_EN', {
        "translate": "Ошибка описания",
        "error_msg": "Ooooops. Something happened. Try using one of the following links:",

        // Login page
        "enter": "Enter",
        "enter_help": "Enter the user name and password of your account.",
        "enter_comment": "To use the service to log into the system.",
        "enter_comment2": "To create a new account, make up a name and password, your account is automatically created.",
        "user_name": "User name",
        "user_password": "Password",
        "enter_cmd": "Confirm",
        "register_cmd": "Register",
        "enter_as": "You enter as {{ value }}",
        "Display name": "Display name",
        "Register date": "Register date",
        "Administrator": "Administrator",
        "Observed systems": "Observed systems",
        "for_recovery": "To recover your password",
        "error_auth": "Authorization error, double-check the data.",

        "Login": 'Login',
        'Map': 'Map',
        "Logs": "Logs",
        "Reports": "Reports",
        "Export GPS": "Export GPS",
        "Config": "Config",
        "Help": "Help",
        "User": "User",

        // Map
        "Display Settings": "Display Settings",
        "Hide track": "Hide track",
        "Show track": "Show track",
        "points_in_track": "Points in track: {{value}}",

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
        'Generate report': 'Generate report'
});
}]);
