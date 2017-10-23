var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var amqp = require('amqplib/callback_api');
var logm = require('./logModule.js');

var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'

//var checkSsn = [];
//var checkSsn2 = [];
//var logfile = new Array();
//var latest = {};

var loanLogs = {};
var loanResponses = {};
var logQueue;


var app = express();
app.set('views', './views');
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.get('/', function (req, res) {
    res.render('index', {
        title: 'LoanRequest',
        message: 'Loan Request'
    });
    //res.sendFile(__dirname + '/LoanRequest.html');
});
/* app.get('/getres', function (req, res) {

    res.send(JSON.stringify(latest));
}); */

app.post('/loanRequest', function (req, res) {

    var cpr = req.body.ssn;
    if (cpr != null && cpr.indexOf("-") != -1) {
        cpr = cpr.slice(0, cpr.indexOf("-")) + cpr.slice(cpr.indexOf("-") + 1);
    }
    if (loanLogs[cpr] != null) {
        res.render('response', {
            title: 'LoanRequest',
            message: 'Please wait for your responce!',
            ssn: cpr,
            log: loanLogs[cpr],
            response: loanResponses[cpr]
        });
    } else if (cpr == null || req.body.loanAmount.length == 0 || req.body.loanDuration.length == 0 || parseFloat(cpr).toString().length != 10) {
        res.render('index', {
            title: 'LoanRequest',
            message: 'Please input valid arguments!'
        });
    } else {

        console.log(cpr)

        console.log(req.body);

        //GET CREDIT SCORE
        amqp.connect(rabbitmq, function (err, conn) {
            conn.createChannel(function (err, ch) {
                var q = 'group7GetCredit';
                var ex = 'group7LogExchange';
                var ex2 = 'group7AggregatorFrontend'
                var args = process.argv.slice(2);
                if (args.length == 1 && args[0] == "Dev") {
                    q += args[0];
                    ex += args[0]
                    ex2 += args[0]
                }

                //Get Credit Score Queue
                ch.assertQueue(q, {
                    durable: true
                });

                //Log Exchange
                ch.assertExchange(ex, 'topic', {
                    durable: true
                });

                //Consume LOG
                ch.assertQueue('', {
                    durable: true
                }, function (err, q) {
                    //if (!checkSsn.includes(cpr)) {
                    //checkSsn.push(cpr);
                    logQueue = q.queue;
                    console.log("ex: " + q.queue);
                    ch.bindQueue(q.queue, ex, cpr);
                    //}

                    /*logfile[cpr] = {
                        response: [],
                        log:[]
                    }*/
                    ch.consume(q.queue, function (msg) {
                        //response.log.push(msg.content.toString())
                        //console.log(msg.content.toString());
                        loanLogs[cpr] += msg.content + "\n";
                        //console.log(loanLogs[cpr]);
                        //document.getElementById('getres').innerHTML += msg + "\n"
                    }, {
                        noAck: true
                    });
                });

                //console.log(JSON.stringify(log["key-" + cpr]))
                //console.log(log)
                //Send to credit score
                ch.sendToQueue(q, Buffer.from(JSON.stringify(req.body)));

                //Send LOG
                loanLogs[cpr] = 'Request Sent! \n';
                loanLogs[cpr] += "[loanRequest] sent to [" + q + "]: " + JSON.stringify(req.body) + "\n";
                //logm.sendLog(cpr, logtemp)

                //Aggragator
                ch.assertExchange(ex2, 'topic', {
                    durable: true
                });

                ch.assertQueue('', {
                    exclusive: true
                }, function (err, q) {
                    //if (!checkSsn2.includes(cpr)) {
                    //    checkSsn2.push(cpr);
                    console.log("ex2: " + q.queue);
                    ch.bindQueue(q.queue, ex2, cpr);
                    
                    //}

                    ch.consume(q.queue, function (msg) {
                        //response.response = JSON.parse(msg.content)
                        console.log(msg.content.toString());
                        //latest = response;
                        loanResponses[cpr] = msg.content.toString();
                        console.log("logq: " + logQueue);
                        
                        
                        //res.send(JSON.stringify(response))
                        //document.getElementById('getres').innerHTML += msg + "\n"
                    }, {
                        noAck: true
                    });
                });

                res.render('response', {
                    title: 'LoanRequest',
                    message: 'LoanRequest',
                    ssn: cpr,
                    log: loanLogs[cpr],
                    response: loanResponses[cpr]
                });
                setTimeout(function () {
                    ch.unbindQueue(logQueue, ex, cpr);
                    loanLogs[cpr] = null;
                    loanResponses[cpr] = null;
                    conn.close();
                    logQueue = "";
                    
                }, 10000);
                //ch.sendToQueue(log, Buffer.from(JSON.stringify(req.body)));
                //ch.sendToQueue(log, Buffer.from(" [x] Send request to credit score"));
            });
            
        });
    }
});

app.get('/update/:ssn', function (req, res) {
    var ssn = req.params.ssn;
    
    var update = {
        log: loanLogs[ssn],
        resp: loanResponses[ssn]
    }
    if(update.resp){
        //loanLogs[cpr] = null;
        //loanResponses[cpr] = null;
    }
    
    res.send(update);
});

var server = app.listen(3030, function () {
    var host = 'localhost';
    var port = server.address().port;
    console.log("server running at http://%s:%s\n", host, port);
});