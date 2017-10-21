var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
var logm = require('./logModule.js')
var ResCol = new Array();
var sent = "";
var args = process.argv.slice(2);
var dev = false;
amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'group7Aggregator';
        if (args.length == 1 && args[0] == "Dev") {
            q += args[0];
            dev = true;
        }  
        ch.assertQueue(q, {
            durable: true
        });
        
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
                    sent = res.ssn;
                    
                    //ch.sendToQueue(q, Buffer.from(stringRequest));
        
                    
                    //console.log(" [x] Send to Frontend %s", stringRequest);
                    
                    delete ResCol["key-" + res.ssn];
                }
            }
            console.log("Recieved: %s       ResCol.length: %s       ", msg.content.toString(), Object.keys(ResCol).length)
            console.log("Key stored: %s    ", JSON.stringify(ssnRes))
            setTimeout(function () {
                if(sent != res.ssn){
                    console.log("bank not responding");
                    sendToServer(res.ssn, ssnRes.response)
                    sent = res.ssn;
                }
            }, 3000);


        }, {
                noAck: true
            });
            
    });

    
});


amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'group7AggregatorTopic';
        if (args.length == 1 && args[0] == "Dev") {
            q += args[0];
        }  
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
            if (args.length == 1 && args[0] == "Dev") {
                ex += args[0];

            }  
            var min = 10000;
            var final;
            request.forEach(function(r){
                if(r.interestRate < min){
                    min = r.interestRate;
                    final = r;
                }
            });

            var stringRequest = JSON.stringify(final);
            if(ssn.indexOf("-") != -1){
            ssn = ssn.slice(0, ssn.indexOf("-"))+ssn.slice(ssn.indexOf("-")+1);
            }
            var logtemp = "[Aggregator] sent to ["+ex+"]: "+stringRequest;
            logm.sendLog(ssn,logtemp, dev);
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
