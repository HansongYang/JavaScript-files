var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Board = require("./makeBoard.js");
const ROOT = "./public";
var user = {};

app.listen(8888,function(){console.log("Server listening on port 8888");});

app.use(function(req,res,next){
	console.log(req.method+" request for "+req.url);
	next();
});
 
app.post("/ttt/intro",function(req,res){
	var postBody = "";
	req.setEncoding("utf8");
	req.on('data', function(chunk){
		postBody+=chunk;
	});
	var username = "";
	req.on('end', function(){
		username = JSON.parse(postBody).username;
		var player = {"name": username};
		player.level = 0;
		player.board = Board.makeBoard(3);
		user["users"] = player;
		res.send(JSON.stringify({"username" : player}));		
	});
});

app.get("/ttt/level", function(req,res){
	var player = user["users"];
	player.level += 1;
	player.board = Board.makeBoard(player.level+3);
	res.send(JSON.stringify({"username" : player}));
});

app.use(express.static(ROOT));
 
app.all("*", function(req,res){
	res.sendStatus(404);
});