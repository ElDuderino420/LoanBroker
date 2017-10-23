var amqp = require('amqplib/callback_api');

var url2 = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
amqp.connect(url2, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'grp7.loanRequest';
        var obj =
            {
                loanRequest:
                    {
                        ssn: "12345678",
                        creditScore: 856,
                        loanAmount: 1000.0,
                        loanDuration: "1973-01-01 01:00:00.0 CET"
                    }
            };

        var msg = JSON.stringify(obj);
        console.log("sender: " + msg)
        ch.assertQueue(q, {durable: true});
        // Note: on Node 6 Buffer.from(msg) should be used
        ch.sendToQueue(q, new Buffer(msg),
            {
                replyTo: 'tttezzt'
            });
        console.log(" [x] Sent %s", msg);
        ch.assertQueue("tttezzt", {durable: true}, function (err, q) {
            ch.consume(q.queue, function (msg) {
                    console.log("modtager...");
                    console.log(msg.content.toString());
                },
                {
                    noAck: true
                });
        });
    });
    setTimeout(function () {
        conn.close();
        process.exit(0)
    }, 500);
});
