'use strict';

interface evt {
  message: string,
  color: string
}

class Noti {
  public notification(event: any, peer1: any, peer2: any): void {
    let videoAdded:evt = {
      'message': peer1 + ' has joined the room',
      'color': 'green'
    };

    let videoRemoved:evt = {
      'message': peer1 + " has left the room",
      'color': "red"
    }

    let changeName:evt = {
      'message': peer1 + " changes their name to " + peer2,
      'color': "blue"
    }

    let trigger:any = {
      "videoAdded": videoAdded,
      "videoRemoved": videoRemoved,
      "changeName": changeName
    };

    var noti = $("<div class='noti " + trigger[event].color + "'>" + trigger[event].message + "</div>");
    $("#notification").append(noti);
    let timeout:number = 250;
    noti.fadeIn("fast");
    setTimeout(function() {
      noti.fadeOut("fast");
    }, timeout);
  }
}
