var http = require("http");
var url = require('url');
var fs = require("fs");
var Sequelize = require('sequelize');

http.createServer(function(request, response){
  dispatcher(request, response);
}).listen(1111);
console.log("VMT DEBUG: node server listening on port 1111");

function dispatcher(request, response){
  var body = [];
  var pathname = "";
  if(request.method == 'POST'){
    request.on('error', function(err){
      console.error(err);
    }).on('data', function(chunk){
      body.push(chunk);
    }).on('end', function(){
      body = Buffer.concat(body).toString();
      console.log(body);
      pathname = req.url;
    });
  }else if(request.method == 'GET'){
    var params = url.parse(request.url, true);
    pathname = params.pathname;
  }
  console.log("VMT DEBUG: dispatch to "+pathname);
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
}
