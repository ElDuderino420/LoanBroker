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
                console.log(Object.keys(args));
                var ssn = args.ssn;
                var creditScore = args.creditScore;
                var loanAmount = args.loanAmount;
                var loanDuration = args.loanDuration;
                var year = new Date().getFullYear();
                var interestRate;

                console.log("her er credit: " + creditScore);
                switch (true)
                {
                    case(creditScore <= 100):
                        interestRate = (Math.random() * 20);
                        console.log("1");
                        break;
                    case(creditScore >= 200 && creditScore < 300):
                        interestRate = (Math.random() * 16);
                        console.log("2");
                        break;
                    case(creditScore >= 300 && creditScore < 400):
                        interestRate = (Math.random() * 12);
                        console.log("3");
                        break;
                    case(creditScore >= 400 && creditScore < 500):
                        interestRate = (Math.random() * 8);
                        console.log("4");
                        break;
                    case(creditScore >= 500 && creditScore < 600):
                        interestRate = (Math.random() * 4);
                        console.log("5");
                        break;
                    case(creditScore >= 600 && creditScore < 700):
                        interestRate = (Math.random());
                        console.log("6");
                        break;
                    case(creditScore >= 700 && creditScore < 800):
                        interestRate = (Math.random() / 4);
                        console.log("7");
                        break;
                    case(creditScore === 800):
                        interestRate = (Math.random() / 8);
                        console.log("8");
                        break;

                }

                console.log(interestRate)
                return {
                    loanResponse: {
                        interestRate: interestRate,
                        ssn: ssn
                    }
                };
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
});
+
    soap.listen(server, '/getinterest', service, xml);