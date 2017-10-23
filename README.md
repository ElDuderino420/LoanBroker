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

<br>Check out the live version here: http://37.139.5.194:3030
<br>Or run it locally with 3 easy steps
<br>Run everything by running these 3 lines:
<br>Navigate to ./LoanBroker/src
<br>npm install pm2 -g
<br>npm install
<br>If you are on a windows machine run src/runeverything.bat
<br>If you are on a windows machine run equivalent of altStart.txt, all the lines are listed sequencially, we have tested on linux that they can all be pasted into a single line for more convenience.

<br>Make loan request on http://localhost:3030
<br>When done with it locally plz use pm2 delete all, else your pm2 will run in the background until you reboot.


