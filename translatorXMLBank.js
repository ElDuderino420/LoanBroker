var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
var js2xmlparser = require("js2xmlparser");

var args = process.argv.slice(2);
console.log(args);
console.log("XML");
amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var ex = 'recipientListEx';
        var q = 'group7translatorXMLBankQueue' + args[0];
        var topics = args;

        ch.assertQueue(q, {
            durable: false
        });

        topics.forEach(function(key){
            ch.bindQueue(q, ex, key);
        }); 
        
        ch.consume(q, function(msg){
            console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());

            sendToBank(JSON.parse(msg.content));


        }, {
            noAck: true
        });

    });
});


function sendToBank(request) {

    var cpr = request.ssn;
    request.ssn = cpr.slice(0, cpr.indexOf("-"))+cpr.slice(cpr.indexOf("-")+1);
    console.log(request);
    
    var d = new Date("1970-01-01T01:00:00Z");
    d.setMonth(request.loanDuration);
    
    request.loanDuration = d.toISOString().substring(0,d.toISOString().indexOf('T'))+" 01:00:00.0 CET";

    var XML = js2xmlparser.parse("LoanRequest", request);

    amqp.connect(rabbitmq, function (err, conn) {
        
        conn.createChannel(function (err, ch) {
            var ex = 'cphbusiness.bankXML';
    
            ch.assertExchange(ex, 'fanout', {
                durable: false
            });
            console.log(" [x] sent: %s", XML);
            ch.publish(ex, '', Buffer.from(XML), {
                replyTo: 'XMLQueue'
            });
    
        });
    });
    
}