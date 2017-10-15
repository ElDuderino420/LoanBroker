call pm2 delete all

call pm2 start loanRequest.js
call pm2 start getCreditScore.js
call pm2 start rulebaseServer.js
call pm2 start getBanks.js
call pm2 start soapBank1.js
call pm2 start rabbitMqBank.js

call start node translatorJSONBank.js poor
call start node translatorXMLBank.js rich
call start node translatorSoapBank.js all
call start node translatorRabbitBank.js all
call start node normalizer.js
