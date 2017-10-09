class HomeController {
  static $inject = ["$scope","$location"];

  public hostName: string;
  public roomName: string;

  constructor(private $scope:any, private $location:any) {
    this.hostName = this.$location.absUrl();
  }

  public createRoom():void {
    this.$location.path("/" + this.roomName);
  }
}
