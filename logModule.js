var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'

module.exports = {
    sendLog: function (ssn, msg) {
        amqp.connect(rabbitmq, function (err, conn) {
            conn.createChannel(function (err, ch) {
                var ex = 'group7LogExchange';
                if(ssn.indexOf("-") != -1){
                ssn = ssn.slice(0, ssn.indexOf("-"))+ssn.slice(ssn.indexOf("-")+1);
                }

                /*var temp = {
                    ssn: ssn,
                    logKey: from,
                    static: " [x] from " + from + " to " + to,
                    msg: msg
                }*/

                ch.assertExchange(ex, 'topic', { durable: true });
                
                ch.publish(ex, ssn, Buffer.from(msg));
                //ch.sendToQueue(q, Buffer.from(JSON.stringify(temp)));

            });
            setTimeout(function () {
                conn.close();
            }, 500);
        });
    }
};