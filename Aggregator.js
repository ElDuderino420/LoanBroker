var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'

amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var Banks = ['TineJsonBank',
            'TinesXmlBank',
            'RabbitBank',
            'SoapBank'];
        var ResCol = new Array();


        var q = 'group7AggregatorQueue';
        var qt = 'group7AggregatorTopicQueue';
        ch.assertQueue(q, {
            durable: false
        });
        ch.assertQueue(qt, {
            durable: false
        });

        ch.consume(q, function (msg) {
            var res = JSON.parse(msg.content);
            
            var ssnRes = ResCol["key-"+res.ssn];
            
            var bankDupli = false;
            if(ssnRes != null){
           
                ssnRes.response.forEach(function(element) {
                    if(element.bankq == res.bankq){
                        bankDupli = true
                    }
                }, this);
                if(!bankDupli){
                    ssnRes.response.push(res);
                }
                if(ssnRes.numBanks == ssnRes.response.length){
                    sendToServer(ssnRes.response)
                    delete ResCol["key-"+res.ssn];
                }
            }
            console.log("Recieved: %s       ResCol.length: %s       ",msg.content.toString(),Object.keys(ResCol).length)
            console.log("Key stored: %s    ",JSON.stringify(ssnRes))

        },{
            noAck: true
        });
        ch.consume(qt, function (msg) {
            var res = JSON.parse(msg.content);

            var tempBanks = 0;
            res.topic.forEach(function(topic) {
                if(topic == "all"){
                    tempBanks += 2;
                }
                if(topic == "poor"){
                    tempBanks += 1;
                }
                if(topic == "rich"){
                    tempBanks += 1;
                }
            })
            if(ResCol["key-"+res.ssn] == null){
            ResCol["key-"+res.ssn] = {
                numBanks: tempBanks,
                response:[]
            }}    
            console.log(" [x] Received from server   topic: %s       msg: %s",res.topic,msg.content.toString());
        },{
            noAck: true
        });
    });
});

function sendToServer(request) {
    amqp.connect(rabbitmq, function (err, conn) {
        conn.createChannel(function (err, ch) {
            var q = 'group7AggregatorToFrontendQueue';
            ch.assertQueue(q, {
                durable: false
            });

            ch.sendToQueue(q, Buffer.from(JSON.stringify(request)));
            console.log(" [x] Send to Frontend %s", JSON.stringify(request));
        });
        setTimeout(function () {
            conn.close();
        }, 500);
    });
}