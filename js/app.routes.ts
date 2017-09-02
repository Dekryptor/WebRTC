class Config {
  static $inject = ["$routeProvider"];

  constructor($routeProvider: ng.route.IRouteProvider) {
    $routeProvider.when('/', {
      templateUrl: 'js/controllers/home/view.html',
      controller: 'homeController'
    }).when('/:roomName', {
      templateUrl: 'js/controllers/room/view.html',
      controller: 'roomController'
    });
  }
}
