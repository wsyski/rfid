'use strict';

require('../style/app.css');
var AxRfid=require('./ax-rfid');

function $(id) {
    return document.getElementById(id);
}

function getObjectHtml(object) {
    var tableNode = document.createElement("TABLE");
    var trNode = document.createElement("TR");
    tableNode.appendChild(trNode);
    var tdNode = document.createElement("TD");
    trNode.appendChild(tdNode);
    var propertyTextNode = document.createTextNode(JSON.stringify(object));
    tdNode.appendChild(propertyTextNode);
    return tableNode;
}

function displayDebug(message) {
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

window.addEventListener("load", function (event) {
    //var host = window.document.location.host.replace(/:.*/, '');
    var host = 'lulpreserv3';
    var port = 7000;
    var rfidClient = new AxRfid.Client({host: host, port: port});
    var btnSend = $("btnSend");
    var btnConnect = $("btnConnect");
    var btnDisconnect = $("btnDisconnect");
    var btnClear = $("btnClear");
    var inputMessage = $("inputMessage");

    function updateToolbar() {
        btnSend.disabled = !rfidClient.isConnected();
        btnConnect.disabled = rfidClient.isConnected();
        btnDisconnect.disabled = !rfidClient.isConnected();
    }

    btnSend.addEventListener("click", function (event) {
        var messageAsString = inputMessage.value;
        console.log('request: %s', messageAsString);
        var result = rfidClient.sendMessage(JSON.parse(messageAsString));
        result.subscribe(
            function (message) {
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
        rfidClient.getDebugSubject().subscribe(
            function (message) {
                displayDebug(message);
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
        updateToolbar();
    });
    btnDisconnect.addEventListener("click", function (event) {
        rfidClient.disconnect();
        updateToolbar();
    });
    btnClear.addEventListener("click", function (event) {
        var messagesNode = $("messages");
        while (messagesNode.firstChild) {
            messagesNode.removeChild(messagesNode.firstChild);
        }
    });
    updateToolbar();
});

