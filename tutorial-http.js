var http = require("http");
var url = require('url');
var fs = require("fs");
var Sequelize = require('sequelize');

http.createServer(function(request, response){
  //var sequelize = new Sequelize('database', 'username', 'password',
  var sequelize = new Sequelize('node', 'node', 'node',
  {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  });

  response.writeHead(200,
    {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*' //http://localhost:8080
    }
  );
  //var data = fs.readFileSync("input.txt");
  fs.readFile("fs-index.html", function(err, data){
    if(err) return console.error(err);
    response.end(data.toString());
  });

}).listen(1111);
console.log("VMT DEBUG: node server listening on port 1111");
