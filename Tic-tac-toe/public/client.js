var user = "";
var symbol,otherSymbol;
var size = 0;

$(document).ready(function(){
	user = prompt("Hello, what is your name?"); 
	if(user === ""){ 
		user = "Bob";
	}
	
	while(true){
		symbol = prompt("Hello, please choose 'x' or 'o' for your symbol");
		if(symbol === 'o'){
			otherSymbol = 'x';
			break;
		}else if(symbol === 'x'){
			otherSymbol = 'o';
			break;
		}
	}
  
  $.ajax({
		 type:"POST",
		 url:"/ttt/intro",
		 data: JSON.stringify({'username': user}),
		 success: displayGame,
		 dataType: 'json'
	 });
});

function displayGame(data){
	size = data.username.level + 3;
	for(var i = 0; i < size; i++){
		$("#gameboard").append($("<tr class='row" + i + "'>"));
		for(var j = size-1; j >= 0; j--){
			$(".row"+i).after($("<div class = 'tile' flip = '0' id = '" + i + "a" + j +"'></div>").css({"background-color" : "#0000FF"}));
		}
		$("#gameboard").append($("</tr>"));  
	}
	
	if(symbol === 'x'){
		alert("You play first.");
	}else{
		alert("Computer plays first.");
		otherPlay();
	}

	$(".tile").click(function(){
		if($(this).attr('flip') === '0' && !win()){
			play($(this).attr('id'), symbol);
			
			if(win()){
				setTimeout(function(){
					while(true){
						var choice = prompt("You win!!!!! Do you want to level up? (yes or no)");
						if(choice === "yes" || choice === "no"){
							break;
						}
					}
					
					$("#gameboard").empty();
					if(choice === "yes"){
						$.ajax({
							method: "GET",
							url:"/ttt/level",
							data: {'username': user},
							success: displayGame,
							dataType: 'json'
						});
					}
					else{
						displayGame(data);
					}
				}, 1000);
				return;
			}
			
			if(findMove() === -1){
				setTimeout(function(){				
					alert("Nice try! Tie game!!!");
					$("#gameboard").empty();
					displayGame(data);
				}, 1000);
				return;
			}

			otherPlay();
			
			if(win()){	
				setTimeout(function(){				
					alert("Oh!!!! You lost!!!!");
					$("#gameboard").empty();
					displayGame(data);
				}, 1000);
				return;
			}
				
			if(findMove() === -1){
				setTimeout(function(){
					alert("Nice try! Tie game!!!");
					$("#gameboard").empty();
					displayGame(data);
				}, 1000);
				return;
			}
		}
	});
}

function play(index, asymbol){
	$("#"+index).css({"background-color" : "#FFFFFF"});
	$("#"+index).attr("flip", "1");
	$("#"+index).text(asymbol).css({"color": "red", "font-family" : "cursive", "font-size" : "50px", "vertical-align" : "text-top"});
}

function otherPlay(){			
	if(findWinningMove() !== -1){
		var index = findWinningMove();
		$("#"+index).css({"background-color" : "#FFFFFF"});
		$("#"+index).attr("flip", "1");
		$("#"+index).text(otherSymbol).css({"color": "red", "font-family" : "cursive", "font-size" : "50px", "vertical-align" : "text-top"});
	}else if(findBlockingMove() !== -1){
		var index = findBlockingMove();
		$("#"+index).css({"background-color" : "#FFFFFF"});
		$("#"+index).attr("flip", "1");
		$("#"+index).text(otherSymbol).css({"color": "red","font-family" : "cursive", "font-size" : "50px", "vertical-align" : "text-top"});
	}else{
		play(findMove(), otherSymbol);
	}
}

function win(){
	var count, count2 = 0;
	//Checking the horizontal of the board.
	for(var i = 0; i < size; i++){
		for(var j = 0; j < size; j++){
			if($("#"+i+"a"+j).text() === 'x'){
				count++;
			}else if($("#"+i+"a"+j).text() === 'o'){
				count2++;
			}
		}
		if(count === size || count2 === size){
			return true;
		}else{
			count = 0;
			count2 = 0;
		}
	}
	
	//Checking the vertical of the board.
	for(var j = 0; j < size; j++){
		for(var i = 0; i < size; i++){
			if($("#"+i+"a"+j).text() === 'x'){
				count++;
			}
			else if($("#"+i+"a"+j).text() === 'o'){
				count2++;
			}
		}
		if(count === size || count2 === size){
			return true;
		}else{
			count = 0;
			count2= 0;
		}
	}
	
	//Checking the diagonal of the board.
	for(var i = 0; i < size; i++){
		if($("#"+i+"a"+i).text() === 'x'){
			count++;
		}
		else if($("#"+i+"a"+i).text() === 'o'){
			count2++;
		}
	}
	
	if(count === size || count2 === size){
		return true;
	}else{
		count = 0;
		count2= 0;
	}
	
	for(var i = 0, j = size-1; i < size && j >= 0; i++, j--){
		if($("#"+i+"a"+j).text() === 'x'){
			count++;
		}
		else if($("#"+i+"a"+j).text() === 'o'){
			count2++;
		}
	}
	
	if(count === size || count2 === size){
		return true;
	}else{
		count = 0;
		count2= 0;
	}
	return false;
}

function findBlockingMove(){
	var count = 0;
	if(otherSymbol === 'x'){
		//Checking the horizontal of the board.
		for(var i = 0; i < size; i++){
			for(var j = 0; j < size; j++){
				if($("#"+i+"a"+j).text() === 'o'){
					count++;
				}
			}
			if(count === size-1){
				for(var k = 0; k < size; k++){
					if($("#"+i+"a"+k).text() !== 'o' && $("#"+i+"a"+k).text() !== 'x'){
						var index = i+"a"+k;
						return index;
					}
				}
			}
			count = 0;
		}
		
		//Checking the vertical of the board.
		for(var j = 0; j < size; j++){
			for(var i = 0; i < size; i++){
				if($("#"+i+"a"+j).text() === 'o'){
					count++;
				}
			}
			if(count === size-1){
				for(var k = 0; k < size; k++){
					if($("#"+k+"a"+j).text() !== 'o' && $("#"+k+"a"+j).text() !== 'x'){
						var index = k+"a"+j;
						return index;
					}
				}
			}
			count = 0;
		}
		
		//Checking the diagonal of the board.
		for(var i = 0; i < size; i++){
			if($("#"+i+"a"+i).text() === 'o'){
				count++;
			}
		}
		
		if(count === size-1){
			for(var i = 0; i < size; i++){
				if($("#"+i+"a"+i).text() !== 'o' && $("#"+i+"a"+i).text() !== 'x'){
					var index = i+"a"+i;
					return index;
				}
			}
		}
		count = 0;
		
		for(var i = 0, j = size-1; i < size && j >= 0; i++, j--){
			if($("#"+i+"a"+j).text() === 'o'){
				count++;
			}
		}
		
		if(count === size-1){
			for(var i = 0, j = size-1; i < size && j >= 0; i++, j--){
				if($("#"+i+"a"+j).text() !== 'o' && $("#"+i+"a"+j).text() !== 'x'){
					var index = i+"a"+j;
					return index;
				}
			}
		}
		count = 0;
	}else{
		//Checking the horizontal of the board.
		for(var i = 0; i < size; i++){
			for(var j = 0; j < size; j++){
				if($("#"+i+"a"+j).text() === 'x'){
					count++;
				}
			}
			if(count === size-1){
				for(var k = 0; k < size; k++){
					if($("#"+i+"a"+k).text() !== 'o' && $("#"+i+"a"+k).text() !== 'x'){
						var index = i+"a"+k;
						return index;
					}
				}
			}
			count = 0;
		}
		
		//Checking the vertical of the board.
		for(var j = 0; j < size; j++){
			for(var i = 0; i < size; i++){
				if($("#"+i+"a"+j).text() === 'x'){
					count++;
				}
			}
			if(count === size-1){
				for(var k = 0; k < size; k++){
					if($("#"+k+"a"+j).text() !== 'o' && $("#"+k+"a"+j).text() !== 'x'){
						var index = k+"a"+j;
						return index;
					}
				}
			}
			count = 0;
		}
		
		//Checking the diagonal of the board.
		for(var i = 0; i < size; i++){
			if($("#"+i+"a"+i).text() === 'x'){
				count++;
			}
		}
		
		if(count === size-1){
			for(var i = 0; i < size; i++){
				if($("#"+i+"a"+i).text() !== 'o' && $("#"+i+"a"+i).text() !== 'x'){
					var index = i+"a"+i;
					return index;
				}
			}
		}
		count = 0;
		
		for(var i = 0, j = size-1; i < size && j >= 0; i++, j--){
			if($("#"+i+"a"+j).text() === 'x'){
				count++;
			}
		}
		
		if(count === size-1){
			for(var i = 0, j = size-1; i < size && j >= 0; i++, j--){
				if($("#"+i+"a"+j).text() !== 'o' && $("#"+i+"a"+j).text() !== 'x'){
					var index = i+"a"+j;
					return index;
				}
			}
		}
		count = 0;
	}
	return -1;
}

function findWinningMove(){
	var count = 0;
	if(otherSymbol === 'o'){
		//Checking the horizontal of the board.
		for(var i = 0; i < size; i++){
			for(var j = 0; j < size; j++){
				if($("#"+i+"a"+j).text() === 'o'){
					count++;
				}
			}
			if(count === size-1){
				for(var k = 0; k < size; k++){
					if($("#"+i+"a"+k).text() !== 'o' && $("#"+i+"a"+k).text() !== 'x'){
						var index = i+"a"+k;
						return index;
					}
				}
			}
			count = 0;
		}
		
		//Checking the vertical of the board.
		for(var j = 0; j < size; j++){
			for(var i = 0; i < size; i++){
				if($("#"+i+"a"+j).text() === 'o'){
					count++;
				}
			}
			if(count === size-1){
				for(var k = 0; k < size; k++){
					if($("#"+k+"a"+j).text() !== 'o' && $("#"+k+"a"+j).text() !== 'x'){
						var index = k+"a"+j;
						return index;
					}
				}
			}
			count = 0;
		}
		
		//Checking the diagonal of the board.
		for(var i = 0; i < size; i++){
			if($("#"+i+"a"+i).text() === 'o'){
				count++;
			}
		}
		
		if(count === size-1){
			for(var i = 0; i < size; i++){
				if($("#"+i+"a"+i).text() !== 'o' && $("#"+i+"a"+i).text() !== 'x'){
					var index = i+"a"+i;
					return index;
				}
			}
		}
		count = 0;
		
		for(var i = 0, j = size-1; i < size && j >= 0; i++, j--){
			if($("#"+i+"a"+j).text() === 'o'){
				count++;
			}
		}
		
		if(count === size-1){
			for(var i = 0, j = size-1; i < size && j >= 0; i++, j--){
				if($("#"+i+"a"+j).text() !== 'o' && $("#"+i+"a"+j).text() !== 'x'){
					var index = i+"a"+j;
					return index;
				}
			}
		}
		count = 0;
	}else{
		//Checking the horizontal of the board.
		for(var i = 0; i < size; i++){
			for(var j = 0; j < size; j++){
				if($("#"+i+"a"+j).text() === 'x'){
					count++;
				}
			}
			if(count === size-1){
				for(var k = 0; k < size; k++){
					if($("#"+i+"a"+k).text() !== 'o' && $("#"+i+"a"+k).text() !== 'x'){
						var index = i+"a"+k;
						return index;
					}
				}
			}
			count = 0;
		}
		
		//Checking the vertical of the board.
		for(var j = 0; j < size; j++){
			for(var i = 0; i < size; i++){
				if($("#"+i+"a"+j).text() === 'x'){
					count++;
				}
			}
			if(count === size-1){
				for(var k = 0; k < size; k++){
					if($("#"+k+"a"+j).text() !== 'o' && $("#"+k+"a"+j).text() !== 'x'){
						var index = k+"a"+j;
						return index;
					}
				}
			}
			count = 0;
		}
		
		//Checking the diagonal of the board.
		for(var i = 0; i < size; i++){
			if($("#"+i+"a"+i).text() === 'x'){
				count++;
			}
		}
		
		if(count === size-1){
			for(var i = 0; i < size; i++){
				if($("#"+i+"a"+i).text() !== 'o' && $("#"+i+"a"+i).text() !== 'x'){
					var index = i+"a"+i;
					return index;
				}
			}
		}
		count = 0;
		
		for(var i = 0, j = size-1; i < size && j >= 0; i++, j--){
			if($("#"+i+"a"+j).text() === 'x'){
				count++;
			}
		}
		
		if(count === size-1){
			for(var i = 0, j = size-1; i < size && j >= 0; i++, j--){
				if($("#"+i+"a"+j).text() !== 'o' && $("#"+i+"a"+j).text() !== 'x'){
					var index = i+"a"+j;
					return index;
				}
			}
		}
		count = 0;
	}
	return -1;
}

function findMove(){
	for(var i = 0; i < size; i++){
		for(var j = 0 ; j < size; j++){
			if($("#"+i+"a"+j).text() !== 'o' && $("#"+i+"a"+j).text() !== 'x'){
				var index = i+"a"+j;
				return index;
			}
		}
	}
	return -1;
}