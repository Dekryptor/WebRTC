'use strict';

class ClickCopy {
  static $inject = ["ngCopy"];

  constructor(ngCopy: any) {
    return {
      restrict: 'A',
      link: function(scope: any, element: any, attrs: any) {
        element.bind('click', function(e: any) {
          ngCopy.CopyToClipBoard(attrs.ngClickCopy);
        });
      }
    }
  }
}
