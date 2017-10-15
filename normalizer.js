var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
var js2xmlparser = require("js2xmlparser");
//var parser = require('xml2json');
var parseString = require('xml2js').parseString;

amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var qs = ['XMLQueue',
        'JSONQueue',
        'RabbitJsonQueue',
        'group7SoapResponse'];
        
        qs.forEach(function(q){
            ch.assertQueue(q, {
                durable: false
            
            });
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        })

        // Tine's XML Bank
        ch.consume(qs[0], function (msg) {
            parseString(msg.content.toString(), function (err, result) {
                var request = {
                    bankq: "TineXmlBank",
                    ssn: result.LoanResponse.ssn[0],
                    interestRate: result.LoanResponse.interestRate[0]
                };
                sendToAggregator(request,"TineXmlBank");
            });
          

        }, {
            noAck: true
        });
        //Tine's JSON Bank
        ch.consume(qs[1], function (msg) {
            var temp = JSON.parse(msg.content);
            var request = {
                bankq: "TineJsonBank",
                ssn: temp.ssn,
                interestRate: temp.interestRate
            }
            sendToAggregator(request,"TineJsonBank");
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
            sendToAggregator(request,"RabbitBank");
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
            sendToAggregator(request,"SoapBank");
        }, {
            noAck: true
        });

    });
});

function sendToAggregator(request,bankq){
    amqp.connect(rabbitmq, function (err, conn) {
        conn.createChannel(function (err, ch) {
            var q = 'group7AggregatorQueue';
            ch.assertQueue(q, {
                durable: false
            });

            ch.sendToQueue(q, Buffer.from(JSON.stringify(request)));
            console.log(" [x] Send request %s to Aggregator: %s",bankq,JSON.stringify(request));
        });
        setTimeout(function () {
            console.log("----------------")
            conn.close();
        }, 500);
    });
}