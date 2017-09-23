var soap = require('soap');
var express = require('express');
var app = express();
var cors = require('cors');

app.use(cors());
/**
 -this is remote service defined in this file, that can be accessed by clients, who will supply args
 -response is returned to the calling client
 -our service calculates bmi by dividing weight in kilograms by square of height in metres
 **/
var service = {
    interestService: {
        interest_port: {
            calculateInterest: function (args)
            {
                var ssn = args.ssn;
                var creditScore = args.creditScore;
                var loanAmount = args.loanAmount;
                var loanDuration = args.loanDuration;
                var year = new Date().getFullYear();

                var interestRate = (Math.random()*10); //tager et tal mellem 0.0... og 9.9... og ganger med ti, for en nogenlunde realistik rente.
                return {loanResponse: {
                    interestRate : interestRate,
                    ssn : ssn
                }};
            }
        }
    }
};
// xml data is extracted from wsdl file created
var xml = require('fs').readFileSync('./soapbank.wsdl', 'utf8');
var server = app.listen(3030, function ()
{
    var host = "localhost";
    var port = server.address().port;
});+
soap.listen(server, '/getinterest', service, xml);