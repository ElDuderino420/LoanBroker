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
                var creditScore = args.creditscore;
                var loanAmount = args.loanamount;
                var loanDuration = args.loanduration;
                var year = new Date().getFullYear();
                var interestRate;

                switch(true)
                {
                    case(creditScore < 100):
                        var interestRate = (Math.random()*10);
                        break;
                    case(creditScore > 200 && creditScore < 300):
                        var interestRate = (Math.random()*10);
                        break;
                    case(creditScore > 300 && creditScore < 400):
                        var interestRate = (Math.random()*8);
                        break;
                    case(creditScore > 400 && creditScore < 500):
                        var interestRate = (Math.random()*6);
                        break;
                    case(creditScore > 500 && creditScore < 600):
                        var interestRate = (Math.random()*4);
                        break;
                    case(creditScore > 600 && creditScore < 700):
                        var interestRate = (Math.random()*2);
                        break;
                    case(creditScore > 700 && creditScore < 800):
                        var interestRate = (Math.random());
                        break;
                    case(creditScore === 800):
                        var interestRate = (Math.random()/2);
                        break;

                }

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