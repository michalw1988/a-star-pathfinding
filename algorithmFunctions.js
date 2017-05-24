// creating an empty matrix (map)
function createMatrix() {
	for (var y = 0; y < cellYCount; y++) {
		matrix[y] = [];
		for (var x = 0; x < cellXCount; x++) {
			matrix[y][x] = 0;
		}
	}
	matrix[startY][startX] = 'S';
	matrix[finishY][finishX] = 'F';
};



// calculating position in the grid when x and y are given
function calculatePosition(x, y) {
	var position = y * cellXCount + x;
	return position;
}



// adding neighbor nodes to "open list" if they are traversable
function addNeighborsToOpenList(node) {
	
	// data for each side
	var sides = [		
		{ xMin: 0, xMax: cellXCount, yMin: 0, yMax: cellYCount, xShift: -1, yShift: -1, side1X: -1, side1Y: 0, side2X: 0, side2Y: -1, gCost: 14 }, // NW
		{ xMin: -1, xMax: cellXCount, yMin: 0, yMax: cellYCount, xShift: 0, yShift: -1, side1X: 0, side1Y: 0, side2X: 0, side2Y: 0, gCost: 10 }, // N
		{ xMin: -1, xMax: cellXCount-1, yMin: 0, yMax: cellYCount, xShift: 1, yShift: -1, side1X: 0, side1Y: -1, side2X: 1, side2Y: 0, gCost: 14 }, // NE
		{ xMin: -1, xMax: cellXCount-1, yMin: -1, yMax: cellYCount, xShift: 1, yShift: 0, side1X: 0, side1Y: 0, side2X: 0, side2Y: 0, gCost: 10 }, // E
		{ xMin: -1, xMax: cellXCount-1, yMin: -1, yMax: cellYCount-1, xShift: 1, yShift: 1, side1X: 1, side1Y: 0, side2X: 0, side2Y: 1, gCost: 14 }, // SE
		{ xMin: -1, xMax: cellXCount, yMin: -1, yMax: cellYCount-1, xShift: 0, yShift: 1, side1X: 0, side1Y: 0, side2X: 0, side2Y: 0, gCost: 10 }, // S
		{ xMin: 0, xMax: cellXCount, yMin: -1, yMax: cellYCount-1, xShift: -1, yShift: 1, side1X: 0, side1Y: 1, side2X: -1, side2Y: 0, gCost: 14 }, // SW
		{ xMin: 0, xMax: cellXCount, yMin: -1, yMax: cellYCount, xShift: -1, yShift: 0, side1X: 0, side1Y: 0, side2X: 0, side2Y: 0, gCost: 10 } // W
	];
	
	// checking if a node is traversable for each side
	for (var i in sides) {
		var side = sides[i];		
		var nodeCanBeAdded = false;
		
		if (allowCuttingCorders) {
			if (node.x > side.xMin && 
					node.x < side.xMax && 
					node.y > side.yMin && 
					node.y < side.yMax
			) {
				nodeCanBeAdded = true;
			}	
		} else { // additional restrictions if cutting edges not allowed
			if (node.x > side.xMin && 
					node.x < side.xMax && 
					node.y > side.yMin && 
					node.y < side.yMax &&
					grid[calculatePosition(node.x + side.side1X, node.y + side.side1Y)].open &&
					grid[calculatePosition(node.x + side.side2X, node.y + side.side2Y)].open
			) {
				nodeCanBeAdded = true;
			}	
		}
		
		// if a node is traversable
		if (nodeCanBeAdded) {	
			var neighborNode = grid[calculatePosition(node.x + side.xShift, node.y + side.yShift)];
			
			// if a node has not been added to the "open list" yet
			if (neighborNode.open && !neighborNode.onOpenList && !neighborNode.onClosedList) {
			
				// add a node to the "open list", calculate its H, G, F costs and set parent
				neighborNode.hCost = (Math.abs(neighborNode.x - finishX) + Math.abs(neighborNode.y - finishY)) * 10;
				neighborNode.gCost = cumulatedGCost + side.gCost;
				neighborNode.fCost = neighborNode.hCost + neighborNode.gCost;
				neighborNode.parent = node.position;
				neighborNode.onOpenList = true;
				openList[calculatePosition(neighborNode.x, neighborNode.y)] = neighborNode;
				
			} else if (neighborNode.open && neighborNode.onOpenList && !neighborNode.onClosedList) { // if a node is on the "open list" already
				if (node.gCost + side.gCost < neighborNode.gCost) {
				
					// if G cost through current point is cheaper, update G and F costs, and change its parent node
					neighborNode.parent = node.position;
					neighborNode.gCost = node.gCost + side.gCost;
					neighborNode.fCost = neighborNode.hCost + neighborNode.gCost;
					
				}
			}
		}

	}
}



// finds a node with lowest F cost in the "open list"
function findNodeWithLowestFCost(position) {
	var lowestFCost = Number.POSITIVE_INFINITY;
	var nodeWithLowestFCost;
	
	for (var i in openList) {
		if (openList[i].fCost < lowestFCost) {
			lowestFCost = openList[i].fCost;
			nodeWithLowestFCost = openList[i];
		}
	}
	
	// also update cumulated G cost
	cumulatedGCost = nodeWithLowestFCost.gCost;
	
	return nodeWithLowestFCost;
}