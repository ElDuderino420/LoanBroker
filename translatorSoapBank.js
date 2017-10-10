var amqp = require('amqplib/callback_api');
var creditBureau = 'http://localhost:3032/calculateInterest?wsdl'
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
var soap = require('soap');
var js2xmlparser = require("js2xmlparser");

var args = ['rich','poor']
console.log("soap");

amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var ex = 'recipientListEx';
        var q = 'group7translatorSoapBankQueue' + args[0];
        var topics = args;

        ch.assertQueue(q, {
            durable: false
        });

        topics.forEach(function(key){
            ch.bindQueue(q, ex, key);
        });        

        ch.consume(q, function(msg){
            console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());

            sendToBank(JSON.parse(msg.content));


        }, {
            noAck: true
        });

    });
});

function sendToBank(request) {
    var cpr = request.ssn;
    request.ssn = cpr.slice(0, cpr.indexOf("-"))+cpr.slice(cpr.indexOf("-")+1);
    var XML = js2xmlparser.parse("loanRequest", request);
    console.log(XML)

    soap.createClient(creditBureau, function (err, client) {
        if (err) {
            console.log(err)
        } else {
            client.calculateInterest(""+XML, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    
                    sendToNormalizer(result);

                }
            });
        }
    });
    
}

function sendToNormalizer(request) {
    amqp.connect(rabbitmq, function (err, conn) {
        conn.createChannel(function (err, ch) {
            var q = 'group7SoapResponse';
            ch.assertQueue(q, {
                durable: false
            });

            ch.sendToQueue(q, Buffer.from(request));
            console.log(request);
            console.log(" [x] Send request to Normalizer");
        });
        setTimeout(function () {
            conn.close();
        }, 500);
    });
}