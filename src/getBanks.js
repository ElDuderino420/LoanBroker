var soap = require('soap');
var amqp = require('amqplib/callback_api');
var logm = require('./logModule.js')
var rulebase = "http://localhost:3031/getbanks?wsdl";
//var args = {ssn:'123456-1234',loanAmount:'123',loanDuration:'123',creditScore:'123'};
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
var args = process.argv.slice(2);
var dev = false;
amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'group7GetBanks';
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
            
            getBanks(request, function(result){ 
                console.log("callback:" + result);
                var cpr = request.ssn;
                temp = cpr.slice(0, cpr.indexOf("-"))+cpr.slice(cpr.indexOf("-")+1);
                sendToAggregator({
                    ssn: temp,
                    topic: result
                })
                result.forEach(function(element) {
                    recipientList(request, element);    
                }, this);
                
            });
            

        }, {
            noAck: true
        });

    });
});

function getBanks(request, callback) {
    soap.createClient(rulebase,function(err, client){
        if(err)
            console.error(err);
        else {
            client.getBanks(request, function(err, response){
                if(err)
                    console.error(err);
                else{
                    var arr = Object.keys(response).map(function(key){ return response[key] });
                    console.log(arr)
                    callback(arr);
                }
            });
        }
    });
};

function recipientList(request, key) {
    amqp.connect(rabbitmq, function (err, conn) {
        conn.createChannel(function (err, ch) {
            var ex = 'group7RecipientList';
            if (args.length == 1 && args[0] == "Dev") {
                ex += args[0];
            }

            //var key = (topic.length > 0) ? topic[0] : 'all';

            ch.assertExchange(ex, 'topic', {durable: true});
            
            ch.publish(ex, key, Buffer.from(JSON.stringify(request)));
            console.log(" [x] Sent %s: '%s'", key, JSON.stringify(request));
            var logtemp = "[group7GetBanks] published to ["+key+"] ["+ex+"]: "+JSON.stringify(request);
            logm.sendLog(request.ssn, logtemp, dev) 
            
        });
        setTimeout(function () {
            conn.close();
        }, 500);
    });
}

function sendToAggregator(request) {
    amqp.connect(rabbitmq, function (err, conn) {
        conn.createChannel(function (err, ch) {
            var q = 'group7AggregatorTopic';
            if (args.length == 1 && args[0] == "Dev") {
                q += args[0];
            }
            ch.assertQueue(q, {
                durable: true
            });

            ch.sendToQueue(q, Buffer.from(JSON.stringify(request)));
            console.log(" [x] Send request to Aggregator");
        });
        setTimeout(function () {
            conn.close();
        }, 500);
    });
}

