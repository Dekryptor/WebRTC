/// <reference path='_all.ts' />

module webrtc {
  var app = angular.module('app', ['ngRoute'])
    .config(Config)
    .service('ngNoti', Noti)
    .service('ngCopy', Copy)
    .directive('ngClickCopy', ClickCopy)
    .controller('homeController', HomeController)
    .controller('roomController', RoomController);
}
