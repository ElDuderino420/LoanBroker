var soap = require('soap');
var amqp = require('amqplib/callback_api');

var url = 'http://138.68.85.24:8080/CreditScoreService/CreditScoreService?wsdl'
var url2 = 'amqp://student:cph@datdb.cphbusiness.dk:5672'



amqp.connect(url2, function (err, conn) {
    conn.createChannel(function (err, ch) {
        //var ex = 'cphbusiness.bankXML';
        var ex = 'cphbusiness.bankJSON';

        ch.assertQueue('tttezzt', {
            durable: true
        }, function (err, q) {

            //ch.bindQueue(q.queue, ex, '');
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);

            ch.consume(q.queue, function (msg) {
                console.log(" [x] %s", msg.content.toString());


            }, {
                noAck: true
            });
        });


    });
});



