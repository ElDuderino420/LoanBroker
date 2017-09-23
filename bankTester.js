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
    console.log(req.body.loanrequest.creditscore);
    console.log(req.body.loanrequest.loanamount);
    console.log(req.body.loanrequest.loanduration);
    /*

    -beginning of soap body
    -url is defined to point to server.js so that soap cient can consume soap server's remote service
    -args supplied to remote service method
    */
    var url = "http://localhost:3030/getinterest?wsdl";
    console.log("her er URL: " + url);
    var args = {ssn: req.body.loanrequest.ssn, creditScore: req.body.loanrequest.creditscore, loanAmount: req.body.loanrequest.loanamount, loanDuration: req.body.loanrequest.loanduration};
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