var soap = require('soap');
var amqp = require('amqplib/callback_api');
var amqpConn = null;

var url = 'http://138.68.85.24:8080/CreditScoreService/CreditScoreService?wsdl'
var url2 = 'amqp://student:cph@datdb.cphbusiness.dk:5672'
var args = {
    ssn: '123456-1234'
};

var getCreditScore = function (ssn) {
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



//getCreditScore(args);


amqp.connect(url2, function (err, conn) {
    conn.createChannel(function (err, ch) {
        var ex = 'cphbusiness.bankJSON';

        ch.assertExchange(ex, 'fanout', {
            durable: false
        });

        ch.publish(ex, '', new Buffer('{"ssn":1605789787,"creditScore":598,"loanAmount":10.0,"loanDuration":360}'), {
            contentType: 'application/json',
            replyTo: 'tttezzt'
        });

        ch.assertQueue('tttezzt', {
            durable: true
        }, function (err, q) {

            ch.bindQueue(q.queue, ex, '');
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);

            ch.consume(q.queue, function (msg) {
                console.log(" [x] %s", msg.content.toString());


            }, {
                noAck: true
            });
        });

        




        /* ch.assertQueue('test', {exclusive: true}, function(err, q){
            ch.bindQueue(q.queue, ex, '');

            ch.consume(q.queue, function(msg){
                console.log(msg.content.toString());
            }, {noAck: true});
            
            //ch.sendToQueue(q.queue, new Buffer('{"ssn":1605789787,"creditScore":598,"loanAmount":10.0,"loanDuration":360}'), {replyTo: 'test'});
        }); */
    });
});


var soap = require('soap');
var amqp = require('amqplib/callback_api');
var amqpConn = null;

var url = 'http://138.68.85.24:8080/CreditScoreService/CreditScoreService?wsdl'
var rabbitmq = 'amqp://student:cph@datdb.cphbusiness.dk:5672'

function send () {

    amqp.connect(rabbitmq, function(err, conn) {
        conn.createChannel(function(err, ch) {
            var q = 'getCreditScoreQueue';
            var msg = {ssn: document.getElementById('ssn')}

            console.log(msg);
            ch.assertQueue(q, {durable: false});

            ch.sendToQueue(q, Buffer.from())
        })
    })


    var xmlhttp = new XMLHttpRequest();
    xmlhttp.getAllResponseHeaders();
    xmlhttp.open('POST','http://127.0.0.1:3036/getAge',true);
     var input = '<?xml version="1.0"?>' +
     '<biodata>' +
        '<Weight>'+document.getElementById('weight').value+'</Weight>'+
        '<Height>'+document.getElementById('height').value +'</Height>' +
     '</biodata>';
    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState == 4)
        {
            if(xmlhttp.status == 200){
                console.log("Data pushed\n");
                alert(xmlhttp.responseText)
            }
        }
    }
    xmlhttp.setRequestHeader('Content-Type','text/xml');
    xmlhttp.send(input);
}
