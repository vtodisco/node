var fs = require("fs");

//var data = fs.readFileSync("input.txt");
fs.readFile("inpute.txt", function(err, data){
  if(err) return console.error(err);
  console.log(data.toString());
});
//console.log(data.toString());
console.log("VMT DEBUG: program ended");
