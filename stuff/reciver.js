var amqp = require('amqplib/callback_api');
var url2 = 'amqp://student:cph@datdb.cphbusiness.dk:5672'


amqp.connect(url2, function(err, conn) {
    conn.createChannel(function(err, ch) {
      var ex = 'cphbusiness.bankJSON';

      ch.assertExchange(ex, 'fanout', {durable: false});

      ch.assertQueue('test', {durable: true}, function(err, q) {
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
        
        ch.bindQueue(q.queue, ex, '');

        ch.consume(q.queue, function(msg) {
          console.log(" [x] %s", msg.content.toString());
        }, {noAck: true});
      });
    });
  });



  
