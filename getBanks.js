var soap = require('soap');
var amqp = require('amqplib/callback_api');

var rulebase = "http://localhost:3031/getbanks?wsdl";
//var args = {ssn:'123456-1234',loanAmount:'123',loanDuration:'123',creditScore:'123'};
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'

amqp.connect(rabbitmq, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'getBanksQueue';
        ch.assertQueue(q, {
            durable: false
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
        ch.consume(q, function (msg) {
            console.log(" [x] Received %s", msg.content.toString());

            var request = JSON.parse(msg.content);
            
            getBanks(request, function(result){ 
                console.log("callback:" + result[0]);
                var allBanks = ['cphbusiness.bankJSON', 
                'cphbusiness.bankXML',
                '',
                ''];

                //JSON.parse(result);
                console.log(result);
                console.log(allBanks);
                recipientList(request, allBanks);
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
            client.getBanks(request,function(err, response){
                if(err)
                    console.error(err);
                else{
                    console.log(response);
                    var arr = Object.keys(response).map(function(key){ return response[key] });
                    
                    callback(arr);
                }
            });
        }
    });
};

function recipientList(request, bank) {
    amqp.connect(rabbitmq, function (err, conn) {
        conn.createChannel(function (err, ch) {
            var ex = 'recipientListEx';
            ch.assertExchange(ex, 'direct', {durable: false});

            bank.forEach(function(bankname) {
                ch.publish(ex, bankname, Buffer.from(JSON.stringify(request)));
                console.log(" [x] Sent %s: '%s'", bankname, JSON.stringify(request));
            });

            /* var q = 'recipientListQueue';
            ch.assertQueue(q, {
                durable: false
            });

            ch.sendToQueue(q, Buffer.from(JSON.stringify(request)));
            console.log(" [x] Sending request to selected banks"); */
        });
        setTimeout(function () {
            conn.close();
        }, 500);
    });
}