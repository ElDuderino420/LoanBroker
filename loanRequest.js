var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var amqp = require('amqplib/callback_api');
var logm = require('./logModule.js');

var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'

var log = new Array();

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/LoanRequest.html');
});
app.get('/getres/:ssn', function (req, res) {
    var cpr = req.params.ssn;
    if (cpr.indexOf("-") != -1) {
        cpr = cpr.slice(0, cpr.indexOf("-")) + cpr.slice(cpr.indexOf("-") + 1);
    }
    res.send(JSON.stringify(log["key-" + cpr]));
})

app.post('/loanRequest', function (req, res) {
    console.log(req.body);

    //GET CREDIT SCORE
    amqp.connect(rabbitmq, function (err, conn) {
        conn.createChannel(function (err, ch) {
            var q = 'group7GetCredit';


            ch.assertQueue(q, { durable: false });

            var cpr = req.body.ssn;
            cpr = cpr.slice(0, cpr.indexOf("-")) + cpr.slice(cpr.indexOf("-") + 1);
            console.log(cpr)

            /*if (log["key-" + cpr] == null) {
                log["key-" + cpr] = {
                    response: {},
                    log: {
                        bodyLog: {
                            static: " [x] from frontend to CreditScore",
                            msg: req.body
                        }
                    }
                }
            }*/
            var logtemp = "[loanRequest] sent to [" + q + "]: " + JSON.stringify(req.body);
            logm.sendLog(request.ssn, logtemp)

            console.log(JSON.stringify(log["key-" + cpr]))
            console.log(log)
            ch.sendToQueue(q, Buffer.from(JSON.stringify(req.body)));
            //ch.sendToQueue(log, Buffer.from(JSON.stringify(req.body)));
            //ch.sendToQueue(log, Buffer.from(" [x] Send request to credit score"));


        });
        setTimeout(function () { conn.close(); }, 500);
    });

    res.redirect('/');
    amqp.connect(rabbitmq, function (err, conn) {
        conn.createChannel(function (err, ch) {
            var ex = 'group7LogExchange';
            ch.assertExchange(ex, 'topic', {
                durable: false
            });

            var cpr = req.body.ssn;
            cpr = cpr.slice(0, cpr.indexOf("-")) + cpr.slice(cpr.indexOf("-") + 1);

            ch.assertQueue('', {
                exclusive: true
            },function(err,q){
                ch.bindQueue(q.queue,ex,cpr);
                ch.consume(q.queue,function(msg){
                    document.getElementById('getres').innerHTML += msg + "\n"
                })
            });

            

        });
    });
});
/*
amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'group7AggregatorToFrontendQueue';
        var q2 = 'group7LogQueue';

        ch.assertQueue(q, {
            durable: false
        });
        ch.assertQueue(q2, {
            durable: false
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, function (msg) {
            var res = JSON.parse(msg.content);
            console.log(" [x] Received %s", msg.content.toString());
            if (log["key-" + res[0].ssn] != null) {
                log["key-" + res[0].ssn].response = res;
            }
        }, {
                noAck: true
            });

        ch.consume(q2, function (msg) {
            /* example log
            {ssn:xxxxxx-xxxx,
             logKey:getBanksLog,
             static: from xxxx to yyyy
             msg:"whatevs"}*/
/*
            var res = JSON.parse(msg.content);
            console.log(JSON.stringify(res))
            if (res.ssn.indexOf("-") != -1) {
                var cpr = res.ssn;
                res.ssn = cpr.slice(0, cpr.indexOf("-")) + cpr.slice(cpr.indexOf("-") + 1);
            }
            if (log["key-" + res.ssn] != null) {
                if (res.logKey != null && res.static != null && res.msg != null) {
                    log["key-" + res.ssn].log[res.logKey] = {
                        static: res.static,
                        msg: res.msg
                    }
                }
                log["key-" + res.ssn].response = res;
            }
        }, {
                noAck: true
            });

    });
});*/

var server = app.listen(3030, function () {
    var host = 'localhost';
    var port = server.address().port;
    console.log("server running at http://%s:%s\n", host, port);
});