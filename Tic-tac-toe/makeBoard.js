function makeBoard(size){
	var board = new Array(size);
	for(var i = 0; i < size; i++){
		board[i] = new Array(size);
	}
	return board;
}

module.exports.makeBoard = makeBoard;
