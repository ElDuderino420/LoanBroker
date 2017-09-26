var soap = require('soap');
var express = require('express');
var app = express();


var service = {
    Banks_Service : {
        Banks_Port :{
            getBanks:function(args){
                //console.log(Date().getFullYear())
                var year = new Date().getFullYear();
                var n = args
                console.log(n);
                var allBanks = ['cphbusiness.bankJSON', 
                            'cphbusiness.bankXML',
                            '',
                            ''];
                var ans = [];

                ans = allBanks;

                return ans;
            }
        }
    }
};

var xml = require('fs').readFileSync('./rulebase.wsdl','utf8');
var server = app.listen(3031,function(){
    var host = "127.0.0.1";
    var port = server.address().port;
});
soap.listen(server,'/getbanks',service,xml);