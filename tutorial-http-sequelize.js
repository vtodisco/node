var http = require("http");
var url = require('url');
var fs = require("fs");
var Sequelize = require('sequelize');
var promise = require("promise");
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

http.createServer(function(request, response){
  //var sequelize = new Sequelize('database', 'username', 'password',
  var body = [];
  var pathname = "";
  var result = {};
  if(request.method == 'POST'){
    request.on('error', function(err){
      console.error(err);
      result.code = -1;
      result.message = err;
    }).on('data', function(chunk){
      body.push(chunk);
    }).on('end', function(){
      body = Buffer.concat(body).toString();
      result.code = 0;
      result.message = "request completed successfully";
      pathname = request.url;
      console.log(pathname);
      dispatcher(body, response, pathname);
    });
  }else if(request.method == 'GET'){
    var params = url.parse(request.url, true);
    pathname = params.pathname;
    body = params.query;
    result.code = 0;
    result.message = "request completed successfully";
    dispatcher(body, response, pathname);
  }else{
    var params = url.parse(request.url, true);
    dispatcher(params.query, response, params.pathname);
  }
}).listen(1111);

console.log("VMT DEBUG: node server listening on port 1111");

function dispatcher(body, response, pathname){
  console.log("VMT DEBUG: PATH NAME - "+pathname);
  var result = {
    completed: 0,
    code: -1,
    message: "not executed"
  };
  response.writeHead(200,
    {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*', //http://localhost:8080
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
    }
  );
  if(pathname=="/create-schema"){
    result = createSchema(sequelize, response);
  }else if(pathname=="/add-user"){
    addUser(sequelize, body, response);
  }else if(pathname=="/delete-user"){
    deleteUser(body, response);
  }else if(pathname=="/find-user"){
    result.completed = 1;
    result.code = -1,
    result.message = "not yet implemented"
    response.end(JSON.stringify(result));
  }else if(pathname=="/get-users"){
    getUsers(sequelize, response);
  }else{
    result.completed = 1;
    result.code = -1,
    result.message = "path not found"
    response.end(JSON.stringify(result));
  }
}

function getUsers(sequelize, res){
  console.log("VMT DEBUG: inside getUsers");
  var result =
  {
    completed: 0,
    code: -1,
    message: "failure"
  };
  var user = sequelize.define('utente',
    {
      userId: {type: Sequelize.BIGINT, primaryKey: true},
      nome: Sequelize.STRING,
      cognome: Sequelize.STRING,
      email: Sequelize.STRING
    },
    {
      timestamps: false, /* evita la colonna timestamp creata automaticamente */
      tableName: "utente"
    }
  )
	/*
	*	query con restituzione di record multipli
	*/
	user.findAll().then(function(users) {
    result.completed = 1;
    result.code = 1;
    result.message = "User fetched from DB";
    result.payload = users;
	  res.end(JSON.stringify(result));
	});
}

function createSchema(sequelize, res){
  var result =
  {
    completed: 0,
    code: -1,
    message: "failure"
  };
  var user = sequelize.define('utente',
    {
      userId: {type: Sequelize.BIGINT, primaryKey: true},
      nome: Sequelize.STRING,
      cognome: Sequelize.STRING,
      email: Sequelize.STRING
    },
    {
      timestamps: false, /* evita la colonna timestamp creata automaticamente */
      tableName: "utente"
    }
  );

  user.sync({force: true}).then(function(){
    result.completed = 1;
    result.code = 1;
    result.message = "DB schema created";
    console.log("VMT DEBUG: returning");
    console.log(result);
    res.end(JSON.stringify(result));
  });
}

function persistUser(user, attrs){
  try{
    user.findOne(
      {
        where:
        {
          userId: attrs.userId
        }
      }
    ).then(function(existing){
      if(existing){
        user.updateAttributes(attrs).then(function(updated){
          console.log("VMT DEBUG: user updated successfully");
          return;
        });
      }else{
        console.log("VMT DEBUG: new user - persisting");
        user.create({
            userId: attrs.userId,
            nome: attrs.nome,
            cognome: attrs.cognome,
            email: attrs.email
        }).then(function(){
          console.log("VMT DEBUG: user persisted");
          return true;
        });
      }
    });
  }catch(err){
    console.log(err);
  }
}

function addUser(sequelize, body, res){
  var result = {};
  result.completed = 1;
  result.code = 1;
  result.message = "User created";
  var user = sequelize.define("utente",
    {
      userId: {type: Sequelize.BIGINT, primaryKey: true},
      nome: Sequelize.STRING,
      cognome: Sequelize.STRING,
      email: Sequelize.STRING
    },
    {
      timestamps: false, /* evita la colonna timestamp creata automaticamente */
      tableName: "utente"
    }
  );
  var newUser = JSON.parse(body);
  console.log("VMT DEBUG: user persistence result "+persistUser(user, newUser));
  res.end(JSON.stringify(result))
}

function deleteUser(body, res){
  console.log("VMT DEBUG: inside deleteUser with id = "+body.id);
  console.log(body);
  var user = sequelize.define('utente',
  {
    userId: {type: Sequelize.BIGINT, primaryKey: true},
    nome: Sequelize.STRING,
    cognome: Sequelize.STRING,
    email: Sequelize.STRING
  },
  {
    timestamps: false, /* evita la colonna timestamp creata automaticamente */
    tableName: "utente"
  });
  user.findOne(
    {
      where:{
        userId: body.id
      }
    }
  ).then(function(existing){
    if(existing){
      console.log("VMT DEBUG: USER FOUND - being deleted");
      existing.destroy().then(function(){
        var result = {};
        result.completed = 1;
        result.code = 1;
        result.message = "User deleted";
        console.log("VMT DEBUG: returning result");
        res.end(JSON.stringify(result));
      });
    }else{
      console.log("VMT DEBUG: USER NOT FOUND");
    }
  });
}
