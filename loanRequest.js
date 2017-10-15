var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var amqp = require('amqplib/callback_api');

var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'

responseLog = [];

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/LoanRequest.html');
});
app.get('/getres',function(req, res){
    res.send(JSON.stringify(responseLog));
})

app.post('/loanRequest', function(req, res){
    console.log(req.body);

    //GET CREDIT SCORE
    amqp.connect(rabbitmq, function(err, conn){
        conn.createChannel(function(err, ch){
            var q = 'getCreditScoreQueue';
            var log = 'logQueue';
            ch.assertQueue(q, {durable: false});
            ch.assertQueue(log, {durable: false});

            ch.sendToQueue(q, Buffer.from(JSON.stringify(req.body)));
            ch.sendToQueue(log, Buffer.from(JSON.stringify(req.body)));
            ch.sendToQueue(log, Buffer.from(" [x] Send request to credit score"));
            //console.log(" [x] Send request to credit score");
            
        });
        setTimeout(function(){ conn.close();}, 500);
    });

    res.redirect('/');
});

amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'group7AggregatorToFrontendQueue';
        ch.assertQueue(q, {
            durable: false
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, function (msg) {
            console.log(" [x] Received %s", msg.content.toString());

            responseLog.push(JSON.parse(msg.content));
            
            

        }, {
            noAck: true
        });

    });
});

var server = app.listen(3030, function(){
    var host = 'localhost';
    var port = server.address().port;
    console.log("server running at http://%s:%s\n", host, port);
});