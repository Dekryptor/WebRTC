'use strict';

app.service('ngCopy', [function() {
    this.CopyToClipBoard = function(toCopy) {
        var body = angular.element(document.body);
        var textarea = angular.element('<textarea/>');
        textarea.css({
            position: 'fixed',
            opacity: '0'
        });
        textarea.val(toCopy);
        body.append(textarea);
        textarea[0].select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful . Link has been saved to clipboard. Send it to your friend to start group chat' : 'unsuccessful. Use manual copy + paste to send the link to your friends.';
            alert('Copying command was ' + msg);
        } catch (err) {
            alert("Copy to clipboard: Ctrl+C, Enter", toCopy);
        }
        textarea.remove();
    }
}]);
