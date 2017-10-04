var soap = require('soap');
var express = require('express');
var app = express();


var service = {
    Banks_Service : {
        Banks_Port :{
            getBanks:function(args){
                //console.log(Date().getFullYear())
                var year = new Date().getFullYear();
                console.log(args);
                var allBanks = ['poor', 
                            'rich',
                            'all'];
                var ans = ['rich'];

                
                return ans;
            }
        }
    }
};

var xml = require('fs').readFileSync('./rulebase.wsdl','utf8');
var server = app.listen(3031,function(){
    var host = "127.0.0.1";
    var port = server.address().port;
    console.log("server running at http://%s:%s\n", host, port);
});
soap.listen(server,'/getbanks', service, xml);