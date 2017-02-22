var http = require('http');
var fs = require('fs');
var mime = require('mime-types');
var url = require('url');
const ROOT = "./public";
var Board = require("./makeBoard.js");
var users = {};
var board = {};

// create http server
var server = http.createServer(handleRequest); 
server.listen(2406);
console.log('Server listening on port 2406');


function handleRequest(req, res) {
	
	//process the request
	console.log(req.method + " request for: " + req.url);
	
	//parse the url
	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;
	var data = "";
	
	//the callback sequence for static serving...
	if(urlObj.pathname === "/memory/intro"){
		if(req.method === "POST"){
			req.setEncoding('utf8');
			req.on('data', function(chunk){
				console.log(chunk);
				data+=chunk; //data is read as buffer objects
			});
			var username = "";
			req.on('end', function(){
				data = JSON.parse(data);
				username = data["username"];
				var player = {"name" : username};
				player.level = 1;
				board = Board.makeBoard(2*(player.level+1)); 
				users["name"] = player.name; 
				users[username] = player;
				respond(200, JSON.stringify({"username" : player}));
			});
		}
	}else if(urlObj.pathname === "/memory/card"){
		if(req.method === "GET"){
			var choices = urlObj.query.choice;
			var choice = choices.split("a");
			var username = urlObj.query.username;
			var player = users[username]; 
			player.row = choice[0]; 
			player.column = choice[1];	
			player.chosen = board[player.row][player.column];
			console.log(board);
			respond(200, JSON.stringify({"username" : player}));
		}
	}else if(urlObj.pathname === "/memory/level"){
			var username = urlObj.query.username;
			var player = users[username];
			player.level += 1;
			board = Board.makeBoard(2*(player.level+1));
			respond(200, JSON.stringify({"username" : player}));
	}else{
		fs.stat(filename,function(err, stats){
			if(err){   //try and open the file and handle the error, handle the error
				respondErr(err);
			}else{
				if(stats.isDirectory())	filename+="/index.html";
			
				fs.readFile(filename,"utf8",function(err, data){
					if(err)respondErr(err);
					else respond(200,data);
			    });
			}
		});			
	}
	//locally defined helper function
	//serves 404 files 
	function serve404(){
		fs.readFile(ROOT+"/404.html","utf8",function(err,data){ //async
			if(err)respond(400,err.message);
			else respond(404,data);
		});
	}
		
	//locally defined helper function
	//responds in error, and outputs to the console
	function respondErr(err){
		console.log("Handling error: ",err);
		if(err.code==="ENOENT"){
			serve404();
		}else{
			respond(400,err.message);
		}
	}
		
	//locally defined helper function
	//sends off the response message
	function respond(code, data){
		// content header
		res.writeHead(code, {'content-type': mime.lookup(filename)|| 'text/html'});
		// write message and signal communication is complete
		res.end(data);
	}	
	
};//end handle request