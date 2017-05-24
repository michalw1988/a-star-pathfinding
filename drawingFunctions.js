// refreshing the canvas (map) in every interval
function renderFrame() {
	ctx.fillStyle = obstaclesColor;
	ctx.strokeStyle = gridColor;
	ctx.clearRect(0, 0, width, height);
	
	// drawing objects on the map
	// 0 - nothing (just the grid)
	// 1 - obstacles
	// 'S' - start point
	// 'F' - finish point
	for (var y = 0; y < cellYCount; y++) {
		for (var x = 0; x < cellXCount; x++) {
			if (matrix[y][x] === 0) {
				ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
			} else if (matrix[y][x] === 'S') {		
				ctx.fillStyle = startPointColor;
				ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
				ctx.fillStyle = obstaclesColor;
			} else if (matrix[y][x] === 'F') {
				ctx.fillStyle = finishPointColor;
				ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
				ctx.fillStyle = obstaclesColor;
			} else {
				ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
			}
		}
	}
	
	// displaying a "pixel" below the mouse cursor
	if(mouseOverCanvas) {
	
		// choosing color for "pixel" based on what action user can do in given moment
		if (settingStartPoint) {
			ctx.fillStyle = startPointColor;
		} else if (settingFinishPoint) {
			ctx.fillStyle = finishPointColor;
		} else if (drawingMode) {
			ctx.fillStyle = obstaclesColor;
		} else {
			ctx.fillStyle = backgroundColor;
		}
		
		// "pixels" can be displayed only if its position is not over the start or the finish points
		if (calculatePosition(cellX, cellY) !== calculatePosition(startX, startY) &&
				calculatePosition(cellX, cellY) !== calculatePosition(finishX, finishY) 
		) {
			ctx.fillRect(cellX*cellSize, cellY*cellSize, cellSize, cellSize);
		}
	}
	
};



// initiating the grid for path-finding algorithm (based on the map's matrix)
function makeGrid(matrix) {
	var position = 0;
	var grid = {};
	
	for (var y = 0; y < matrix.length; y++) {
		for (var x = 0; x < matrix[y].length; x++) {
			grid[position] = {
				position: position,
				x: x,
				y: y,
				gCost: 0,
				hCost: 0,
				fCost: 0,
				parent: null,
				open: (matrix[y][x] !== 1) ? true : false,
				onOpenList: false,
				onClosedList: false
			}
			position++;
		}
	}
	
	return grid;
};



// drawing a single step of grid traversing
function renderStep() {

	// drawing elements from the "open list"
	for (var i in openList) {
		ctx.fillStyle = openElementColor;
		ctx.fillRect(openList[i].x*cellSize+1, openList[i].y*cellSize+1, cellSize-2, cellSize-2);
		drawParentPointer(openList[i]);
	}
	
	// drawing elements from the "closed list"
	for (var i in closedList) {	
		if(closedList[i].position !== calculatePosition(startX, startY)) {
		ctx.fillStyle = closedElementColor;
		ctx.fillRect(closedList[i].x*cellSize+1, closedList[i].y*cellSize+1, cellSize-2, cellSize-2);
		drawParentPointer(closedList[i]);
		}
	}

	// drawing currently checked element
	ctx.strokeStyle = pathColor;
	ctx.strokeRect(current.x*cellSize+2, current.y*cellSize+2, cellSize-4, cellSize-4);
	
	// drawing all pointers to parent nodes
	drawParentPointer(current);
}



// drawing a pointer to parent node (small circle and line)
function drawParentPointer(node) {
	ctx.strokeStyle = parentPointerColor;

	var difference = 0; // difference between node's parent's position in the grid and node's position
	
	if (node.parent !== null) {
		// draw a circle
		ctx.beginPath();
		ctx.arc(node.x*cellSize+cellSize/2, node.y*cellSize+cellSize/2, cellSize/6, 0, 2 * Math.PI, false);
		ctx.stroke();	
		// calculate the difference
		difference = node.parent - node.position;
	}
	
	// drawing a line to proper direction
	switch (difference) {
		case -width/cellSize-1: //NW
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 1/5) * cellSize, (node.y + 1/5) * cellSize);
			ctx.stroke();
			break;
		case -width/cellSize: // N
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 1/2) * cellSize, (node.y + 1/5) * cellSize);
			ctx.stroke();
			break;
		case -width/cellSize+1: // NE
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 3/4) * cellSize, (node.y + 1/4) * cellSize);
			ctx.stroke();
			break;
		case -1: // W
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 1/5) * cellSize, (node.y + 1/2) * cellSize);
			ctx.stroke();
			break;
		case 1: // E
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 4/5) * cellSize, (node.y + 1/2) * cellSize);
			ctx.stroke();
			break;
		case width/cellSize-1: // SW
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 1/4) * cellSize, (node.y + 3/4) * cellSize);
			ctx.stroke();
			break;
		case width/cellSize: // S
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 1/2) * cellSize, (node.y + 4/5) * cellSize);
			ctx.stroke();
			break;
		case width/cellSize+1: // SE
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 3/4) * cellSize, (node.y + 3/4) * cellSize);
			ctx.stroke();
			break;
		default:
			break;
	}
}



// tracing back the path from start to finish and drawing it
function drawPath() {

	// drawing start and finish points
	ctx.fillStyle = startPointColor;
	ctx.fillRect(startX*cellSize, startY*cellSize, cellSize, cellSize);
	ctx.fillStyle = finishPointColor;
	ctx.fillRect(finishX*cellSize, finishY*cellSize, cellSize, cellSize);
	
	// drawing the path
	ctx.strokeStyle = pathColor;
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo((finishX + 1/2) * cellSize, (finishY + 1/2) * cellSize);

	var previous = grid[current.parent];
	ctx.lineTo((previous.x + 1/2) * cellSize, (previous.y + 1/2) * cellSize);	
	
	while (previous.parent || previous.parent === 0) {
		previous = grid[previous.parent];
		ctx.lineTo((previous.x + 1/2) * cellSize, (previous.y + 1/2) * cellSize);	
	}
	
	ctx.stroke();
	ctx.strokeStyle = gridColor;
	ctx.lineWidth = 1;
}