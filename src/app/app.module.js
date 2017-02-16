'use strict';

require('../style/app.css');
var AxRfid = require('./ax-rfid');

function $(id) {
    return document.getElementById(id);
}
function removeChildNodes(id) {
    var node = $(id);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function getObjectHtml(object) {
    var divNode = document.createElement("DIV");
    var textNode = document.createTextNode(JSON.stringify(object));
    divNode.appendChild(textNode);
    return divNode;
}

function showDebugMessage(message) {
    var debugNode = $("debug");
    var liNode = document.createElement("LI");
    if (debugNode.firstElementChild) {
        debugNode.insertBefore(liNode, debugNode.firstElementChild);
    }
    else {
        debugNode.appendChild(liNode);
    }
    liNode.appendChild(getObjectHtml(message));
}

function showTags(data) {
    removeChildNodes("tags");
    var divNode=$("tags");
    divNode.appendChild(getObjectHtml(data));
}

window.addEventListener("load", function (event) {
    //var host = window.document.location.host.replace(/:.*/, '');
    var host = 'lulpreserv3';
    var port = 7000;
    var rfidClient = new AxRfid.Client({host: host, port: port, isDebug: true});
    var btnSend = $("btnSend");
    var btnConnect = $("btnConnect");
    var btnDisconnect = $("btnDisconnect");
    var btnClear = $("btnClear");
    var inputMessage = $("inputMessage");
    var debugSubscription;
    var tagStoreSubscription;

    function updateToolbar() {
        btnSend.disabled = !rfidClient.isConnected();
        btnConnect.disabled = rfidClient.isConnected();
        btnDisconnect.disabled = !rfidClient.isConnected();
    }

    btnSend.addEventListener("click", function (event) {
        var messageAsString = inputMessage.value;
        var result = rfidClient.sendMessage(JSON.parse(messageAsString));
        var subscription=result.subscribe(
            function (message) {
                subscription.dispose();
            },
            function (e) {
                // errors and "unclean" closes land here
                console.error('error: %s', e);
            },
            function () {
                // the socket has been closed
                console.info('call completed');
            }
        );
    });
    btnConnect.addEventListener("click", function (event) {
        rfidClient.connect();
        debugSubscription=rfidClient.getDebugSubject().subscribe(
            function (message) {
                showDebugMessage(message);
            },
            function (e) {
                // errors and "unclean" closes land here
                console.error('error: %s', e);
            },
            function () {
                // the socket has been closed
                console.info('socket closed');
            }
        );
        tagStoreSubscription=rfidClient.getTagStore().subscribe(function (data) {
            console.log(data);
            showTags(data);
        });
        updateToolbar();
    });
    btnDisconnect.addEventListener("click", function (event) {
        tagStoreSubscription.unsubscribe();
        debugSubscription.dispose();
        rfidClient.disconnect();
        updateToolbar();
    });
    btnClear.addEventListener("click", function (event) {
        removeChildNodes("debug");
    });
    updateToolbar();
});

