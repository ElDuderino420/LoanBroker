var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
var logm = require('./logModule.js')
var ResCol = new Array();
//var checkSsn = [];
amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'group7Aggregator';
        ch.assertQueue(q, {
            durable: true
        });
        
/*        
        var ex = 'group7Aggregator';
        ch.assertExchange(ex, 'topic', {
            durable: true
        });

        ch.assertQueue('', {
            exclusive: true
        },function(err,q){
            if(!checkSsn.includes(cpr)){
                checkSsn.push(cpr);
                ch.bindQueue(q.queue,ex,cpr);
            }
            
            ch.consume(q.queue,function(msg){
                console.log(msg.content.toString());
                var res = JSON.parse(msg.content);

            var ssnRes = ResCol["key-" + res.ssn];

            var bankDupli = false;
            if (ssnRes != null) {

                ssnRes.response.forEach(function (element) {
                    if (element.bankq == res.bankq) {
                        bankDupli = true
                    }
                }, this);
                if (!bankDupli) {
                    ssnRes.response.push(res);
                }
                if (ssnRes.numBanks == ssnRes.response.length) {
                    sendToServer(ssnRes.response)
                    delete ResCol["key-" + res.ssn];
                }
            }
            console.log("Recieved: %s       ResCol.length: %s       ", msg.content.toString(), Object.keys(ResCol).length)
            console.log("Key stored: %s    ", JSON.stringify(ssnRes))
            }, {
                noAck: true
            });
        });
*/
        ch.consume(q, function (msg) {
            var res = JSON.parse(msg.content);

            var ssnRes = ResCol["key-" + res.ssn];

            var bankDupli = false;
            if (ssnRes != null) {

                ssnRes.response.forEach(function (element) {
                    if (element.bankq == res.bankq) {
                        bankDupli = true
                    }
                }, this);
                if (!bankDupli) {
                    ssnRes.response.push(res);
                }
                if (ssnRes.numBanks == ssnRes.response.length) {
                    
                    sendToServer(res.ssn,ssnRes.response)
                    
                    delete ResCol["key-" + res.ssn];
                }
            }
            console.log("Recieved: %s       ResCol.length: %s       ", msg.content.toString(), Object.keys(ResCol).length)
            console.log("Key stored: %s    ", JSON.stringify(ssnRes))



        }, {
                noAck: true
            });
    });

    
});


amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'group7AggregatorTopic';
        ch.assertQueue(q, {
            durable: true
        });
        ch.consume(q, function (msg) {
            var res = JSON.parse(msg.content);

            var tempBanks = 0;
            res.topic.forEach(function (topic) {
                if (topic == "all") {
                    tempBanks += 2;
                }
                if (topic == "poor") {
                    tempBanks += 1;
                }
                if (topic == "rich") {
                    tempBanks += 1;
                }
            })
            if (ResCol["key-" + res.ssn] == null) {
                ResCol["key-" + res.ssn] = {
                    numBanks: tempBanks,
                    response: [],
                    sent: false
                }
            }
            console.log(" [x] Received from server   topic: %s       msg: %s", res.topic, msg.content.toString());
        }, {
                noAck: true
            });

    });
});
function sendToServer(ssn,request) {
    amqp.connect(rabbitmq, function (err, conn) {
        conn.createChannel(function (err, ch) {
            var ex = 'group7AggregatorFrontend';
            stringRequest = JSON.stringify(request);
            if(ssn.indexOf("-") != -1){
            ssn = ssn.slice(0, ssn.indexOf("-"))+ssn.slice(ssn.indexOf("-")+1);
            }
            var logtemp = "[Aggregator] sent to ["+ex+"]: "+stringRequest;
            logm.sendLog(ssn,logtemp)
            ch.assertExchange(ex, 'topic', { durable: true });          
            ch.publish(ex, ssn, Buffer.from(stringRequest));
            
            //ch.sendToQueue(q, Buffer.from(stringRequest));

            
            console.log(" [x] Send to Frontend %s", stringRequest);
        });
        setTimeout(function () {
            conn.close();
        }, 500);
    });
}
