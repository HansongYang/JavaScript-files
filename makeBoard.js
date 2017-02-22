function makeBoard(size){
	//assume size%2==0
	
	items = [];
	for(var i=0;i<(size*size)/2;i++){
		items.push(i);
		items.push(i);
	}

	
	board = [];
	for(var i=0;i<size;i++){
		board[i]=[]
		for(var j=0;j<size;j++){
			var r = (Math.floor(Math.random()*items.length));
			board[i][j]= items.splice(r,1)[0];  //remove item r from the array
			
		}
	}
	return board;
}

module.exports.makeBoard = makeBoard;
