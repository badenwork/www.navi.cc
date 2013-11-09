www.navi.cc [![Build Status](https://secure.travis-ci.org/baden/www.navi.cc.png)](http://travis-ci.org/baden/www.navi.cc)
===========

WEB-клиент для проекта navi.cc

## Установка

### Инструменты

Вам нужно установить Node.js а затем инструменты разработчика.
Node.js поставляется с пакет-менеджером [npm](http://npmjs.org) для установки NodeJS приложений и библиотек.
* [Установить node.js](http://nodejs.org/download/) (требуется node.js версии> = 0.8.4)
* Установите grunt-cli и модули:

    ```
    sudo npm install -g grunt-cli
    ```

### Библиотеки и зависимости

* Установка зависимостей:

    ```
    npm install
    grunt deps
    ```

## Сборка

_*If you are using Windows then you must run `grunt` as `grunt.cmd`.  Throughout the rest of this README we will just write `grunt`.*_

### Сборка приложения

    ```
    npm install
    grunt production
    ```

## Разработка

### Структура каталога

* `build` содержит задачи для Grunt (не актуально)
* `dist` содержит результат сборки. Готово для загрузки на сервер.
* `src` содержит исходные коды проекта
* `test` содержит данные для тестировани, файлы конфигурации и тесты.
* `components` сюда будут загружены библиотеки сторонних разработчиков

### Локальная отладка

    ```
    grunt server
    ```

### Запуск тестов

Однократный прогон тестов. Подходит также для TravisCI

    ```
    grunt test
    ```

Запуск непрерывного тестирования со слежением за изменениями.

    ```
    grunt test-watch
    ```



_____________________________

The app made up of a number of javascript, css and html files that need to be merged into a final distribution for running.  We use the Grunt build tool to do this.
* Build client application: `grunt build`

## Development

### Folders structure
At the top level, the repository is split into a client folder and a server folder.  The client folder contains all the client-side AngularJS application.  The server folder contains a very basic Express based webserver that delivers and supports the application.
Within the client folder you have the following structure:
* `build` contains build tasks for Grunt
* `dist` contains build results
* `src` contains application's sources
* `test` contains test sources, configuration and dependencies
* `vendor` contains external dependencies for the application

### Default Build
The default grunt task will build (checks the javascript (lint), runs the unit tests (test:unit) and builds distributable files) and run all unit tests: `grunt` (or `grunt.cmd` on Windows).  The tests are run by testacular and need one or more browsers open to actually run the tests.
* `grunt` or `grunt.cmd` (on Windows)
* Open one or more browsers and point them to [http://localhost:8080/__testacular/].  Once the browsers connect the tests will run and the build will complete.
* If you leave the browsers open at this url then future runs of `grunt` will automatically run the tests against these browsers.

### Continuous Building
The watch grunt task will monitor the source files and run the default build task every time a file changes: `grunt watch`.

### Build without tests
If for some reason you don't want to run the test but just generate the files - not a good idea(!!) - you can simply run the build task: `grunt build`.

### Building release code
You can build a release version of the app, with minified files.  This task will also run the "end to end" (e2e) tests.
The e2e tests require the server to be started and also one or more browsers open to run the tests.  (You can use the same browsers as for the unit tests.)
* Run `grunt release`
* Open one or more browsers and point them to [http://localhost:8080/__testacular/].  Once the browsers connect the tests will run and the build will complete.
* If you leave the browsers open at this url then future runs of `grunt` will automatically run the tests against these browsers.

### Continuous testing
You can have grunt (testacular) continuously watch for file changes and automatically run all the tests on every change, without rebuilding the distribution files.  This can make the test run faster when you are doing test driven development and don't need to actually run the application itself.

* Run `grunt test-watch`.
* Open one or more browsers and point them to [http://localhost:8080/__testacular/].
* Each time a file changes the tests will be run against each browser.
