'use strict';
var Copy = (function () {
    function Copy() {
    }
    Copy.prototype.CopyToClipBoard = function (toCopy) {
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
        }
        catch (err) {
            alert("Copy to clipboard: Ctrl+C, Enter", toCopy);
        }
        textarea.remove();
    };
    return Copy;
}());
var Noti = (function () {
    function Noti() {
    }
    Noti.prototype.notification = function (event, peer1, peer2) {
        var videoAdded = {
            'message': peer1 + ' has joined the room',
            'color': 'green'
        };
        var videoRemoved = {
            'message': peer1 + " has left the room",
            'color': "red"
        };
        var changeName = {
            'message': peer1 + " changes their name to " + peer2,
            'color': "blue"
        };
        var trigger = {
            "videoAdded": videoAdded,
            "videoRemoved": videoRemoved,
            "changeName": changeName
        };
        var noti = $("<div class='noti " + trigger[event].color + "'>" + trigger[event].message + "</div>");
        $("#notification").append(noti);
        var timeout = 250;
        noti.fadeIn("fast");
        setTimeout(function () {
            noti.fadeOut("fast");
        }, timeout);
    };
    return Noti;
}());
var ClickCopy = (function () {
    function ClickCopy(ngCopy) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', function (e) {
                    ngCopy.CopyToClipBoard(attrs.ngClickCopy);
                });
            }
        };
    }
    ClickCopy.$inject = ["ngCopy"];
    return ClickCopy;
}());
var HomeController = (function () {
    function HomeController($scope, $location) {
        this.$scope = $scope;
        this.$location = $location;
        $scope.hostname = $location.absUrl();
        $scope.createRoom = function () {
            $location.path("/" + $scope.roomName);
        };
    }
    HomeController.$inject = ["$scope", "$location"];
    return HomeController;
}());
var RoomController = (function () {
    function RoomController($rootScope, $scope, $routeParams, $location, ngNoti) {
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$routeParams = $routeParams;
        this.$location = $location;
        this.ngNoti = ngNoti;
        var room = $routeParams.roomName;
        var webrtc = new SimpleWebRTC({
            localVideoEl: 'localVideo',
            remoteVideosEl: '',
            autoRequestMedia: true,
            debug: false,
            detectSpeakingEvents: true,
            autoAdjustMic: false
        });
        webrtc.on('readyToCall', function () {
            if (room) {
                webrtc.joinRoom(room);
            }
        });
        webrtc.on('localStream', function (stream) {
            var video = stream.getVideoTracks()[0];
            $("button[name='video']").click(function () {
                video.enabled = !video.enabled;
                $("button[name='video']").toggleClass("btn-success").toggleClass("btn-danger");
                $("button[name='video'] i").toggleClass("fa-video-camera").toggleClass("fa-pause");
                $("#video i").toggleClass("fa-video-camera").toggleClass("fa-pause");
            });
            var audio = stream.getAudioTracks()[0];
            $("button[name='audio']").click(function () {
                audio.enabled = !audio.enabled;
                $("button[name='audio']").toggleClass("btn-success").toggleClass("btn-danger");
                $("button[name='audio'] i").toggleClass("fa-microphone").toggleClass("fa-microphone-slash");
                $("#audio i").toggleClass("fa-microphone").toggleClass("fa-microphone-slash");
            });
        });
        webrtc.on('localMediaError', function (err) {
            alert("Can't get access to camera");
        });
        webrtc.on('videoAdded', function (video, peer) {
            console.log('video added', peer);
            var from = typeof peer.nick != "undefined" ? peer.nick : peer.id;
            ngNoti.notification("videoAdded", from);
            var remotes = document.getElementById('remotes');
            if (remotes) {
                var container = document.createElement('div');
                container.className = 'col-sm-6';
                container.id = 'container_' + webrtc.getDomId(peer);
                container.appendChild(video);
                if (peer && peer.pc) {
                    var connstate_1 = document.createElement('div');
                    connstate_1.className = 'connectionstate text-center';
                    container.appendChild(connstate_1);
                    peer.pc.on('iceConnectionStateChange', function (event) {
                        switch (peer.pc.iceConnectionState) {
                            case 'checking':
                                connstate_1.innerText = 'Connecting to peer...';
                                break;
                            case 'connected':
                            case 'completed':
                                connstate_1.innerText = 'Connection established.';
                                if ($scope.nick != "Input your username") {
                                    webrtc.sendDirectlyToAll(room, 'nick', $scope.nick);
                                }
                                break;
                            case 'disconnected':
                                connstate_1.innerText = 'Disconnected.';
                                break;
                            case 'failed':
                                connstate_1.innerText = 'Connection failed.';
                                break;
                            case 'closed':
                                connstate_1.innerText = 'Connection closed.';
                                break;
                        }
                    });
                }
                remotes.appendChild(container);
            }
        });
        webrtc.on('videoRemoved', function (video, peer) {
            console.log('video removed ', peer);
            var from = typeof peer.nick != "undefined" ? peer.nick : peer.id;
            ngNoti.notification("videoRemoved", from);
            var remotes = document.getElementById('remotes');
            var el = document.getElementById(peer ? 'container_' + webrtc.getDomId(peer) : 'localScreenContainer');
            if (remotes && el) {
                remotes.removeChild(el);
            }
        });
        webrtc.on('iceFailed', function (peer) {
            var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
            console.log('local fail', connstate);
            if (connstate) {
                connstate.innerText = 'Connection failed.';
                fileinput.disabled = 'disabled';
            }
        });
        webrtc.on('connectivityError', function (peer) {
            var connstate = document.querySelector('#container_' + webrtc.getDomId(peer) + ' .connectionstate');
            console.log('remote fail', connstate);
            if (connstate) {
                connstate.innerText = 'Connection failed.';
                fileinput.disabled = 'disabled';
            }
        });
        $scope.url = $location.$$absUrl;
        $scope.sendMessage = function () {
            var id = $(".mes.active").attr("id");
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
            }
            else if ($scope.nick == "") {
                $scope.nick = "Input your username";
            }
        };
        webrtc.on('channelMessage', function (peer, label, data) {
            if (data.type === 'chat') {
                var id = peer.id;
                var activeID = $(".mes.active").attr("id");
                var from = typeof peer.nick == "undefined" ? id : peer.nick;
                if (activeID != id) {
                    $(".mes.active").removeClass("active");
                    $('#conversation').append("<div id='" + id + "' class='mes other active'>" +
                        "<p class='from'>" + from + "</p>" +
                        "<p class='content'>" + data.payload + "<br>" + "</p>" +
                        "</div>");
                }
                else {
                    $(".mes.active .content").append(data.payload + "<br>");
                }
            }
            else if (data.type === 'nick') {
                var from = typeof peer.nick != "undefined" ? peer.nick : peer.id;
                ngNoti.notification("changeName", from, data.payload);
                peer.nick = data.payload;
            }
            else if (data.type === 'lockStatus') {
                if (data.payload == 'true') {
                    $("button[name='lock'] i").toggleClass("fa-lock").toggleClass("fa-unlock");
                }
                else {
                    $("button[name='lock'] i").toggleClass("fa-unlock").toggleClass("fa-lock");
                }
            }
        });
        $scope.leave = function () {
            webrtc.stopLocalVideo();
            webrtc.leaveRoom();
            webrtc.disconnect();
            $location.path('/');
        };
        var peers = [];
        webrtc.on('createdPeer', function (peer) {
            console.log('createdPeer', peer);
            var remotes = document.getElementById('remotes');
            console.log(peer);
            peers.push(peer);
            console.log(peers);
            if (!remotes)
                return;
            if (peer && peer.pc) {
                peer.pc.on('iceConnectionStateChange', function (event) {
                    var state = peer.pc.iceConnectionState;
                    console.log('state', state);
                    switch (state) {
                        case 'checking':
                            break;
                        case 'connected':
                            break;
                        case 'completed':
                            break;
                        case 'disconnected':
                            break;
                        case 'failed':
                            break;
                        case 'closed':
                            var index = peers.indexOf(peer);
                            if (index > -1) {
                                peers.splice(index, 1);
                            }
                            console.log(peers);
                            break;
                    }
                });
            }
            peer.on('fileTransfer', function (metadata, receiver) {
                console.log('incoming filetransfer', metadata);
                receiver.on('receivedFile', function (file, metadata) {
                    console.log('received file', metadata.name, metadata.size);
                    $("#conversation").append("<p class='file'>You just received a file named '" + metadata.name + "'</p><a href='" + URL.createObjectURL(file) + "' download='" + metadata.name + "'>Download</a>");
                    receiver.channel.close();
                });
                $(".mes.active").removeClass("active");
            });
        });
        var fileToAll = document.getElementById("fileToAll");
        fileToAll.addEventListener('change', function () {
            var file = fileToAll.files[0];
            console.log(file);
            var i = 0;
            console.log(peers);
            for (i; i < peers.length; i++) {
                peers[i].sendFile(file);
            }
            $('#conversation').append("<p class='file'>You just send a file named '" + file.name + "'</p><a href='" + URL.createObjectURL(file) + "' download='" + file.name + "'>Download</a>");
            $(".mes.active").removeClass("active");
        });
    }
    RoomController.$inject = ["$rootScope", "$scope", "$routeParams", "$location", "ngNoti"];
    return RoomController;
}());
var Config = (function () {
    function Config($routeProvider) {
        $routeProvider.when('/', {
            templateUrl: 'js/controllers/home/view.html',
            controller: 'homeController'
        }).when('/:roomName', {
            templateUrl: 'js/controllers/room/view.html',
            controller: 'roomController'
        });
    }
    Config.$inject = ["$routeProvider"];
    return Config;
}());
var webrtc;
(function (webrtc) {
    var app = angular.module('app', ['ngRoute'])
        .config(Config)
        .service('ngNoti', Noti)
        .service('ngCopy', Copy)
        .directive('ngClickCopy', ClickCopy)
        .controller('homeController', HomeController)
        .controller('roomController', RoomController);
})(webrtc || (webrtc = {}));
//# sourceMappingURL=app.js.map