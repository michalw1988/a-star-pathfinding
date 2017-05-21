var width = 800;
var height = 500;
var cellSize = 20;
var cellXCount = width / cellSize;
var cellYCount = height / cellSize;

var canvas;
var ctx;

var matrix = [];
var grid = {};
var openList = {};
var closedList = {};
var current;
var cumulatedGCost;

var mousePressed = false;
var settingStartPoint = false;
var settingFinishPoint = false;

var startX = 1;
var startY = 1;
var finishX = cellXCount - 2;
var finishY = cellYCount - 2;

var searchFailed = false;

var showSteps = false;
var stepsInterval = 50;

var allowCuttingCorders = false;


$(document).ready(function () {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	createMatrix();
	
	var interval = setInterval(renderFrame, 40);
	
	$('#canvas').on('mousedown', function(e) {
		mousePressed = true;
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;
		var cellX = Math.floor(mouseX / cellSize);
		var cellY = Math.floor(mouseY / cellSize);
		
		if (settingStartPoint && matrix[cellY][cellX] !== 'F') {
			matrix[startY][startX] = 0;
			startX = cellX;
			startY = cellY;
			matrix[startY][startX] = 'S';
			settingStartPoint = false;
		} else if (settingFinishPoint && matrix[cellY][cellX] !== 'S') {
			matrix[finishY][finishX] = 0;
			finishX = cellX;
			finishY = cellY;
			matrix[finishY][finishX] = 'F';
			settingFinishPoint = false;
		} else if (matrix[cellY][cellX] === 0) {
			matrix[cellY][cellX] = 1;
		}
	});
	
	$('#canvas').on('mouseup', function() {
		mousePressed = false;
	});
		
	$('#canvas').on('mousemove', function(e) {
		if(mousePressed) {
			var mouseX = e.pageX - this.offsetLeft;
			var mouseY = e.pageY - this.offsetTop;
			var cellX = Math.floor(mouseX / cellSize);
			var cellY = Math.floor(mouseY / cellSize);
			if (matrix[cellY][cellX] === 0) {
				matrix[cellY][cellX] = 1;
			}
		}
	});
	
	$('#showStepsCheckbox').on('change', function() {
		showSteps = !showSteps;
	});
	
	$('#cuttingCornersCheckbox').on('change', function() {
		allowCuttingCorders = !allowCuttingCorders;
		console.log(allowCuttingCorders);
	});
	
	$('#setStartButton').on('click', function() {
		settingStartPoint = true;
	});
	
	$('#setFinishButton').on('click', function() {
		settingFinishPoint = true;
	});
	
	$('#resetButton').on('click', function(){
		startX = 1;
		startY = 1;
		finishX = cellXCount - 2;
		finishY = cellYCount - 2;
		
		matrix = [];
		grid = {};
		openList = {};
		closedList = {};
		current = null;
		cumulatedGCost = 0;
		
		console.log('resetted');
		
		createMatrix();
		
		clearInterval(interval);
		interval = setInterval(renderFrame, 40);
		
		$('#modifyButton').attr('disabled', true);
	});
	
	$('#modifyButton').on('click', function(){
		clearInterval(interval);
		interval = setInterval(renderFrame, 40);
		$('#modifyButton').attr('disabled', true);
	});
	
	$('#findButton').on('click', function(){
		renderFrame();
		
		clearInterval(interval);
		searchFailed = false;
		openList = {};
		closedList = {};
		cumulatedGCost = 0;
		
		grid = makeGrid(matrix);
		
		current = grid[calculatePosition(startX, startY)];	
		current.hCost = Math.abs(current.x - finishX) + Math.abs(current.y - finishY);
		current.gCost = 0;
		current.fCost = current.hCost + current.gCost;
		
		openList[calculatePosition(startX, startY)] = current;
		current.onOpenList = true;
		
		addNeighborsToOpenList(current);
		
		if (showSteps) {
			var searchingForPath = setInterval(function() {
				if (current.position !== calculatePosition(finishX, finishY) && !searchFailed) {
					delete openList[current.position];	
					current.onOpenList = false;
					closedList[current.position] = current;
					current.onClosedList = true;		
					addNeighborsToOpenList(current);			
					if (Object.keys(openList).length === 0) {
						searchFailed = true;
					} else {
						current = findNodeWithLowestFCost(current.position);
					}	
					renderStep();
				} else {
					clearInterval(searchingForPath);
						
					if (!searchFailed) {
						drawPath();
					} else {
						$('#infoLabel').text('Path does not exist');
					}
					
					$('#modifyButton').attr('disabled', false);
				}
			}, stepsInterval);
		} else {	
			while (current.position !== calculatePosition(finishX, finishY) && !searchFailed) {
				delete openList[current.position];	
				current.onOpenList = false;
				closedList[current.position] = current;
				current.onClosedList = true;		
				addNeighborsToOpenList(current);			
				if (Object.keys(openList).length === 0) {
					searchFailed = true;
				} else {
					current = findNodeWithLowestFCost(current.position);
				}		
			}
			
			if (!searchFailed) {
				drawPath();
			} else {
				$('#infoLabel').text('Path does not exist');
			}
			
			$('#modifyButton').attr('disabled', false);
		}

	});
	
});



function renderFrame() {
	ctx.fillStyle = '#222';
	ctx.strokeStyle = '#ddd';
	ctx.clearRect(0, 0, width, height);
	
	for (var y = 0; y < cellYCount; y++) {
		for (var x = 0; x < cellXCount; x++) {
			if (matrix[y][x] === 0) {
				ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
			} else if (matrix[y][x] === 'S') {		
				ctx.fillStyle = '#00d';
				ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
				ctx.fillStyle = '#222';
			} else if (matrix[y][x] === 'F') {
				ctx.fillStyle = '#f22';
				ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
				ctx.fillStyle = '#222';
			} else {
				ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
			}
		}
	}
};



// creates empty matrix (field)
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



// initiates grid for path-finding algorithm
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



// calculate position in the grid when x and y are given
function calculatePosition(x, y) {
	var position = y * cellXCount + x;
	return position;
}


function renderStep() {
	for (var i in openList) {
		ctx.fillStyle = '#90C3D4';
		ctx.fillRect(openList[i].x*cellSize+3, openList[i].y*cellSize+3, cellSize-6, cellSize-6);
	}
	
	for (var i in closedList) {	
		ctx.fillStyle = '#B3B3B3';
		ctx.fillRect(closedList[i].x*cellSize+3, closedList[i].y*cellSize+3, cellSize-6, cellSize-6);
	}
	
	ctx.fillStyle = '#14F500';
	ctx.fillRect(current.x*cellSize+5, current.y*cellSize+5, cellSize-10, cellSize-10);
}


// rendering each step of searching for right path
function renderStep_old() {
	ctx.fillStyle = '#222';
	ctx.strokeStyle = '#ddd';
	ctx.clearRect(0, 0, width, height);
	
	for (var y = 0; y < cellYCount; y++) {
		for (var x = 0; x < cellXCount; x++) {
			if (matrix[y][x] === 0) {
				ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
			} else if (matrix[y][x] === 'S') {		
				ctx.fillStyle = '#00d';
				ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
				ctx.fillStyle = '#222';
			} else if (matrix[y][x] === 'F') {
				ctx.fillStyle = '#f22';
				ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
				ctx.fillStyle = '#222';
			} else {
				ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
			}
		}
	}
	
	ctx.strokeStyle = '#0d0';
	ctx.strokeRect(current.x*cellSize, current.y*cellSize, cellSize, cellSize);
	ctx.fillText('Cumulated G: ' + cumulatedGCost, current.x*cellSize + 2, current.y*cellSize + 60);
	ctx.strokeStyle = '#ddd';

	for (var i in openList) {	
		ctx.fillStyle = '#999';
		ctx.fillText('#' + openList[i].position, openList[i].x*cellSize + 80, openList[i].y*cellSize + 12);
		ctx.fillText('F: ' + openList[i].fCost, openList[i].x*cellSize + 2, openList[i].y*cellSize + 12);
		ctx.fillText('G: ' + openList[i].gCost, openList[i].x*cellSize + 2, openList[i].y*cellSize + 24);
		ctx.fillText('H: ' + openList[i].hCost, openList[i].x*cellSize + 2, openList[i].y*cellSize + 36);
		ctx.fillText('parent: ' + openList[i].parent, openList[i].x*cellSize + 2, openList[i].y*cellSize + 48);
		ctx.fillText('OPEN', openList[i].x*cellSize + 2, openList[i].y*cellSize + 95);
		ctx.fillStyle = '#222';
	}
	
	for (var i in closedList) {	
		ctx.fillStyle = '#999';
		ctx.fillText('#' + closedList[i].position, closedList[i].x*cellSize + 80, closedList[i].y*cellSize + 12);
		ctx.fillText('F: ' + closedList[i].fCost, closedList[i].x*cellSize + 2, closedList[i].y*cellSize + 12);
		ctx.fillText('G: ' + closedList[i].gCost, closedList[i].x*cellSize + 2, closedList[i].y*cellSize + 24);
		ctx.fillText('H: ' + closedList[i].hCost, closedList[i].x*cellSize + 2, closedList[i].y*cellSize + 36);
		ctx.fillText('parent: ' + closedList[i].parent, closedList[i].x*cellSize + 2, closedList[i].y*cellSize + 48);
		ctx.fillText('CLOSED', closedList[i].x*cellSize + 2, closedList[i].y*cellSize + 95);
		ctx.fillStyle = '#222';
	}
	
}


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
	
	// check if node for each side can be added
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
		} else {
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
			
		if (nodeCanBeAdded) {	
			var neighborNode = grid[calculatePosition(node.x + side.xShift, node.y + side.yShift)];
			if (neighborNode.open && !neighborNode.onOpenList && !neighborNode.onClosedList) {
				neighborNode.hCost = (Math.abs(neighborNode.x - finishX) + Math.abs(neighborNode.y - finishY)) * 10;
				neighborNode.gCost = cumulatedGCost + side.gCost;
				neighborNode.fCost = neighborNode.hCost + neighborNode.gCost;
				neighborNode.parent = node.position;
				neighborNode.onOpenList = true;
				openList[calculatePosition(neighborNode.x, neighborNode.y)] = neighborNode;
			} else if (neighborNode.open && neighborNode.onOpenList && !neighborNode.onClosedList) {
				if (node.gCost + side.gCost < neighborNode.gCost) {
					neighborNode.parent = node.position;
					neighborNode.gCost = node.gCost + side.gCost;
					neighborNode.fCost = neighborNode.hCost + neighborNode.gCost;
				}
			}
		}

	}
}


function findNodeWithLowestFCost(position) {
	var lowestFCost = 99999;
	var nodeWithLowestFCost = null;
	for (var i in openList) {
		if (openList[i].fCost < lowestFCost) {
			lowestFCost = openList[i].fCost;
			nodeWithLowestFCost = openList[i];
		}
	}
	cumulatedGCost = nodeWithLowestFCost.gCost;
	return nodeWithLowestFCost;
}


// tracing back the path from start to finish
function drawPath() {
	renderFrame();

	ctx.strokeStyle = '#0d0';
	ctx.beginPath();
	ctx.moveTo((finishX + 1/2) * cellSize, (finishY + 1/2) * cellSize);

	var previous = grid[current.parent];
	ctx.lineTo((previous.x + 1/2) * cellSize, (previous.y + 1/2) * cellSize);	
	
	while (previous.parent) {
		previous = grid[previous.parent];
		ctx.lineTo((previous.x + 1/2) * cellSize, (previous.y + 1/2) * cellSize);	
	}
	
	ctx.stroke();
	ctx.strokeStyle = '#ddd';
}