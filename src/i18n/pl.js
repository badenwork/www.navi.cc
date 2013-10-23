// (function(window, I18n){
// 'use strict';

// I18n.translations = I18n.translations || {};

// I18n.translations.pl = {
//     enter: 'Entrance',
//     enter_help: 'Wpisz nazwę użytkownika i hasło do swojego konta.',
//     enter_comment: 'Aby skorzystać z usługi, aby zalogować się do systemu.',
//     enter_comment2: 'Aby utworzyć nowe konto, uzupełnić nazwę i hasło, konto zostanie utworzone automatycznie.',
//     user_name: 'Nazwa użytkownika',
//     user_password: 'Hasło',
//     enter_cmd: 'Wpisać'
//   };

// // window.console.log('i18n.pl init', I18n);
// })(this, I18n);

angular.module('i18n.pl', ['pascalprecht.translate'])
.config(['$translateProvider', function ($translateProvider) {

    // Simply register translation table as object hash
    $translateProvider.translations('pl_PL', {
        "translate": "Błąd Opis.",
        "error_msg": "Uuuuups. Coś się stało. Użyj jednego z poniższych linków:",

        // Login page
        "enter": "Entrance",
        "enter_help": "Wpisz nazwę użytkownika i hasło do swojego konta.",
        "enter_comment": "Aby skorzystać z usługi, aby zalogować się do systemu.",
        "enter_comment2": "Aby utworzyć nowe konto, uzupełnić nazwę i hasło, konto zostanie utworzone automatycznie.",
        "user_name": "Nazwa użytkownika",
        "user_password": "Hasło",
        "enter_cmd": "Wpisać",
        "register_cmd": "Zaregestritovatsya",
        "enter_as": "Jesteś zalogowany jako {{ value }}",
        "Display name": "Wyświetla nazwę",
        "Register date": "Data rejestracji",
        "Administrator": "Administrator",
        "Observed systems": "Obserwacji systemów",
        "for_recovery": "Aby odzyskać hasło",
        "error_auth": "Błąd autoryzacji, sprawdź dane.",

        "Login": "Zaloguj się",
        "Map": "Map",
        "Logs": "Wydarzenia",
        "Reports": "Raporty",
        "Export GPS": "Eksport GPS",
        "Config": "Ustawienia",
        "Help": "Pomoc",
        "User": "Użytkownik",

        // Map
        "Display Settings": "Ustawienia ekranu",
        "Hide track": "Ukryj utwór",
        "Show track": "Pokaż utwór",
        "points_in_track": "Punkty w utworu: {{value}}",

        'AUTO_BOUND_TRACK': 'Automatycznie wyśrodkować utwór',
        'ANIMATION_DIR': 'Kierunek Animacja',
        'STOP_NUMBERS': 'Numeracja przystanków / parki',

        // Config page
        'add_system': 'Add system (translate)',
        'system_not_found': 'System nie zostanie znaleziony. Możliwa przyczyna:\n1.system wciąż nie komunikować.\n2.Sprawdzić prawidłowe IMEI wejściowego.',

        // params
        'contenteditableTitle': 'Aby zmienić opis, umieść kursor w polu',
        'Has a fuel sensor': 'Posiada czujnik poziomu paliwa',

        // report
        'Generate report': 'Generowanie raportu'
    });
}]);
