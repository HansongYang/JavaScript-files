  $(document).ready(function(){
	var user = prompt("Hello, what is your name?");
	if(user === ""){
		user = "Bob";
	}
	var blocked = [];
	var socket = io();
	socket.on('connect', function(){
		socket.emit("intro", user);
	});
	
	$('#inputText').keypress(function(ev){
		if(ev.which===13){
		//send message
		socket.emit("message",$(this).val());
		ev.preventDefault(); //if any
		$("#chatLog").append((new Date()).toLocaleTimeString()+", "+user+": "+$(this).val()+"\n");
		$(this).val(""); //empty the input
		}
	});
	
	socket.on("message", function(data){
		$("#chatLog").append(data+"\n");
		$("#chatLog")[0].scrollTop=$('#chatLog')[0].scrollHeight; //scroll to the bottom;
	});
	
	$("#list").on("dblclick", "#clients", function(e){
		if(e.shiftKey){
			if($(this).css("text-decoration") === "line-through"){
				$(this).css({"text-decoration": ""});
				for(var i = 0; i < blocked.length; i++){
					if(blocked[i] === $(this).text()){
						blocked.splice(i, 1);
					}
				}				
			}
			else{
				blocked.push($(this).text());
				$(this).css({"text-decoration": "line-through"});
			}
			var info = {username:$(this).text()};
			socket.emit("blockUser", info);
		}
		else{
			var info = {username:$(this).text(), message: undefined};
			privateMessages(info);
		}
	});
	
	socket.on("list", function(data){
		$("#list").empty();
		$("#list").append("Users: " + '<br/>');		
		for(var i = 0; i < data.length; i++){
			$("#list").append("<ul class = '"+ i + "' id = 'clients'>" + data[i] + "</ul>");		
			for(var j = 0; j < blocked.length; j++){
				if(data[i] === blocked[j]){
					console.log(data[i]);
					$("."+ i).css({"text-decoration": "line-through"});
				}
			}
		}		
	});

	socket.on("privateMessage", function(data){
		privateMessages(data);
	});
	
	function privateMessages(data){
		var messages;
		if(data.message === undefined){
			messages = prompt("You are sending a private messgae to " + data.username + "."); 
		}
		else{
			messages = prompt("You have a new private message which sent by " + data.username +". Message: " + data.message);
		}
		if(messages != null){
			var info = {username: data.username, message: messages};
			socket.emit("privateMessage", info);
		}
	}
});