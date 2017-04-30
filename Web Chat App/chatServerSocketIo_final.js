/*SocketIO based chat room. Extended to not echo messages
to the client that sent them.*/

var mime = require('mime-types');
var http = require('http').createServer(handler);
var io = require('socket.io')(http);
var fs = require('fs');
var url = require('url');
var ROOT = "./public";
http.listen(2406);

console.log("Chat server listening on port 2406");


function handler(req,res){
	console.log(req.method + " request for: " + req.url);
	
	//parse the url
	var urlObj = url.parse(req.url,true);
	var filename = ROOT+urlObj.pathname;
	var data = "";
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
	
	//locally defined helper function
	//serves 404 files 
	function serve404(){
		fs.readFile(ROOT+"/404.html","utf8",function(err,data){ //async
			if(err)respond(500,err.message);
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
			respond(500,err.message);
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
};

var clients = [];
io.on("connection", function(socket){
	console.log("Got a connection");
	socket.on("intro",function(data){
		socket.username = data;
		socket.blockedClients = [];
		clients.push(socket);
		socket.broadcast.emit("message", timestamp()+": "+socket.username+" has entered the chatroom.");
		socket.emit("message","Welcome, "+socket.username+".");
		io.emit("list", getUserList());
	});
		
	socket.on("message", function(data){
		console.log("got message: "+ data);
		var block = false;
		for(var i = 0 ; i < clients.length; i++){
			block = false;
			for(var j = 0; j < clients[i].blockedClients.length; j++){
				if(clients[i].blockedClients[j] === socket.username){					
					block = true;
					break;
				}
			}
			if(clients[i].username != socket.username && block === false){
				clients[i].emit("message",timestamp()+", "+socket.username+": "+data);
			}
		}
	});

	socket.on("disconnect", function(){
		console.log(socket.username+" disconnected");
		io.emit("message", timestamp()+": "+socket.username+" disconnected.");
		clients = clients.filter(function(ele){  //remove from clients array
			return ele!==socket;
		});
		io.emit("list", getUserList());
	});
	
	socket.on("privateMessage", function(data){
		var block = false;		
		for(var i = 0; i < clients.length; i++){
			if(clients[i].username === data.username){
				for(var j = 0; j < clients[i].blockedClients.length; j++){
					if(clients[i].blockedClients[j] === socket.username){
						block = true;
						break;
					}
				}
			}
		}
		if(block === false){
			for(var i = 0; i < clients.length; i++){
				if(clients[i].username === data.username){
					data.username = socket.username;
					console.log(data.username + " got a Private message.");
					clients[i].emit("privateMessage", data);
					break;
				}
			}
		}
	});
	
	socket.on("blockUser", function(data){
		var block = false;
		for(var i = 0; i < socket.blockedClients.length; i++){
			if(socket.blockedClients[i] === data.username){
				block = true; 
				break;
			}
		}
		
		if(block === false){
			socket.blockedClients.push(data.username);
		    console.log(data.username + " has been blocked.");
			socket.emit("message",data.username+" has been blocked");
		}
		else{
			console.log(data.username + " has been unblocked.");
			socket.emit("message", data.username + " has been unblocked");
		    socket.blockedClients = socket.blockedClients.filter(function(ele){ //remove from that client's blocked array
				return ele!== data.username;
			});
		}
	});
});

function getUserList(){
    var ret = [];
    for(var i=0;i<clients.length;i++){
        ret.push(clients[i].username);
    }
    return ret;
}

function timestamp(){
	return new Date().toLocaleTimeString();
}