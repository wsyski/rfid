var WebSocketServer = require('ws').Server;
var express = require('express');
var path = require('path');
var fs = require('fs');
var Rx = require('rx-lite');
var app = express();
var server = require('http').createServer();
var PORT = 7000;

app.use(express.static(path.join(__dirname, '../dist')));

var wss = new WebSocketServer({server: server});
wss.on('connection', function (ws) {
    console.log('started connection');
    ws.on('message', function incoming(data, flags) {
        // flags.binary will be set if a binary data is received.
        // flags.masked will be set if the data was masked.
        var message=JSON.parse(data);
        if (message.cmd == 'tag') {
           tagResponses(ws,0);
        }
        else {
            var args = [];
            if (message.cmd) {
                args.push(message.cmd);
            }
            if (message.id) {
                args.push(message.id);
            }
            var response = getResponse(args);
            ws.send(response, function () {});
        }
    });
    ws.on('close', function () {
        console.log('closed connection');
    });
    tagResponses(ws,1000);
});


server.on('request', app);
server.listen(PORT, function () {
    console.log('Listening on http://localhost:'+PORT);
});

function tagResponses(ws, interval) {
    var observable= getTagResponses(interval);
    var subscription = observable.subscribe(
        function (response) {
            ws.send(response, function () {});
        },
        function (ex) {
            console.error("error: ",ex);
        },
        function () {
            console.log("push sequence complete");
            subscription.dispose();
        }
    );
}
function getResponse(args) {
    while (args.length) {
        var fileName = args.join('-') + '.json';
        var filePath = path.join(__dirname, 'json', fileName);
        if (fs.existsSync(filePath)) {
            var response = fs.readFileSync(filePath, "utf8");
            console.log(fileName + ': ' + response);
            return response;
        }
        else {
            args.pop();
        }
    }
    console.error("No valid response for: " + arguments);
}

function getTagResponses(interval) {
    var values = [1, 2, 3];
    var observable = Rx.Observable.from(values).zip(
        Rx.Observable.interval(interval), function (value, index) {
            return getResponse(['tag', value]);
        });
    return observable;
}