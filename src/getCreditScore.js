var soap = require('soap');
var amqp = require('amqplib/callback_api');
var logm = require('./logModule.js')

var creditBureau = 'http://138.68.85.24:8080/CreditScoreService/CreditScoreService?wsdl'
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
var args = process.argv.slice(2);
var dev = false;
amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'group7GetCredit';
        
        if (args.length == 1 && args[0] == "Dev") {
            q += args[0];
            dev = true;
        }
        ch.assertQueue(q, {
            durable: true
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, function (msg) {
            console.log(" [x] Received %s", msg.content.toString());

            var request = JSON.parse(msg.content);

            getCreditScore(request.ssn, function(result){ 
                request.creditScore = result.toString();
                console.log(request);
                getBanks(request);
                
            });
            

        }, {
            noAck: true
        });

    });
});

function getCreditScore(ssn, callback) {
    soap.createClient(creditBureau, function (err, client) {
        if (err) {
            console.log(err)
        } else {
            client.creditScore({ssn: ssn}, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    
                    callback(result.return);

                }
            });
        }

    });
};

function getBanks(request) {
    amqp.connect(rabbitmq, function (err, conn) {
        conn.createChannel(function (err, ch) {
            var q = 'group7GetBanks';
            var args = process.argv.slice(2);
            if (args.length == 1 && args[0] == "Dev") {
                q += args[0];
            }
            ch.assertQueue(q, {
                durable: true
            });

            ch.sendToQueue(q, Buffer.from(JSON.stringify(request)));
            var logtemp = "[group7GetCredit] sent to ["+q+"]: "+JSON.stringify(request);
            logm.sendLog(request.ssn,logtemp, dev) 
            console.log(" [x] Send request to getBanks");
        });
        setTimeout(function () {
            conn.close();
        }, 500);
    });
}

