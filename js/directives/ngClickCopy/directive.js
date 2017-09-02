'use strict';

app.directive('ngClickCopy', ['ngCopy', function(ngCopy) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function(e) {
                ngCopy.CopyToClipBoard(attrs.ngClickCopy);
            });
        }
    }
}]);
