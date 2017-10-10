var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
var js2xmlparser = require("js2xmlparser");

amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var ex = 'recipientListEx';
        var q = 'group7translatorXMLBankQueue'
        var topics = "poor";

        ch.assertQueue(q, {
            durable: false
        });

        ch.bindQueue(q, ex, topics);

        ch.consume(q, function(msg){
            console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());

            sendToBank(JSON.parse(msg.content));


        }, {
            noAck: true
        });

    });
});


function sendToBank(request) {
    
    amqp.connect(rabbitmq, function (err, conn) {
        
        conn.createChannel(function (err, ch) {
            var ex = 'cphbusiness.bankXML';
    
            ch.assertExchange(ex, 'fanout', {
                durable: false
            });
            console.log(" [x] sent: %s", js2xmlparser.parse("LoanRequest", request));
            ch.publish(ex, '', Buffer.from(js2xmlparser.parse("LoanRequest", request)), {
                replyTo: 'XMLQueue'
            });
    
        });
    });
    
}