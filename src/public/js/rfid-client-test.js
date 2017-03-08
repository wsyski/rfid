'use strict';


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

var debugSubscription;
var tagStoreSubscription;
window.addEventListener("unload", function (event) {
    debugSubscription.dispose();
    tagStoreSubscription.unsubscribe();
});
window.addEventListener("load", function (event) {
    //var host = window.document.location.host.replace(/:.*/, '');
    var host = 'lulpreserv3';
    var port = 7000;
    var btnCommand = $("btnCommand");
    var btnConnect = $("btnConnect");
    var btnDisconnect = $("btnDisconnect");
    var btnClear = $("btnClear");
    var btnReload = $("btnReload");
    var btnCheckout = $("btnCheckout");
    var btnCheckin = $("btnCheckin");
    var inputMessage = $("inputMessage");
    var tagStoreData;
    var axRfidClient = new AxRfid.Client({isDebug: true, debugLogger: console.debug.bind(console), errorLogger: console.error.bind(console)});

    function errorHandler(e) {
        var message;
        if (e.message) {
            message=e.message;
        }
        else {
            if (e.target instanceof WebSocket) {
                message = "Websocket error";
            }
            else {
                message = "RFID Client error";
            }
        }
        alert(message);
    }
    axRfidClient.setErrorHandler(errorHandler);
    debugSubscription = axRfidClient.getDebugSubject().subscribe(
        function (message) {
            showDebugMessage(message);
        },
        function (e) {
            console.error(e);
        },
        function () {
        }
    );
    tagStoreSubscription = axRfidClient.getTagStore().subscribe(function (data) {
        tagStoreData = data;
        showTagStoreData();
        updateToolbar();
    });


    function showTagStoreData() {
        removeChildNodes("tagStore");
        var divNode = $("tagStore");
        divNode.appendChild(getObjectHtml(tagStoreData));
    }

    function setCheckoutState(isCheckoutState) {
        var tags = tagStoreData.tags;
        tags.forEach(function (tag, index) {
            if (tag.isComplete) {
                var result = axRfidClient.setCheckoutState(tag.id, isCheckoutState);
                var subscription = result.subscribe(
                    function (message) {
                    },
                    function (e) {
                        errorHandler(e);
                    },
                    function () {
                        subscription.dispose();
                    }
                );
            }
        });
    }

    function updateToolbar() {
        var isConnected = tagStoreData.isConnected;
        btnCommand.disabled = !isConnected;
        btnConnect.disabled = isConnected;
        btnDisconnect.disabled = !isConnected;
        btnReload.disabled = !isConnected;
        btnCheckout.disabled = !isConnected;
        btnCheckin.disabled = !isConnected;
    }

    btnCommand.addEventListener("click", function (event) {
        var messageAsString = inputMessage.value;
        var result = axRfidClient.sendMessage(JSON.parse(messageAsString));
        var subscription = result.subscribe(
            function (message) {
            },
            function (e) {
                errorHandler(e);
            },
            function () {
                subscription.dispose();
            }
        );

    });
    btnConnect.addEventListener("click", function (event) {
        axRfidClient.connect(navigator.userAgent,host,port);
    });

    btnDisconnect.addEventListener("click", function (event) {
        axRfidClient.disconnect();
    });
    btnClear.addEventListener("click", function (event) {
        removeChildNodes("debug");
    });
    btnReload.addEventListener("click", function (event) {
        axRfidClient.reload();
    });
    btnCheckout.addEventListener("click", function (event) {
        setCheckoutState(true);
    });
    btnCheckin.addEventListener("click", function (event) {
        setCheckoutState(false);
    });
});

