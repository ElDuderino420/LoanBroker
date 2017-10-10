var amqp = require('amqplib/callback_api');
var js2xmlparser = require("js2xmlparser");
//var parser = require('xml2json');
var parseString = require('xml2js').parseString;


var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'

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

        ch.consume(qs[0], function (msg) {
            console.log(" [x] Received %s", msg.content.toString());
            var request = msg.content.toString();

            parseString(request, function (err, result) {

            });
          

        }, {
            noAck: true
        });

        ch.consume(qs[1], function (msg) {
            console.log(" [x] Received %s", msg.content.toString());

            var request = JSON.parse(msg.content);

        }, {
            noAck: true
        });
        ch.consume(qs[2], function (msg) {
            console.log(" [x] Received %s", msg.content.toString());

            var request = JSON.parse(msg.content);

        }, {
            noAck: true
        });
        ch.consume(qs[3], function (msg) {
            console.log(" [x] Received %s", msg.content.toString());

            var request = JSON.parse(msg.content);

        }, {
            noAck: true
        });

    });
});