var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'

amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var Banks = ['TineJsonBank',
            'TinesXmlBank',
            'RabbitBank',
            'SoapBank'];
        var ResCol = [{ssn:"xxxxxx-xxxx",banRes:[]}];


        var q = 'group7AggregatorQueue';
        var q = 'getNumberOfRecipients?????';
        ch.assertQueue(q, {
            durable: false
        });

        ch.consume(q, function (msg) {
            var res = JSON.parse(msg.content);
            console.log(" [x] Received %s", msg.content.toString());

            ResCol.forEach(function(element) {
                
            }, this);

        })
    });
});