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
            console.log(" [x] Received from bank %s", msg.content.toString());
            var ssnRes = ResCol[res.ssn];
            var bankDupli = false;
            if(ssnRes != null){
                console.log(ResCol.length);
                ssnRes.response.forEach(function(element) {
                    if(element.bankq == res.bankq){
                        bankDupli = true
                    }
                }, this);
                if(!bankDupli){
                    ssnRes.response.push(res);
                }
            }
            if(ssnRes.numBanks == ssnRes.response.length){
                sendToServer(ssnRes);
                ResCol.splice(ResCol.indexOf(res.ssn),1);
                
            }

        })
        ch.consume(qt, function (msg) {
            var res = JSON.parse(msg.content);
            if(res.topic.length != 1){
                var tempBanks = 4;
            }else{
                var tempBanks = 3;
            }
            if(ResCol[res.ssn] != null){
            ResCol[res.ssn] = {
                numBanks: tempBanks,
                response:[]
            }}
            console.log(" [x] Received from server %s", msg.content.toString());

            

        })
    });
});