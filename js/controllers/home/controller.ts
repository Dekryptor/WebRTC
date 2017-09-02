class HomeController {
  static $inject = ["$scope","$location"];

  constructor(private $scope:any, private $location:any) {
    this.$scope.hostname = this.$location.absUrl();
    this.$scope.createRoom = function() {
        this.$location.path("/" + this.$scope.roomName);
    };
  }
}
