/* global angular:true */

angular.module('i18n.ua', ['pascalprecht.translate'])

.config(['$translateProvider',
    function($translateProvider) {

        'use strict';

        // Simply register translation table as object hash
        $translateProvider.translations('ua_UA', {
            'translate': 'Помилка опису',
            'error_msg': 'Ууууупс. Щось сталося. Спробуйте перейти по одній з наступних посилань:',

            // Login page
            'enter': 'Вхiд',
            'enter_help': 'Введіть ім\'я користувача і пароль свого облікового запису.',
            'enter_comment': 'Щоб користуватися сервісом необхідно авторизуватися в системі.',
            'enter_comment2': 'Для створення нового облікового запису придумайте ім\'я користувача та пароль, обліковий запис буде створена автоматично.',
            'user_name': 'Ім\'я користувача.',
            'user_password': 'Пароль',
            'enter_cmd': 'Увійти',
            'register_cmd': 'Зарегестрітоваться',
            'enter_as': 'Ви увійшли як {{ value }}',
            'Display name': 'Екранне ім\'я',
            'Register date': 'Дата реєстрації',
            'Administrator': 'Адміністратор',
            'Observed systems': 'Спостережуваних систем',
            'for_recovery': 'Для відновлення паролю',
            'error_auth': 'Помилка авторизації, перевірте дані.',

            'Login': 'Вхiд',
            'Map': 'Мапа',
            'Logs': 'Події',
            'Reports': 'Звіти',
            'Export GPS': 'Експорт GPS',
            'Config': 'Налаштування',
            'Help': 'Допомога',
            'User': 'Користувач',
            'Admin': 'Адміністрування',

            // Map
            'Display Settings': 'Налаштування відображення',
            'Hide track': 'Приховати трек',
            'Show track': 'Показати трек',
            'points_in_track': 'Точок в треку: {{value}}',

            'AUTO_BOUND_TRACK': 'Центровка треку',
            'ANIMATION_DIR': 'Анімація руху',
            'STOP_NUMBERS': 'Нумерація стоянок',
            'FILTERS_ON': 'Фільтри',

            // Config page
            'add_system': 'Add system (translate)',
            'system_not_found': 'Система не знайдена. Можливі причини:\n1.Система ще не виходила на зв\'язок.\n2.Перевірте правильність введення IMEI.',

            // params
            'contenteditableTitle': 'Для зміни опису помістіть курсор в полі',
            'Has a fuel sensor': 'Має датчик рівня палива',

            // report
            'Generate report': 'Згенерувати звіт',
            'event': 'Подія',
            'Start date:': 'Дата початку:',
            'Stop date:': 'Дата закінчення:',
            'System:': 'Система:',
            'Select system': 'Виберіть систему',
            'Template': 'Шаблон',
            'All reports': 'Усі звіти',
            'System Name': "Ім'я системи",
            'Date': 'Дата',
            'Open': 'Відкрити',
            'Download': 'Завантажити звіт',
            'Remove': 'Видалити',
            'Templates settings': 'Налаштування звітів',
            'Template name': "Ім'я шаблону",
            'Add new template': 'Створити новий шаблон',
            'Main report': 'Основний звіт',
            'Summary report': 'Підсумковий звіт',
            'Events': 'Події',
            'Select main report data': 'Виберіть дані, які хочете відслідковувати в основному звіті',
            'Select summary report data': 'Виберіть дані, які хочете відслідковувати в підсумковому звіті',
            'Data': 'Дані',
            'c': 'Координати',
            'i': 'Часовий інтервал',
            'cFL': 'Зміна рівня палива',
            'fL': 'Рівень палива',
            'd': 'Тривалість',
            'aS': 'Середня швидкість',
            'dT': 'Пройдена дистанція',
            're': 'Заправка палива',
            'fD': 'Злив палива',
            'tTT': 'Загальний час у дорозі',
            'tTOPAS': 'Загальний час стоянок',
            'mS': 'Максимальна швидкість',
            'fCs': 'Витрачено палива (за показаннями датчика)',
            'fCa': 'Витрачено палива (аналітично)',
            'tF': 'Всього заправлено палива',
            'tDF': 'Всього злито палива',
            'v': 'Значення',
            'm': 'Рух',
            's': 'Стоянка',
            'Empty data': 'Немає даних для відображення',
            'Download report': 'Завантажити звіт',
            'Controlled parameters': 'Контрольовані параметри',
            'Report options': 'Параметри звіту',
            'Full template': 'Повний шаблон',
            'Note': 'Примітка',
            'cFLa': 'Витрачено палива (аналітично)',
            'report in': 'Звіт у форматі',
            'Show map': 'Показати карту'
        });
    }
]);
