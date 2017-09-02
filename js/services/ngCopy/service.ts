'use strict';

class Copy {
  public CopyToClipBoard(toCopy: string): void {
    let body = angular.element(document.body);
    let textarea = angular.element('<textarea/>');
    textarea.css({
      position: 'fixed',
      opacity: '0'
    });
    textarea.val(toCopy);
    body.append(textarea);
    textarea[0].select();
    try {
      let successful = document.execCommand('copy');
      let msg = successful ? 'successful . Link has been saved to clipboard. Send it to your friend to start group chat' : 'unsuccessful. Use manual copy + paste to send the link to your friends.';
      alert('Copying command was ' + msg);
    } catch (err) {
      alert("Copy to clipboard: Ctrl+C, Enter", toCopy);
    }
    textarea.remove();
  }
}
