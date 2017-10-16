var amqp = require('amqplib/callback_api');
var soapBank = 'http://localhost:3032/calculateInterest?wsdl'
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
var soap = require('soap');
var js2xmlparser = require("js2xmlparser");
var logm = require('./logModule.js')
var args = process.argv.slice(2);
console.log(args)
console.log("soap");

amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var ex = 'group7RecipientList';
        var q = 'group7TranslatorSoapBank';
        var topics = args;

        ch.assertQueue(q, {
            durable: true
        });

        topics.forEach(function(key){
            ch.bindQueue(q, ex, key);
        });        

        ch.consume(q, function(msg){
            console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
            var request = JSON.parse(msg.content)
            sendToBank(request);
            var logtemp = "["+ex+"] to ["+q+"]: "+msg.content.toString();
            logm.sendLog(request.ssn,logtemp) 

        }, {
            noAck: true
        });

    });
});

function sendToBank(request) {
    var cpr = request.ssn;
    request.ssn = cpr.slice(0, cpr.indexOf("-"))+cpr.slice(cpr.indexOf("-")+1);
    soap.createClient(soapBank, function (err, client) {
        if (err) {
            console.log(err)
        } else {
            client.calculateInterest(request, function (err, result) {
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
            var q = 'group7SoapReply';
            ch.assertQueue(q, {
                durable: true
            });

            ch.sendToQueue(q, Buffer.from(JSON.stringify(request)));
            console.log(request);
            console.log(" [x] Send request to Normalizer");
        });
        setTimeout(function () {
            conn.close();
        }, 500);
    });
}