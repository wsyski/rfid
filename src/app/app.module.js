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
    var btnCommand = $("btnCommand");
    var btnConnect = $("btnConnect");
    var btnDisconnect = $("btnDisconnect");
    var btnClear = $("btnClear");
    var btnEnable = $("btnEnable");
    var inputMessage = $("inputMessage");
    var debugSubscription;
    var tagStoreSubscription;

    function updateToolbar() {
        btnCommand.disabled = !rfidClient.isConnected();
        btnConnect.disabled = rfidClient.isConnected();
        btnDisconnect.disabled = !rfidClient.isConnected();
        btnEnable.disabled = !rfidClient.isConnected();
    }

    btnCommand.addEventListener("click", function (event) {
        var messageAsString = inputMessage.value;
        var result = rfidClient.command(JSON.parse(messageAsString));
        var subscription=result.subscribe(
            function (message) {

            },
            function (e) {
                console.error('error: %s', e);
            },
            function () {
                subscription.dispose();
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
                tagStoreSubscription.unsubscribe();
                debugSubscription.dispose();
                console.info('Disconnected from debug subject');
            }
        );
        tagStoreSubscription=rfidClient.getTagStore().subscribe(function (data) {
            console.log(data);
            showTags(data);
        });
        updateToolbar();
    });
    btnDisconnect.addEventListener("click", function (event) {
        rfidClient.disconnect();
        updateToolbar();
    });
    btnClear.addEventListener("click", function (event) {
        removeChildNodes("debug");
    });
    btnEnable.addEventListener("click", function (event) {
        rfidClient.enable();
    });
    updateToolbar();
});

