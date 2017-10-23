var d = new Date("1970-01-01T01:00:00Z");
d.setMonth(48);
console.log(d.getFullYear() + "-" + d.getMonth() + "-" + d.getDay() +" 01:00:00.0 CET");
console.log(d.getMonth());
console.log(d.toISOString().substring(0,d.toISOString().indexOf('T'))+" 01:00:00.0 CET");