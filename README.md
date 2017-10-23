# LoanBroker
Group: loanbroker7<br>


The loan quote process flow goes like this:
1. Receive the consumer's loan quote request (ssn, loan amount, loan duration)
2. Obtain credit score from credit agency (ssn  credit score)
3. Determine the most appropriate banks to contact from the Rule Base web service
4. Send a request to each selected bank (ssn, credit score, loan amount, loan duration)
5. Collect response from each selected bank
6. Determine the best response
7. Pass the result back to the consumer


<br>Run everything by running these 3 lines:
<br>npm install pm2 -g
<br>npm install
<br>src/runeverything.bat
<br>
<br>Make loan request on http://localhost:3030
<br>or use the live version on digitalocean.com.
<br>http://37.139.5.194:3030
