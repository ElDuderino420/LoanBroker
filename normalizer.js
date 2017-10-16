var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var js2xmlparser = require("js2xmlparser");
var logm = require('./logModule.js')
//var parser = require('xml2json');
var parseString = require('xml2js').parseString;

amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var qs = [
            'group7XMLReply',
            'group7JSONReply',
            'group7RabbitReply',
            'group7SoapReply'];

        qs.forEach(function (q) {
            ch.assertQueue(q, {
                durable: true

            });
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        })

        // Tine's XML Bank
        ch.consume(qs[0], function (msg) {
            parseString(msg.content.toString(), function (err, result) {
                var request = {
                    bankq: "TineXMLBank",
                    ssn: result.LoanResponse.ssn[0],
                    interestRate: result.LoanResponse.interestRate[0]
                };
                var logtemp = "["+request.bankq+"] sent to [Normalizer]: "+msg.content.toString();
                logm.sendLog(request.ssn,logtemp) 
                sendToAggregator(request);
            });


        }, {
                noAck: true
            });
        //Tine's JSON Bank
        ch.consume(qs[1], function (msg) {
            var temp = JSON.parse(msg.content);
            var request = {
                bankq: "TineJSONBank",
                ssn: temp.ssn,
                interestRate: temp.interestRate
            }
            var logtemp = "["+request.bankq+"] sent to [Normalizer]: "+msg.content.toString();
            logm.sendLog(request.ssn,logtemp) 
            sendToAggregator(request);
        }, {
                noAck: true
            });
        //Rabbit Bank
        ch.consume(qs[2], function (msg) {
            //"RabbitBank"
            var temp = JSON.parse(msg.content);
            var request = {
                bankq: "RabbitBank",
                ssn: temp.loanResponse.ssn,
                interestRate: temp.loanResponse.interestRate
            }
            var logtemp = "["+request.bankq+"] sent to [Normalizer]: "+msg.content.toString();
            logm.sendLog(request.ssn,logtemp) 
            sendToAggregator(request);
        }, {
                noAck: true
            });
        //Soap Bank
        ch.consume(qs[3], function (msg) {
            var temp = JSON.parse(msg.content);
            var request = {
                bankq: "SoapBank",
                ssn: temp.loanResponse.ssn,
                interestRate: temp.loanResponse.interestRate
            }
            var logtemp = "["+request.bankq+"] sent to [Normalizer]: "+msg.content.toString();
            logm.sendLog(request.ssn,logtemp) 
            sendToAggregator(request);
        }, {
                noAck: true
            });

    });
});

function sendToAggregator(request, bankq) {
    amqp.connect(rabbitmq, function (err, conn) {
        conn.createChannel(function (err, ch) {
            var ex = 'group7Aggregator';
            ch.assertExchange(ex, 'topic' , {
                durable: true
            });

            ch.publish(ex,request.ssn,Buffer.from(JSON.stringify(request)))

            //ch.sendToQueue(q, Buffer.from(JSON.stringify(request)));
            var logtemp = "[Normalizer] to ["+q+"]: "+msg.content.toString();
            logm.sendLog(request.ssn,logtemp) 
            console.log(" [x] Send request %s to Aggregator: %s", request.bankq, JSON.stringify(request));
        });
        setTimeout(function () {
            console.log("----------------")
            conn.close();
        }, 500);
    });
}