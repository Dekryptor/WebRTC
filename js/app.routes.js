'use strict';

//var lockStat = false;
app.config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'js/controllers/home/view.html',
        controller: 'homeController'
    }).when('/:roomName', {
        templateUrl: 'js/controllers/room/view.html',
        controller: 'roomController'
    });
});
