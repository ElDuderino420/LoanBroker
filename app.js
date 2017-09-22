var soap = require('soap');
var amqp = require('amqplib/callback_api');

var url = 'http://138.68.85.24:8080/CreditScoreService/CreditScoreService?wsdl'
var url2 = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
var args = {
    ssn: '123456-1234'
};

var getCreditScore = function(ssn){
    soap.createClient(url, function (err, client) {
        if (err) {
            console.log(err)
        } else {
            client.creditScore(ssn, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);


                }
            });
        }
    
    });
};



getCreditScore(args);


amqp.connect(url2, function(err, conn){
    conn.createChannel(function(err, ch){
        var ex = 'cphbusiness.bankJSON';

        ch.assertExchange(ex, 'fanout', {durable: false});

        ch.publish(ex, 'test', new Buffer('hello------world'));
    })
});