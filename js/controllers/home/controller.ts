class HomeController {
  static $inject = ["$scope","$location"];

  constructor(private $scope:any, private $location:any) {
    $scope.hostname = $location.absUrl();
    $scope.createRoom = function() {
        $location.path("/" + $scope.roomName);
    };
  }
}
