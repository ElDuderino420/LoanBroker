call pm2 delete all

call pm2 start loanRequest.js -x -- Dev
call pm2 start getCreditScore.js -x -- Dev
call pm2 start rulebaseServer.js 
call pm2 start getBanks.js -x -- Dev
call pm2 start soapBank1.js 
call pm2 start rabbitMqBank.js -x -- Dev
call pm2 start normalizer.js -x -- Dev
call pm2 start Aggregator.js -x -- Dev
call pm2 start translatorJSONBank.js -x -- poor Dev
call pm2 start translatorXMLBank.js -x -- rich Dev
call pm2 start translatorSoapBank.js -x -- all Dev
call pm2 start translatorRabbitBank.js -x -- all Dev

