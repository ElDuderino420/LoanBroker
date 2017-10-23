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
                var ans = [];
                var allBanks = ['poor', 
                'rich',
                'all'];
                if(args.creditScore > 500){
                    ans.push(allBanks[1]);
                    ans.push(allBanks[2])
                }
                else if(args.creditScore < 400){
                    ans.push(allBanks[0]);
                    ans.push(allBanks[2])
                } 
                else {
                    ans.push(allBanks[2]);
                }
                console.log(ans);
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