var amqp = require('amqplib/callback_api');
var js2xmlparser = require("js2xmlparser");
//var parser = require('xml2json');
var parseString = require('xml2js').parseString;


var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'

amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var xq = 'XMLQueue';
        var jq = 'JSONQueue';

        ch.assertQueue(xq, {
            durable: false
        });
        ch.assertQueue(jq, {
            durable: false
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", xq);
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", jq);
        ch.consume(xq, function (msg) {
            console.log(" [x] Received %s", msg.content.toString());
            var request = msg.content.toString();


            parseString(request, function (err, result) {
                //console.log(result);
            });
            //var request = JSON.parse(msg.content);
            //var response = parser.toJson(msg.content.toString());
            //console.log(response);
            

        }, {
            noAck: true
        });

        ch.consume(jq, function (msg) {
            console.log(" [x] Received %s", msg.content.toString());

            var request = JSON.parse(msg.content);

            
            

        }, {
            noAck: true
        });

    });
});