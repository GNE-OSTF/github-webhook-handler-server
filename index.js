/**
 * Created by lenny on 20.12.16.
 */


var http = require('http');
var fs = require('fs');
var createHandler = require('github-webhook-handler');
var config = require("./default-config");
try{
    config = require("./config");
} catch(ex) {
    console.log("caught: " + ex);
    console.log("This most likely means that you do not have a real config.js file");
}

console.log("check config before we start: ");
console.log(JSON.stringify(config));


var handler = createHandler({ path: '/webhook', secret: config.secret });
var socketPath = config.socketPath;

var refToActOn = config.refToActOn;
var commandMap = config.commandMap;
var port = config.port;

var openSocket = null;


fs.open(
    socketPath,
    'a',
    function(err, fd) {
        if(err) throw err;
        openSocket = fd;
    }
);



http.createServer(
    //handle regular requests by returning 404
    function (req, res) {
        //console.log("received request:");
        //console.log(req);
        handler(
            req,
            res,
            function (err) {
                if(err) throw err;
                res.statusCode = 404;
                res.end('This is for another purpose');
                writeCommand("0\n");
            }
        );
    }
).listen(port);



handler.on(
    //handle the github push events - so we write commands to pull and redeploy the corresponding project
    'push',
    function (event) {
        var repo = event.payload.repository.name;
        var ref = event.payload.ref;
        var command = commandMap[repo];

        console.log('Received a push event for ' + repo + ' to ' + ref);

        if((ref == refToActOn) && command) {
            console.log("So we write Command: " + command);
            writeCommand(command);
        }
    }
);



function writeCommand(command) {

    if(openSocket) {
        fs.appendFile(
            openSocket,
            command,
            function(err){
                if(err) throw err;
                console.log("write has been successfull");
            });
     } else {
        console.log("The File has not been opened yet!");
    }

}

