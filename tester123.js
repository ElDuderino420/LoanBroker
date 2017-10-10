var time = new Date(0);
time.setMonth(time.getMonth() + 100 +1);


if (Math.floor(time.getMonth() / 10) == 0) {
    var month = "0" + time.getMonth();
} else {
    var month = time.getMonth();
}
var newTime = time.getFullYear() + "-" + month + "-0" + time.getDay() + " 01:00:00.0 CET";

console.log(newTime)
console.log(Math.floor(time.getDay() / 10))
//console.log(ssn.slice(0, ssn.indexOf("-"))+ssn.slice(ssn.indexOf("-")+1))
