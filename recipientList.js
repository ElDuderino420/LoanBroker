var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'

amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var ex = 'recipientListEx';

        var banksQueues = {
            cphJSON: 'cphbusiness.bankJSON',
            cphXML: 'cphbusiness.bankXML',
            ourSOAP: '',
            ourRABBIT: ''
        };

        ch.assertExchange(ex, 'direct', {durable: false});

        ch.assertQueue()


        ch.assertQueue('', {exclusive: true}, function(err,q) {
            console.log(' [*] Waiting for requests to cphJSON Bank.');
            console.log(q.queue);
            ch.bindQueue(q.queue, ex, banksQueues.cphJSON);

            ch.consume(q.queue, function(msg) {
                console.log(" [JSON] %s: '%s'", msg.fields.routingKey, msg.content.toString());
              }, {noAck: true});
        });

        ch.assertQueue('', {exclusive: true}, function(err,q) {
            console.log(' [*] Waiting for requests to cphXML Bank.');
            ch.bindQueue(q.queue, ex, banksQueues.cphXML);

            ch.consume(q.queue, function(msg) {
                console.log(" [XML] %s: '%s'", msg.fields.routingKey, msg.content.toString());
              }, {noAck: true});
        });

    });
});
