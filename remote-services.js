var http = require('http');
var util = require('util');
var url = require('url');
var querystring = require('querystring');
var Sequelize = require('sequelize');


http.createServer(function handler(req, res) {
	//var sequelize = new Sequelize('database', 'username', 'password')
	var sequelize = new Sequelize('node', 'node', 'node', {
		  host: 'localhost',
		  dialect: 'mysql',

		  pool: {
		    max: 5,
		    min: 0,
		    idle: 10000
		  },
		});

	var body = [];
	if(req.method=="POST"){
		req.on('error', function(err) {
		    console.error(err);
		}).on('data', function(chunk) {
		    body.push(chunk);
		}).on('end', function() {
		    body = Buffer.concat(body).toString();
			dispatcher(sequelize, body, req, res);
		    // At this point, we have the headers, method, url and body, and can now
		    // do whatever we need to in order to respond to this request.
		});
	}else if(req.method=="GET"){
		var params = url.parse(req.url, true);
		dispatcher(sequelize, params.query, params.pathname, res);
	}

}).listen(1338, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1338/');

function dispatcher(sequelize, body, pathname, res){
	if(pathname == "/reset-schema"){
		resetSchema(sequelize, res);
	}else if(pathname.url == "/add-user"){
		addUser(sequelize, body, res);
	}else if(pathname == "/fill-schema"){
		fillSchema(sequelize, res);
	}else if(pathname == "/find-user"){
		findUser(sequelize, body, res);
	}else if(pathname == "/delete-user"){
		deleteUser(sequelize, body, res);
	}else if(pathname == "/find-all-users"){
		findAllUsers(sequelize, res);
	}else{
		res.writeHead(403,
				{
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*' //http://localhost:8080
				}
		);
		res.end(JSON.stringify({code: 403, message: "operation not allowed"}));
	}
}
function resetSchema(sequelize, res){
	/*
	*	dichiarazione del bean (DDL)
	*/
	var User = sequelize.define('myuser',
			{
				userId: { type: Sequelize.BIGINT, primaryKey: true}, /* chiave primaria */
				firstName: Sequelize.STRING,
				lastName: Sequelize.STRING,
				emailAddress: Sequelize.STRING
			},
			{
				timestamps: false, /* per evitare la colonna timestamp */
				tableName: "myuser"
			}
	);
	/*
	*	Creazione dello schema definito
	*/
	User.sync({force: true}).then(function(){
		console.log("schema created successfully");
		res.writeHead(200,
				{
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
		);
		res.end(JSON.stringify({code: 200, message: "schema created"}));
	});
}

function addUser(sequelize, body, res){
	/*
	* dichiarazione del bean
	*/
	var User = sequelize.define('myuser',
			{
				userId: { type: Sequelize.BIGINT, primaryKey: true},
				firstName: Sequelize.STRING,
				lastName: Sequelize.STRING,
				emailAddress: Sequelize.STRING
			},
			{
				timestamps: false,
				tableName: "myuser"
			}
		);
		/*
		* parsing del bean ricevuto nella request
		*/
	var newUser = JSON.parse(body);
	persistUser(User, newUser);
	res.writeHead(200,
			{
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*' //http://localhost:8080
			}
	);
	res.end(JSON.stringify({code: 200, message: "user added"}));
}

function fillSchema(sequelize, res){
	var User = sequelize.define('myuser',
			{
				userId: { type: Sequelize.BIGINT, primaryKey: true},
				firstName: Sequelize.STRING,
				lastName: Sequelize.STRING,
				emailAddress: Sequelize.STRING
			},
			{
				timestamps: false,
				tableName: "myuser"
			}
			);
			var user1 = {
				userId: 0001,
				firstName: "John",
				lastName: "Doe",
				emailAddress: "john.doe@node.it"
			};
			var user2 = {
					userId: 0002,
					firstName: "Micheal",
					lastName: "Jackson",
					emailAddress: "m.jackson@node.it"
				};
			console.log("Persistence of user1: "+persistUser(User, user1));
			console.log("Persistence of user1: "+persistUser(User, user2));

			res.writeHead(200,
					{
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*' //http://localhost:8080
					}
			);
			res.end(JSON.stringify({code: 200, message: "schema filled-in"}));

//			User.create({
//				userId: 0001,
//				firstName: "John",
//				lastName: "Doe",
//				emailAddress: "john.doe@node.it"
//			}).then(function(){
//				res.writeHead(200,
//						{
//							'Content-Type': 'application/json',
//							'Access-Control-Allow-Origin': '*' //http://localhost:8080
//						}
//				);
//				res.end(JSON.stringify({code: 200, message: "schema filled-in"}));
//		})
//	);
}

function persistUser(User, attrs){
	try{
		/*
		*	ricerca tramite chiave primaria
		*/
		User.findOne(
				{
					where:
					{
						userId: attrs.userId
					}
				}
		).then(function(user) {
			if(user){
				/*
				* il record esiste, quindi si procede con update
				*/
				console.log("Firstname: "+user.dataValues.firstName+" Lastname: "+user.dataValues.lastName);
				user.updateAttributes(attrs).then(function(user){
					console.log("User updated successfully");
					return;
				});
			}else{
				/*
				*	il record non esiste, quindi si procede con l'inserimento
				*/
				console.log("User not found: persisting new user");
				User.create({ // add record
					userId: attrs.userId,
					firstName: attrs.firstName,
					lastName: attrs.lastName,
					emailAddress: attrs.emailAddress
				}).then(function(){
					return true;
				});
			}
		});
	}catch(err){
		console.log(err);
	}
}

function findUser(sequelize, body, res){
	var User = sequelize.define('myuser',
			{
				userId: { type: Sequelize.BIGINT, primaryKey: true},
				firstName: Sequelize.STRING,
				lastName: Sequelize.STRING,
				emailAddress: Sequelize.STRING
			},
			{
				timestamps: false,
				tableName: "myuser"
			}
	);
	/*
	*	ricerca tramite campo unique non-chiave
	*/
	User.findOne(
			{
				where:
				{
					emailAddress: body.email
				}
			}
	).then(function(user) {
		console.log("Firstname: "+user.dataValues.firstName+" Lastname: "+user.dataValues.lastName);
		res.writeHead(200,
				{
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*' //http://localhost:8080
				}
		);
			/*
			*	restituzione del bean come risultato
			*/
	    res.end(JSON.stringify(user));
	});
}

function deleteUser(sequelize, body, res){
	var User = sequelize.define('myuser',
			{
				userId: { type: Sequelize.BIGINT, primaryKey: true},
				firstName: Sequelize.STRING,
				lastName: Sequelize.STRING,
				emailAddress: Sequelize.STRING
			},
			{
				timestamps: false,
				tableName: "myuser"
			}
	);

	User.findOne(
			{
				where:
				{
					userId: body.userId
				}
			}
	).then(function(user) {
		if(user){
			/*
			*	cancellazione del record trovato
			*/
			user.destroy().then(function(){
				res.writeHead(200,
						{
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*' //http://localhost:8080
						}
				);
			    res.end(JSON.stringify(user));
			});
		}
	});
}

function findAllUsers(sequelize, res){
	var User = sequelize.define('myuser',
			{
				userId: { type: Sequelize.BIGINT, primaryKey: true},
				firstName: Sequelize.STRING,
				lastName: Sequelize.STRING,
				emailAddress: Sequelize.STRING
			},
			{
				timestamps: false,
				tableName: "myuser"
			}
	);
	/*
	*	query con restituzione di record multipli
	*/
	User.findAll().then(function(users) {
		res.writeHead(200,
				{
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*' //http://localhost:8080
				}
		);
	    res.end(JSON.stringify(users));
	});
}
