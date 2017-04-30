var user = "";
var numOfClick = 0;
var guesses = 0;
var prevNumber = 0;
var prevTile, complete;

$(document).ready(function(){
	user = prompt("Hello, what is your name?"); 
	if(user === ""){ 
		user = "Bob";
	}
   $.ajax({
     type:"POST",
	 url:"/memory/intro",
	 data: JSON.stringify({'username': user}),
	 success: displayGame,
	 dataType: 'json'
	 });
});

function displayGame(data){
	complete = 2*(data.username.level+1)*(data.username.level+1); 
	var size = (data.username.level + 1) * 2; 
	for(var i = 0; i < size; i++){
		$("#gameboard").append($("<tr class='row" + i + "'>"));
	     for(var j = size-1; j >= 0; j--){
			 $(".row"+i).after($("<div class = 'tile' flip = '0' id = '" + i + "a" + j +"'></div>").css({"background-color" : "#0000FF", 
			 "-webkit-transition": "-webkit-transform 0.3s", "transition": "transform 0.3s"}));
		}
		$("#gameboard").append($("</tr>"));  
	}
	$(".tile").click(function(){
		if($(this).attr('flip') === '0' && numOfClick < 2){
			chooseTile($(this).attr('id'));
		}
	});
}

function chooseTile(index){
    $.ajax({
     method:"GET",
	 url:"/memory/card",
	 data: {'username': user, "choice": index},
	 success: displayNumber,
	 dataType: 'json'
	 });
} 

function displayNumber(data){
	numOfClick++;
	var number = data.username.chosen; 
	var currentTile =  '#' + data.username.row+'a'+data.username.column;

	$(currentTile).css({"background-color":"#FFFFFF", "-webkit-transform": "rotateY(-180deg)", "transform": "rotateY(-180deg)"});
	$(currentTile).attr("flip", "1");
	$(currentTile).text(data.username.chosen).css({"color" : "#000000"});
	
	if(numOfClick == 2){
		guesses++;
		if(prevNumber == number){
			complete--;
			numOfClick = 0;
			if(complete == 0){
				$("#gameboard").empty();
				alert("Win!!! You guessed " + guesses + " times in this game.");
				$.ajax({
					method: "GET",
					url:"/memory/level",
					data: {'username': user},
					success: displayGame,
					dataType: 'json'
				});
			}
		}
		else{
			setTimeout(function(){
				$(prevTile).css({"background-color":"#0000FF", "-webkit-transform": "", "transform": ""});
				$(prevTile).attr("flip", "0");
				$(prevTile).text("");				
				$(currentTile).css({"background-color":"#0000FF", "-webkit-transform": "", "transform": ""});
				$(currentTile).attr("flip", "0");
				$(currentTile).text("");
				numOfClick = 0;
			},800);
		}
	}
    else{
		prevNumber = number;
		prevTile = currentTile; 
	}
}