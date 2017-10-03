var amqp = require('amqplib/callback_api');

var url2 = 'amqp://student:cph@datdb.cphbusiness.dk:5672';

amqp.connect(url2, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'grp7.loanRequest';

        ch.assertQueue(q, {durable: true});
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, function (msg) {
            console.log(" [x] Received %s", msg.content.toString());
            console.log(msg.properties.replyTo);
            console.log((JSON.parse(msg.content)).loanRequest.ssn);
            var obj =
                {
                    loanResponse:
                        {
                            interestRate: 4.5939594,
                            ssn: (JSON.parse(msg.content)).loanRequest.ssn
                        }
                };
            console.log(obj.toString())

            ch.assertQueue(msg.properties.replyTo, {durable: true});
            ch.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(obj)));
            console.log("sendte reply: " + JSON.stringify(obj));

        }, {noAck: true});
    });
});