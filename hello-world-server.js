var http = require('http');

http.createServer(function handler(req, res) {
	console.log(req.url);

	if(req.url == "/test"){
		testServer(res);
	}else{
		res.writeHead(403, 
				{
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*' //http://localhost:8080
				}
		);
		res.end(JSON.stringify({code: 403, message: "operation not allowed"}));
	}
	
}).listen(1338, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1338/');

function testServer(res){
	res.end(JSON.stringify({code: 200, message: "test success"}));
}
