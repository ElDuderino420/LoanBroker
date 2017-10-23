var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
var logm = require('./logModule.js')

var args = process.argv.slice(2);
console.log(args)
console.log("JSON");
var dev = false;


amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var ex = 'group7RecipientList';
        var q = 'group7TranslatorJSONBank';
        var topics = args;
        if (args.length == 2 && args[1] == "Dev") {
            ex += args[1];
            q += args[1];
            dev = true;
        }
        ch.assertExchange(ex, 'topic', {durable: true});

        ch.assertQueue(q, {
            durable: true
        });

        if(args.length != 0){
            ch.bindQueue(q, ex, args[0]);
        }

        ch.consume(q, function(msg){
            console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());

            var request = JSON.parse(msg.content)
            sendToBank(request);
            var logtemp = "["+ex+"] to ["+q+"]: "+msg.content.toString();
            logm.sendLog(request.ssn,logtemp, dev)

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
            var reply = 'group7JSONReply';
            if (args.length == 2 && args[1] == "Dev") {
                q += args[1];
                reply += args[1];
            }
            ch.assertExchange(ex, 'fanout', {
                durable: false
            });
            
            ch.publish(ex, '', Buffer.from(JSON.stringify(request)), {
                replyTo: reply
            });
    
        });
    });
    
}