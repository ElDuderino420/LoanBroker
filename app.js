var soap = require('soap');
var url = 'http://138.68.85.24:8080/CreditScoreService/CreditScoreService?wsdl'
var args = {
    ssn: '123456-1234'
};
soap.createClient(url, function (err, client) {
    //client.creditScore()
    if (err) {
        console.log(err)
    } else {
        client.creditScore(args, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
        });
    }

});