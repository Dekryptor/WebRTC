"use strict";

class RoomController {
  static $inject = ["$rootScope", "$scope", "$routeParams", "$location", "ngNoti"];

  constructor(private $rootScope:any, private $scope:any, private $routeParams:any, private $location:any, private ngNoti:any) {
    // grab the room from the URL
    let room = $routeParams.roomName;

    // create our webrtc connection
    let webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'localVideo',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: '',
        // immediately ask for camera access
        autoRequestMedia: true,
        debug: false,
        detectSpeakingEvents: true,
        autoAdjustMic: false
    });

    // when it's ready, join if we got a room from the URL
    webrtc.on('readyToCall', function () {
        // if already got a room, then join it
        if (room) {
            webrtc.joinRoom(room);
        }
    });

    // we got access to the camera and microphone
    webrtc.on('localStream', function (stream:any) {
        //toggle webcam on/off
        let video = stream.getVideoTracks()[0];
        $("button[name='video']").click(function () {
            video.enabled = !video.enabled;
            $("button[name='video']").toggleClass("btn-success").toggleClass("btn-danger");
            $("button[name='video'] i").toggleClass("fa-video-camera").toggleClass("fa-pause");
            $("#video i").toggleClass("fa-video-camera").toggleClass("fa-pause");
        });

        //toggle microphone on/off
        let audio = stream.getAudioTracks()[0];
        $("button[name='audio']").click(function () {
            audio.enabled = !audio.enabled;
            $("button[name='audio']").toggleClass("btn-success").toggleClass("btn-danger");
            $("button[name='audio'] i").toggleClass("fa-microphone").toggleClass("fa-microphone-slash");
            $("#audio i").toggleClass("fa-microphone").toggleClass("fa-microphone-slash");
        });
    });

    // we did not get access to the camera
    webrtc.on('localMediaError', function (err:any) {
        alert("Can't get access to camera");
    });

    // a peer video has been added
    webrtc.on('videoAdded', function (video:any, peer:any) {
        console.log('video added', peer);
        let from = typeof peer.nick != "undefined" ? peer.nick : peer.id;
        ngNoti.notification("videoAdded",from);
        let remotes = document.getElementById('remotes');
        if (remotes) {
            let container = document.createElement('div');
            container.className = 'col-sm-6';
            container.id = 'container_' + webrtc.getDomId(peer);
            container.appendChild(video);
            // suppress contextmenu
            // show the ice connection state
            if (peer && peer.pc) {
                let connstate = document.createElement('div');
                connstate.className = 'connectionstate text-center';
                container.appendChild(connstate);
                peer.pc.on('iceConnectionStateChange', function (event:any) {
                    switch (peer.pc.iceConnectionState) {
                        case 'checking':
                            connstate.innerText = 'Connecting to peer...';
                            break;
                        case 'connected':
                        case 'completed': // on caller side
                            connstate.innerText = 'Connection established.';
                            if ($scope.nick != "Input your username") {
                                webrtc.sendDirectlyToAll(room, 'nick', $scope.nick);
                            }
                            break;
                        case 'disconnected':
                            connstate.innerText = 'Disconnected.';
                            break;
                        case 'failed':
                            connstate.innerText = 'Connection failed.';
                            break;
                        case 'closed':
                            connstate.innerText = 'Connection closed.';
                            break;
                    }
                });
            }
            remotes.appendChild(container);
        }

    });
    // a peer was removed
    webrtc.on('videoRemoved', function (video:any, peer:any) {
        console.log('video removed ', peer);
        let from = typeof peer.nick != "undefined" ? peer.nick : peer.id;
        ngNoti.notification("videoRemoved",from);
        let remotes = document.getElementById('remotes');
        let el = document.getElementById(peer ? 'container_' + webrtc.getDomId(peer) : 'localScreenContainer');
        if (remotes && el) {
            remotes.removeChild(el);
        }
    });

    // local p2p/ice failure
    webrtc.on('iceFailed', function (peer:any) {
        let connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
        console.log('local fail', connstate);
        if (connstate) {
            connstate.innerText = 'Connection failed.';
            fileinput.disabled = 'disabled';
        }
    });
    // remote p2p/ice failure
    webrtc.on('connectivityError', function (peer:any) {
        let connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
        console.log('remote fail', connstate);
        if (connstate) {
            connstate.innerText = 'Connection failed.';
            fileinput.disabled = 'disabled';
        }
    });

    //Copy Link to clip board
    $scope.url = $location.$$absUrl;

    //Send chat
    $scope.sendMessage = function () {
        let id = $(".mes.active").attr("id");
        console.log();
        webrtc.sendDirectlyToAll(room, 'chat', $scope.message);
        if (id != "me") {
            $(".mes.active").removeClass("active");
            $('#conversation').append("<div id='me' class='mes me active'>" +
                "<p class='from'>Me</p>" +
                "<p class='content'></p>" +
                "</div>");
        }
        $(".mes.active .content").append($scope.message + "<br>");


        $scope.message = "";
    };

    //Set Nickname
    $scope.nick = "Input your username";
    $scope.editing = false;
    $scope.setNick = function () {
        webrtc.sendDirectlyToAll(room, 'nick', $scope.nick);
    };
    $scope.editItem = function () {
        $scope.editing = true;
         $scope.nick = "";
    };
    $scope.doneEditing = function () {
        $scope.editing = false;
        if ($scope.nick != "Input your username" && $scope.nick != "") {
            webrtc.sendDirectlyToAll(room, 'nick', $scope.nick);
        } else if ($scope.nick == "") {
            $scope.nick = "Input your username";
        }
    };

    //Receiving chat type + nick type
    webrtc.on('channelMessage', function (peer:any, label:any, data:any) {
        if (data.type === 'chat') {
            let id = peer.id;
            let activeID = $(".mes.active").attr("id");
            let from = typeof peer.nick == "undefined" ? id : peer.nick;
            if (activeID != id) {
                $(".mes.active").removeClass("active");
                $('#conversation').append("<div id='" + id + "' class='mes other active'>" +
                    "<p class='from'>" + from + "</p>" +
                    "<p class='content'>" + data.payload + "<br>" + "</p>" +
                    "</div>");
            } else {
                $(".mes.active .content").append(data.payload + "<br>");
            }

        } else if (data.type === 'nick') {
            let from = typeof peer.nick != "undefined" ? peer.nick : peer.id;
            ngNoti.notification("changeName", from, data.payload);
            peer.nick = data.payload;
        } else if (data.type === 'lockStatus') {
            if (data.payload == 'true') {
                $("button[name='lock'] i").toggleClass("fa-lock").toggleClass("fa-unlock");
            } else {
                $("button[name='lock'] i").toggleClass("fa-unlock").toggleClass("fa-lock");
            }
        }
    });

    //Leave room
    $scope.leave = function () {
        webrtc.stopLocalVideo();
        webrtc.leaveRoom();
        webrtc.disconnect();
        $location.path('/');
    };

    //filetransfer
    let peers:any = [];
    webrtc.on('createdPeer', function (peer:any) {
        console.log('createdPeer', peer);
        let remotes = document.getElementById('remotes');
        console.log(peer);
        peers.push(peer);
        console.log(peers);
        if (!remotes) return;
        if (peer && peer.pc) {
            peer.pc.on('iceConnectionStateChange', function (event:any) {
                let state = peer.pc.iceConnectionState;
                console.log('state', state);
                switch (state) {
                    case 'checking':
                        break;
                    case 'connected':
                        break;
                    case 'completed': // on caller side
                        break;
                    case 'disconnected':
                        break;
                    case 'failed':
                        break;
                    case 'closed':
                        let index = peers.indexOf(peer);
                        if (index > -1) {
                            peers.splice(index, 1);
                        }
                        console.log(peers);
                        break;
                }
            });
        }
        // receiving an incoming filetransfer
        peer.on('fileTransfer', function (metadata:any, receiver:any) {
            console.log('incoming filetransfer', metadata);
            // get notified when file is done
            receiver.on('receivedFile', function (file:any, metadata:any) {
                console.log('received file', metadata.name, metadata.size);
                $("#conversation").append("<p class='file'>You just received a file named '" + metadata.name + "'</p><a href='" + URL.createObjectURL(file) + "' download='" + metadata.name + "'>Download</a>");
                // close the channel
                receiver.channel.close();
            });
            $(".mes.active").removeClass("active");
            //filelist.appendChild(item);
        });
    });
    let fileToAll = document.getElementById("fileToAll");
    fileToAll.addEventListener('change', function () {
        let file = fileToAll.files[0];
        console.log(file);
        let i = 0;
        console.log(peers);
        for (i; i < peers.length; i++) {
            peers[i].sendFile(file);
        }
        $('#conversation').append("<p class='file'>You just send a file named '" + file.name + "'</p><a href='" + URL.createObjectURL(file) + "' download='" + file.name + "'>Download</a>");
        $(".mes.active").removeClass("active");
    });
  }
}
