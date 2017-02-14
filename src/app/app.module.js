'use strict';

require('../style/app.css');
var AxRfid=require('./rfid');

function $(id) {
    return document.getElementById(id);
}

function displayMessage(message, header) {
    var messagesNode = $("messages");
    var liNode = document.createElement("LI");
    if (messagesNode.firstElementChild) {
        messagesNode.insertBefore(liNode, messagesNode.firstElementChild);
    }
    else {
        messagesNode.appendChild(liNode);
    }
    var tableNode = document.createElement("TABLE");
    liNode.appendChild(tableNode);
    var thNode = document.createElement("TH");
    tableNode.appendChild(thNode);
    var headerTextNode = document.createTextNode(header);
    thNode.appendChild(headerTextNode);
    for (var key in message) {
        if (message.hasOwnProperty(key)) {
            var trNode = document.createElement("TR");
            tableNode.appendChild(trNode);
            var tdNode = document.createElement("TD");
            trNode.appendChild(tdNode);
            var keyTextNode = document.createTextNode(key);
            tdNode.appendChild(keyTextNode);
            tdNode = document.createElement("TD");
            trNode.appendChild(tdNode);
            var valueTextNode = document.createTextNode(message[key]);
            tdNode.appendChild(valueTextNode);
        }
    }
}

window.addEventListener("load", function (event) {
    var host = window.document.location.host.replace(/:.*/, '');
    //var host = 'lulpreserv3';
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
        var message = inputMessage.value;
        console.log('request: %s', message);
        displayMessage(JSON.parse(message), 'Request');
        var result = rfidClient.sendMessage(message);
        result.subscribe(
            function (message) {
                displayMessage(message, 'Response');
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
        rfidClient.getTagReport().subscribe(
            function (message) {
                displayMessage(message, 'Response');
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

