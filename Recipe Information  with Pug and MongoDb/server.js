var express = require('express');
var app = express();
var hat = require('hat');  //creates random tokens
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongo = require('mongodb').MongoClient;
var DBURL = "mongodb://localhost:27017/recipeDB";

app.set('views','./view');
app.set('view engine','pug');

var db;
mongo.connect(DBURL, function(err,database){
	if(err)throw err;
	db = database;
	app.listen(2406,function(){console.log("Server listening on port 2406");});
});

app.use(function(req,res,next){
	console.log(req.method+" request for "+req.url);
	next();
});

app.use(cookieParser());

app.get("/index",function(req,res){ //main page
	if(req.cookies.database === undefined){
		res.render('login');
	}
	res.render('index');
})

app.get("/recipes", function(req, res){   // get all recipes
	if(req.cookies.database === undefined){
		res.render('404');
	}else{
		var cursor = db.collection(req.cookies.database).find({}, {name:1});
		cursor.toArray(function(err, documents){ 
			if(err){
				res.sendStatus(500);
			}
			else{
				if(documents.length === 0){ // no data
					return res.send("{}");
				}
				var recipes = [];
				for(var i = 0; i < documents.length; i++){
					recipes[recipes.length] = documents[i].name;
				}
				var recipe = {names: recipes};
				console.log(recipe.names);
				res.send(recipe);
			}
		});
	}
});

app.get("/recipe/*", function(req, res){
	if(req.cookies.database === undefined){
		res.render('404');
	}
	else{
		var path = req.path.split('/');
		var cursor = db.collection(req.cookies.database).find({name: path[2].split('%20').join('_')});
		cursor.toArray(function(err, documents){
		if(err){
			res.sendStatus(500);
		}else{
			if(documents.length === 0){ //no data
				res.render('404');
			}
			if(documents.length > 0){
				res.send(documents[0]);
			}
		}
		});
	}
});

app.use("/recipe", bodyParser.urlencoded({extended:true}));

app.post("/recipe",function(req,res){
	db.collection(req.cookies.database).findOne({name:req.body.name}, function(err,documents){
		if(err){
			res.sendStatus(500);
		}
		else{
			if(req.body.name === ""){
				res.sendStatus(400);
			}
			else{
				if(documents){				
					var cursor = db.collection(req.cookies.database).update({name:req.body.name},req.body,function(err,documents){
						if(err){
							res.sendStatus(500);
						}
						else{		
							console.log("Update a recipe.")				
							res.sendStatus(200);
						}
					});
				}		
				else{
					db.collection(req.cookies.database).insertOne(req.body,function(err,documents){
						if(err){
							res.sendStatus(500);
						}
						else{
							db.collection(req.cookies.database).find({},{name:1}, function(err, documents){
								if(err){
									res.sendStatus(500);
								}
								else{
									console.log("Add a new recipe.")
									res.sendStatus(200);
								}
							});
						}
					});
				}
			}
		}
	});
});

app.use("/login", bodyParser.json());

app.post("/login", function(req, res){         // login page
	db.collection('users').findOne({username:req.body.username},function(err, documents){	
	if(err){
		res.sendStatus(500);
	}
	else if(!documents){ // username not found
		res.status(400);
		res.render('login',{warning:"Username not found or Incorrect password"});
	}
	else if(req.body.password !== documents.password){ //wrong password.
			console.log("incorrect password: ", documents.password+"!="+req.body.password);
			res.status(400);
			res.render('login',{warning:"Username not found or Incorrect password"});
	}
	else{
		console.log("Successfully log in");	
		res.cookie('client', documents.client,{path:'/',maxAge: 3600000});
		res.cookie('database', documents.database, {path: '/', maxAge: 3600000});
		res.sendStatus(200);
	}	
	});
});

app.get("/", function(req, res){
	var clientData = db.collection('users').find({});
	clientData.toArray(function(err, documents){			
		if(documents.length === 0){ // put data in collection
			var cursor = db.collection('users').insert([{"username" : "tom", "password" : "mot", "client" : "tom", "database" : "dataTom"}, 
			{"username" : "sam", "password" : "mas", "client" : "sam", "database" : "dataSam"}]);
		}
	});

	if(req.cookies.client === ""){  //first login in
		res.render('login');
	}
	else{
		var cursor = db.collection('users').find({"client":req.cookies.client});
        cursor.toArray(function(err,documents){
        if(err){
			res.sendStatus(500);
        }
        else{
	     if(documents.length === 0){
             	res.render('login');
           	 }
            else{
		res.render('index');
            }
          }
        });
	}
});

app.use(express.static("./public"));
