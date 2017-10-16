var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
var logm = require('./logModule.js')
var args = process.argv.slice(2);
console.log(args)
console.log("JSON");

amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var ex = 'group7RecipientList';
        var q = 'group7TranslatorJSONBank';
        var topics = args;

        ch.assertExchange(ex, 'topic', {durable: true});

        ch.assertQueue(q, {
            durable: true
        });

        topics.forEach(function(key){
            ch.bindQueue(q, ex, key);
        });        

        ch.consume(q, function(msg){
            console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());

            var request = JSON.parse(msg.content)
            sendToBank(request);
            var logtemp = "["+ex+"] to ["+q+"]: "+msg.content.toString();
            logm.sendLog(request.ssn,logtemp)

        }, {
            noAck: true
        });

    });
});

function sendToBank(request) {

    var cpr = request.ssn;
    request.ssn = cpr.slice(0, cpr.indexOf("-"))+cpr.slice(cpr.indexOf("-")+1);
    console.log(request);

    amqp.connect(rabbitmq, function (err, conn) {
        
        conn.createChannel(function (err, ch) {
            var ex = 'cphbusiness.bankJSON';
    
            ch.assertExchange(ex, 'fanout', {
                durable: false
            });
            
            ch.publish(ex, '', Buffer.from(JSON.stringify(request)), {
                replyTo: 'group7JSONReply'
            });
    
        });
    });
    
}