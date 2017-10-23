#!/bin/bash
pm2 delete all

pm2 start loanRequest.js -x -- Dev
pm2 start getCreditScore.js -x -- Dev
pm2 start rulebaseServer.js 
pm2 start getBanks.js -x -- Dev
pm2 start soapBank1.js 
pm2 start rabbitMqBank.js -x -- Dev
pm2 start normalizer.js -x -- Dev
pm2 start Aggregator.js -x -- Dev
pm2 start translatorJSONBank.js -x -- poor Dev
pm2 start translatorXMLBank.js -x -- rich Dev
pm2 start translatorSoapBank.js -x -- all Dev
pm2 start translatorRabbitBank.js -x -- all Dev

