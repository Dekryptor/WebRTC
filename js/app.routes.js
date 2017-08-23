'use strict';

//var lockStat = false;
lamkRTC.config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'js/components/home/view.html',
        controller: 'homeController'
    }).when('/:roomName', {
        templateUrl: 'js/components/room/view.html',
        controller: 'roomController'
    });
});
