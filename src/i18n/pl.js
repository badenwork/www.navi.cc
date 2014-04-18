/* global angular:true */

angular.module('i18n.pl', ['pascalprecht.translate'])

.config(['$translateProvider',
    function($translateProvider) {
        'use strict';

        // Simply register translation table as object hash
        $translateProvider.translations('pl_PL', {
            'translate': 'Błąd Opis.',
            'error_msg': 'Uuuuups. Coś się stało. Użyj jednego z poniższych linków:',

            // Login page
            'enter': 'Entrance',
            'enter_help': 'Wpisz nazwę użytkownika i hasło do swojego konta.',
            'enter_comment': 'Aby skorzystać z usługi, aby zalogować się do systemu.',
            'enter_comment2': 'Aby utworzyć nowe konto, uzupełnić nazwę i hasło, konto zostanie utworzone automatycznie.',
            'user_name': 'Nazwa użytkownika',
            'user_password': 'Hasło',
            'enter_cmd': 'Wpisać',
            'register_cmd': 'Zaregestritovatsya',
            'enter_as': 'Jesteś zalogowany jako {{ value }}',
            'Display name': 'Wyświetla nazwę',
            'Register date': 'Data rejestracji',
            'Administrator': 'Administrator',
            'Observed systems': 'Obserwacji systemów',
            'for_recovery': 'Aby odzyskać hasło',
            'error_auth': 'Błąd autoryzacji, sprawdź dane.',

            'Login': 'Zaloguj się',
            'Map': 'Map',
            'Logs': 'Wydarzenia',
            'Reports': 'Raporty',
            'Export GPS': 'Eksport GPS',
            'Config': 'Ustawienia',
            'Help': 'Pomoc',
            'User': 'Użytkownik',
            'Admin': 'Administracja',

            // Map
            'Display Settings': 'Ustawienia ekranu',
            'Hide track': 'Ukryj utwór',
            'Show track': 'Pokaż utwór',
            'points_in_track': 'Punkty w utworu: {{value}}',

            'AUTO_BOUND_TRACK': 'Ścieżka wyrównania',
            'ANIMATION_DIR': 'Animacja ruchu',
            'STOP_NUMBERS': 'Numeracja parking',
            'FILTERS_ON': 'Filtry',

            // Config page
            'add_system': 'Add system (translate)',
            'system_not_found': 'Tracker nie zostanie znaleziony. Możliwa przyczyna:\n1.tracker wciąż nie komunikować.\n2.Sprawdzić prawidłowe IMEI wejściowego.',

            // params
            'contenteditableTitle': 'Aby zmienić opis, umieść kursor w polu',
            'Has a fuel sensor': 'Posiada czujnik poziomu paliwa',

            // report
            'Generate report': 'Generowanie raportu',
            'event': 'Wydarzenie',
            'Start date:': 'Data rozpoczęcia:',
            'Stop date:': 'Data przydatności:',
            'System:': 'Tracker:',
            'Select system': 'Wybór systemu',
            'Template': 'Szablon',
            'All reports': 'Wszystkie raporty',
            'System Name': 'Nazwa systemu',
            'Date': 'Data',
            'Open': 'Otwórz',
            'Download': 'Pobierz raport',
            'Remove': 'Usunąć',
            'Templates settings': 'Dostosowywanie raportów',
            'Template name': 'Nazwa szablonu',
            'Add new template': 'Tworzenie nowego szablonu',
            'Main report': 'Raport główny',
            'Summary report': 'Raport końcowy',
            'Events': 'Wydarzenia',
            'Select main report data': 'Zaznacz dane, które chcesz monitorować w raporcie głównym',
            'Select summary report data': 'Zaznacz dane, które chcesz śledzić w raporcie końcowym',
            'Data': 'Danych',
            'c': 'Współrzędne',
            'i': 'Przedział czasu',
            'cFL': 'Zmiana poziomu paliwa (l)',
            'fL': 'Poziom paliwa (l)',
            'd': 'Czas trwania',
            'aS': 'Średnia prędkość',
            'dT': 'Dystans pokonany',
            're': 'Tankowanie',
            'fD': 'Spuścić paliwo',
            'tTT': 'Całkowity czas podróży',
            'tTOPAS': 'Całkowity czas parkowania',
            'mS': 'Maksymalna prędkość',
            'fCs': 'Zostały wypalone paliwo (odczyty czujników)',
            'fCa': 'Zostały wypalone paliwo (analitycznie)',
            'tF': 'Razem wypełnione paliwem',
            'tDF': 'Razem pozbawione paliwa',
            'v': 'Value',
            'm': 'Ruch',
            's': 'Parking',
            'Empty data': 'Brak danych na ekranie',
            'Download report': 'Pobierz raport',
            'Controlled parameters': 'Kontrolowane parametry',
            'Report options': 'Zgłoś Opcje',
            'Full template': 'Pełny szablon',
            'Note': 'Uwaga',
            'cFLa': 'Zostały wypalone paliwo (analitycznie)',
            'report in': 'Raport w',
            'Show map': 'Zobacz na mapie'
        });
    }
]);
