var amqp = require('amqplib/callback_api');

var url2 = 'amqp://student:cph@datdb.cphbusiness.dk:5672';
var args = process.argv.slice(2);
amqp.connect(url2, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'group7RabbitBank';
        if (args.length == 1 && args[0] == "Dev") {
            q += args[0];
        }        
        ch.assertQueue(q, {
            durable: true
        });
        ch.prefetch(1);
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, function (msg) {
            console.log(" [x] Received %s", msg.content.toString());
            console.log(msg.properties.replyTo);
            console.log((JSON.parse(msg.content)).ssn);

            var creditScore = JSON.parse(msg.content).creditScore;
            var interestRate = 0;

            switch (true) {
                case (creditScore <= 100):
                    interestRate = (Math.random() * 20);
                    console.log("1");
                    break;
                case (creditScore >= 200 && creditScore < 300):
                    interestRate = (Math.random() * 16);
                    console.log("2");
                    break;
                case (creditScore >= 300 && creditScore < 400):
                    interestRate = (Math.random() * 12);
                    console.log("3");
                    break;
                case (creditScore >= 400 && creditScore < 500):
                    interestRate = (Math.random() * 8);
                    console.log("4");
                    break;
                case (creditScore >= 500 && creditScore < 600):
                    interestRate = (Math.random() * 4);
                    console.log("5");
                    break;
                case (creditScore >= 600 && creditScore < 700):
                    interestRate = (Math.random());
                    console.log("6");
                    break;
                case (creditScore >= 700 && creditScore < 800):
                    interestRate = (Math.random() / 4);
                    console.log("7");
                    break;
                case (creditScore === 800):
                    interestRate = (Math.random() / 8);
                    console.log("8");
                    break;
            }
            var obj = {
                loanResponse: {
                    interestRate: interestRate,
                    ssn: (JSON.parse(msg.content)).ssn
                }
            };
            console.log(obj.toString())
            console.log(msg.properties.replyTo)
            ch.assertQueue(msg.properties.replyTo, {
                durable: true
            });
            ch.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(obj)));
            console.log("sendte reply: " + JSON.stringify(obj));


        }, {
            noAck: true
        });
    });
});