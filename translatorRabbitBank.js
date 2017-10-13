var amqp = require('amqplib/callback_api');
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'

var args = process.argv.slice(2);
console.log(args)
console.log("rabbit");
amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var ex = 'recipientListEx';
        var q = 'group7translatorRabbitBankQueue' + args[0];
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

    amqp.connect(rabbitmq, function (err, conn) {
        
        conn.createChannel(function (err, ch) {
            var q = 'grp7.loanRequest';
    
            
            console.log(" [x] rabbit sent: %s", JSON.stringify(request));

            

            ch.sendToQueue(q, Buffer.from(JSON.stringify(request)), {replyTo: 'RabbitJsonQueue'})
           
        });
    });
    
}