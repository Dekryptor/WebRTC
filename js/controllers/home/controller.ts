class HomeController {
  static $inject = ["$location"];

  public hostName: string;
  public roomName: string;

  constructor(private $location:any) {}

  ngOnInit() {
    let self = this;
    self.hostName = this.$location.absUrl();
  }

  public createRoom():void {
    this.$location.path("/" + this.roomName);
  }
}
