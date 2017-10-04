call pm2 delete loanRequest.js
call pm2 delete getCreditScore.js
call pm2 delete rulebaseServer.js
call pm2 delete getBanks.js
call pm2 delete recipientList.js

call pm2 start loanRequest.js
call pm2 start getCreditScore.js
call pm2 start rulebaseServer.js
call pm2 start getBanks.js
