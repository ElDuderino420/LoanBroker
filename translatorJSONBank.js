var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'

amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var ex = 'recipientListEx';
        var q = 'group7translatorJSONBankQueue'
        var topics = "all";

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
            var ex = 'cphbusiness.bankJSON';
    
            ch.assertExchange(ex, 'fanout', {
                durable: false
            });
            
            ch.publish(ex, '', Buffer.from(JSON.stringify(request)), {
                replyTo: 'JSONQueue'
            });
    
        });
    });
    
}