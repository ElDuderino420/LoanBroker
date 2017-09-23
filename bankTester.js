var express = require('express');
var soap = require('soap');
var bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);
var app = express();
app.use(bodyParser.xml({
    limit: '1MB',
    xmlParseOptions: {
        normalize: true,
        normalizeTags: true,
        explicitArray: false
    }
}));

app.post('/john', bodyParser.urlencoded({extended: false}), function (req, res)
{
    console.log(Object.keys(req.body.loanrequest));
    console.log(req.body.loanrequest.ssn);
    console.log(req.body.loanrequest.creditScore);
    console.log(req.body.loanrequest.loanAmount);
    console.log(req.body.loanrequest.loanDuration);
    /*

    -beginning of soap body
    -url is defined to point to server.js so that soap cient can consume soap server's remote service
    -args supplied to remote service method
    */
    var url = "http://localhost:3030/soapbank?wsdl";
    console.log("her er URL: " + url);
    var args = {ssn: "12345678", creditScore: 25.5, loanAmount: 1000.0, loanDuration: 2};
    soap.createClient(url, function (err, client)
    {
        if (err)
            console.error(err);
        else
        {
            client.calculateInterest(args, function (err, response)
            {
                if (err)
                    console.error(err);
                else
                {
                    console.log(response);
                    res.send(response);
                }
            })
        }
    });
})
var server = app.listen(3036, function ()
{
    var host = "localhost";
    var port = server.address().port;
    console.log("server running at http://%s:%s\n", host, port);
})