var soap = require('soap');
var amqp = require('amqplib/callback_api');
var amqpConn = null;

var url = 'http://138.68.85.24:8080/CreditScoreService/CreditScoreService?wsdl'
var url2 = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
var args = {
    ssn: '1234561234',
    loanAmount: '500',
    loanDuration: '120',
    creditScore: '500'
};
var xml = "<LoanRequest><ssn>12345678</ssn><creditScore>685</creditScore><loanAmount>10.0</loanAmount><loanDuration>1970-01-01 01:00:00.0 CET</loanDuration></LoanRequest>"

amqp.connect(url2, function (err, conn) {
    conn.createChannel(function (err, ch) {
        

        var ex = 'cphbusiness.bankXML';

        ch.assertExchange(ex, 'fanout', {
            durable: false
        });

        ch.publish(ex, '', Buffer.from(xml), {
            replyTo: 'tttezzt'
        });


        /* var ex = 'cphbusiness.bankJSON';

        ch.assertExchange(ex, 'fanout', {
            durable: false
        });
        
        ch.publish(ex, '', Buffer.from(JSON.stringify(args)), {
            replyTo: 'tttezzt'
        }); */

    });
});


