// http://www.policyalmanac.org/games/aStarTutorial_pl.htm //


var width = 1000;
var height = 600;
var cellSize = 20;
var cellXCount = width / cellSize;
var cellYCount = height / cellSize;

var mouseOverCanvas = false;

var mouseX;
var mouseY;
var cellX;
var cellY;
var elementRect;

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

var drawingMode = true;

var searching = false;
var disableDrawing = false;
var searchFailed = false;

var showSteps = false;
var animationSpeed = 50;

var allowCuttingCorders = false;

var infoText = "Draw obstacles and click <strong>Find path</strong>.";

var infoRGB = 100;
var increaseColor = true;


// colors
var backgroundColor = '#eee';
var gridColor = '#bbb';
var obstaclesColor = '#555';
var startPointColor = '#3F9FBF';
var finishPointColor = '#D14343';
var pathColor = '#555';
var openElementColor = '#AED7E6';
var closedElementColor = '#9BADB3';
var currentElementColor = '#80BA45';
var pointerColor = '#666';


//--------------------------------------------------------------------//

$(document).ready(function () {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	createMatrix();
	
	var interval = setInterval(renderFrame, 40);
	
	$('#canvas').on('mouseenter', function() {
		mouseOverCanvas = true;
	});
	
	$('#canvas').on('mouseleave', function() {
		mouseOverCanvas = false;
	});
	
	$('#canvas').on('mousedown', function(e) {
		if(!searching) {
			mousePressed = true;
			elementRect = canvas.getBoundingClientRect();
			mouseX = e.pageX - elementRect.x;
			mouseY = e.pageY - elementRect.y;
			cellX = Math.floor(mouseX / cellSize);
			cellY = Math.floor(mouseY / cellSize);
			
			if (settingStartPoint && matrix[cellY][cellX] !== 'F') {
				matrix[startY][startX] = 0;
				startX = cellX;
				startY = cellY;
				matrix[startY][startX] = 'S';
				settingStartPoint = false;
				infoText = "Draw obstacles and click <strong>Find path</strong>.";
				$('#resetButton').attr('disabled', false);
				$('#resetButton').removeClass('disabledButton');
				$('#findButton').attr('disabled', false);
				$('#findButton').removeClass('disabledButton');
				$('#setFinishButton').attr('disabled', false);
				$('#setFinishButton').removeClass('disabledButton');
				
			} else if (settingFinishPoint && matrix[cellY][cellX] !== 'S') {
				matrix[finishY][finishX] = 0;
				finishX = cellX;
				finishY = cellY;
				matrix[finishY][finishX] = 'F';
				settingFinishPoint = false;
				infoText = "Draw obstacles and click <strong>Find path</strong>.";
				$('#resetButton').attr('disabled', false);
				$('#resetButton').removeClass('disabledButton');
				$('#findButton').attr('disabled', false);
				$('#findButton').removeClass('disabledButton');
				$('#setStartButton').attr('disabled', false);
				$('#setStartButton').removeClass('disabledButton');
				
			} else if (matrix[cellY][cellX] === 0 && drawingMode) {
				matrix[cellY][cellX] = 1;
			} else if (matrix[cellY][cellX] === 1 && !drawingMode) {
				matrix[cellY][cellX] = 0;
			}
		}
		
		if (!searching && disableDrawing) {
			disableDrawing = false;
			//console.log('can draw now');
			clearInterval(interval);
			interval = setInterval(renderFrame, 40);
			infoText = "Draw obstacles and click <strong>Find path</strong>.";
		}
	});
	
	$('#canvas').on('mouseup', function() {
		mousePressed = false;
	});
		
	$('#canvas').on('mousemove', function(e) {
		elementRect = canvas.getBoundingClientRect();
		mouseX = e.pageX - elementRect.x;
		mouseY = e.pageY - elementRect.y;
		cellX = Math.floor(mouseX / cellSize);
		cellY = Math.floor(mouseY / cellSize);
		
		if(mousePressed) {
			if (matrix[cellY][cellX] === 0 && drawingMode) {
				matrix[cellY][cellX] = 1;
			} else if (matrix[cellY][cellX] === 1 && !drawingMode) {
				matrix[cellY][cellX] = 0;
			}
		}
	});
	
	
	$('#cuttingCornersCheckbox').on('click', function() {
		allowCuttingCorders = !allowCuttingCorders;
		if (allowCuttingCorders) {
			$('#cuttingCornersCheckbox').html('<i style="font-size: 20px" class="fa fa-check" aria-hidden="true"></i>');
		} else {
			$('#cuttingCornersCheckbox').html('&nbsp;');
		}
	});
	
	$('#showStepsCheckbox').on('click', function() {
		showSteps = !showSteps;
		if (showSteps) {
			$('#showStepsCheckbox').html('<i style="font-size: 20px" class="fa fa-check" aria-hidden="true"></i>');
			$('#speedSelectionDiv').css('display', 'block');
		} else {
			$('#showStepsCheckbox').html('&nbsp;');
			$('#speedSelectionDiv').css('display', 'none');
		}
	});
	
	
	$('#drawOption').on('click', function() {
		$('#removeOption').removeClass('activeOption');
		$('#drawOption').addClass('activeOption');
		drawingMode = true;
		
		if(disableDrawing && !searching) {
			clearInterval(interval);
			interval = setInterval(renderFrame, 40);
		}
	});
	
	$('#removeOption').on('click', function() {
		$('#drawOption').removeClass('activeOption');
		$('#removeOption').addClass('activeOption');
		drawingMode = false;
		
		if(disableDrawing && !searching) {
			clearInterval(interval);
			interval = setInterval(renderFrame, 40);
		}
	});
	
	
	$('#slowOption').on('click', function() {
		$('.speedOptionDiv').removeClass('activeOption');
		$('#slowOption').addClass('activeOption');
		animationSpeed = 1000;
	});
	
	$('#mediumOption').on('click', function() {
		$('.speedOptionDiv').removeClass('activeOption');
		$('#mediumOption').addClass('activeOption');
		animationSpeed = 100;
	});
	
	$('#fastOption').on('click', function() {
		$('.speedOptionDiv').removeClass('activeOption');
		$('#fastOption').addClass('activeOption');
		animationSpeed = 3;
	});
	
	
	
	
	$('#setStartButton').on('click', function() {
		settingStartPoint = true;
		infoText = "Click on the map to set start point.";
		
		$('#resetButton').attr('disabled', true);
		$('#resetButton').addClass('disabledButton');
		$('#findButton').attr('disabled', true);
		$('#findButton').addClass('disabledButton');
		$('#setFinishButton').attr('disabled', true);
		$('#setFinishButton').addClass('disabledButton');
		
		if(disableDrawing) {
			clearInterval(interval);
			interval = setInterval(renderFrame, 40);
		}
	});
	
	
	$('#setFinishButton').on('click', function() {
		settingFinishPoint = true;
		infoText = "Click on the map to set finish point.";
		
		$('#resetButton').attr('disabled', true);
		$('#resetButton').addClass('disabledButton');
		$('#findButton').attr('disabled', true);
		$('#findButton').addClass('disabledButton');
		$('#setStartButton').attr('disabled', true);
		$('#setStartButton').addClass('disabledButton');
		
		if(disableDrawing) {
			clearInterval(interval);
			interval = setInterval(renderFrame, 40);
		}
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
		
		createMatrix();
		
		clearInterval(interval);
		interval = setInterval(renderFrame, 40);
		
		infoText = "Draw obstacles and click <strong>Find path</strong>.";
	});

	
	$('#findButton').on('click', function(){
		//console.log('start searching');
		//console.log('cannot draw');
		searching = true;
		disableDrawing = true;
		infoText = 'Searching...';
		
		$('#setFinishButton').attr('disabled', true);
		$('#setFinishButton').addClass('disabledButton');
		$('#setStartButton').attr('disabled', true);
		$('#setStartButton').addClass('disabledButton');
		$('#resetButton').attr('disabled', true);
		$('#resetButton').addClass('disabledButton');
	
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
						infoText = 'Path found!';
					} else {
						infoText = 'Path does not exist.';
					}
					
					//console.log('stop searching');
					searching = false;
					$('#setFinishButton').attr('disabled', false);
					$('#setFinishButton').removeClass('disabledButton');
					$('#setStartButton').attr('disabled', false);
					$('#setStartButton').removeClass('disabledButton');
					$('#resetButton').attr('disabled', false);
					$('#resetButton').removeClass('disabledButton');
					
				}
			}, animationSpeed);
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
				infoText = 'Path found!';
			} else {
				infoText = 'Path does not exist.';
			}
			
			//console.log('stop searching');
			searching = false;
			$('#setFinishButton').attr('disabled', false);
			$('#setFinishButton').removeClass('disabledButton');
			$('#setStartButton').attr('disabled', false);
			$('#setStartButton').removeClass('disabledButton');
			$('#resetButton').attr('disabled', false);
			$('#resetButton').removeClass('disabledButton');
		}

	});
	
});



function renderFrame() {
	ctx.fillStyle = obstaclesColor;
	ctx.strokeStyle = gridColor;
	ctx.clearRect(0, 0, width, height);
	
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
	
	if(mouseOverCanvas) {
		if (settingStartPoint) {
			ctx.fillStyle = startPointColor;
		} else if (settingFinishPoint) {
			ctx.fillStyle = finishPointColor;
		} else if (drawingMode) {
			ctx.fillStyle = obstaclesColor;
		} else {
			ctx.fillStyle = backgroundColor;
		}
		if (calculatePosition(cellX, cellY) !== calculatePosition(startX, startY) &&
				calculatePosition(cellX, cellY) !== calculatePosition(finishX, finishY) 
		) {
			ctx.fillRect(cellX*cellSize, cellY*cellSize, cellSize, cellSize);
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
		ctx.fillStyle = openElementColor;
		ctx.fillRect(openList[i].x*cellSize+1, openList[i].y*cellSize+1, cellSize-2, cellSize-2);
		drawPointer(openList[i]);
	}
	
	for (var i in closedList) {	
		if(closedList[i].position !== calculatePosition(startX, startY)) {
		ctx.fillStyle = closedElementColor;
		ctx.fillRect(closedList[i].x*cellSize+1, closedList[i].y*cellSize+1, cellSize-2, cellSize-2);
		drawPointer(closedList[i]);
		}
	}

	//ctx.fillStyle = pathColor;
	//ctx.fillRect(current.x*cellSize+1, current.y*cellSize+1, cellSize-2, cellSize-2);
	ctx.strokeStyle = pathColor;
	ctx.strokeRect(current.x*cellSize+2, current.y*cellSize+2, cellSize-4, cellSize-4);
	
	drawPointer(current);
}


function drawPointer(node) {
	ctx.strokeStyle = pointerColor;

	var difference = 0;
	
	if(node.parent !== null) {
		ctx.beginPath();
		ctx.arc(node.x*cellSize+cellSize/2, node.y*cellSize+cellSize/2, cellSize/6, 0, 2 * Math.PI, false);
		ctx.stroke();
		
		difference = node.parent - node.position;
	}
	
	switch(difference) {
		case -width/cellSize-1:
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 1/5) * cellSize, (node.y + 1/5) * cellSize);
			ctx.stroke();
			break;
		case -width/cellSize:
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 1/2) * cellSize, (node.y + 1/5) * cellSize);
			ctx.stroke();
			break;
		case -width/cellSize+1:
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 3/4) * cellSize, (node.y + 1/4) * cellSize);
			ctx.stroke();
			break;
		case -1:
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 1/5) * cellSize, (node.y + 1/2) * cellSize);
			ctx.stroke();
			break;
		case 1:
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 4/5) * cellSize, (node.y + 1/2) * cellSize);
			ctx.stroke();
			break;
		case width/cellSize-1:
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 1/4) * cellSize, (node.y + 3/4) * cellSize);
			ctx.stroke();
			break;
		case width/cellSize:
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 1/2) * cellSize, (node.y + 4/5) * cellSize);
			ctx.stroke();
			break;
		case width/cellSize+1:
			ctx.beginPath();
			ctx.moveTo((node.x + 1/2) * cellSize, (node.y + 1/2) * cellSize);
			ctx.lineTo((node.x + 3/4) * cellSize, (node.y + 3/4) * cellSize);
			ctx.stroke();
			break;
		default:
			break;
	}
}


// rendering each step of searching for right path
/*
function renderStep_old() {
	ctx.fillStyle = '#222';
	ctx.strokeStyle = gridColor;
	ctx.clearRect(0, 0, width, height);
	
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
	
	ctx.strokeStyle = currentElementColor;
	ctx.strokeRect(current.x*cellSize, current.y*cellSize, cellSize, cellSize);
	ctx.fillText('Cumulated G: ' + cumulatedGCost, current.x*cellSize + 2, current.y*cellSize + 60);
	ctx.strokeStyle = gridColor;

	for (var i in openList) {	
		ctx.fillStyle = '#999';
		ctx.fillText('#' + openList[i].position, openList[i].x*cellSize + 80, openList[i].y*cellSize + 12);
		ctx.fillText('F: ' + openList[i].fCost, openList[i].x*cellSize + 2, openList[i].y*cellSize + 12);
		ctx.fillText('G: ' + openList[i].gCost, openList[i].x*cellSize + 2, openList[i].y*cellSize + 24);
		ctx.fillText('H: ' + openList[i].hCost, openList[i].x*cellSize + 2, openList[i].y*cellSize + 36);
		ctx.fillText('parent: ' + openList[i].parent, openList[i].x*cellSize + 2, openList[i].y*cellSize + 48);
		ctx.fillText('OPEN', openList[i].x*cellSize + 2, openList[i].y*cellSize + 95);
		ctx.fillStyle = gridColor;
	}
	
	for (var i in closedList) {	
		ctx.fillStyle = '#999';
		ctx.fillText('#' + closedList[i].position, closedList[i].x*cellSize + 80, closedList[i].y*cellSize + 12);
		ctx.fillText('F: ' + closedList[i].fCost, closedList[i].x*cellSize + 2, closedList[i].y*cellSize + 12);
		ctx.fillText('G: ' + closedList[i].gCost, closedList[i].x*cellSize + 2, closedList[i].y*cellSize + 24);
		ctx.fillText('H: ' + closedList[i].hCost, closedList[i].x*cellSize + 2, closedList[i].y*cellSize + 36);
		ctx.fillText('parent: ' + closedList[i].parent, closedList[i].x*cellSize + 2, closedList[i].y*cellSize + 48);
		ctx.fillText('CLOSED', closedList[i].x*cellSize + 2, closedList[i].y*cellSize + 95);
		ctx.fillStyle = gridColor;
	}
	
}
*/


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
	//renderFrame();
	
	ctx.fillStyle = startPointColor;
	ctx.fillRect(startX*cellSize, startY*cellSize, cellSize, cellSize);

	ctx.fillStyle = finishPointColor;
	ctx.fillRect(finishX*cellSize, finishY*cellSize, cellSize, cellSize);
	
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




var infoInterval = setInterval(function() {
	//var color = 'green';
	var color = 'rgba(' +infoRGB + ', ' + infoRGB + ', ' + infoRGB + ', 1)';
	$('#infoDiv').css('color', color);
	$('#infoDiv').html(infoText);
	
	if (increaseColor) {
		infoRGB += 5;
		if (infoRGB > 240) {
			increaseColor = false;
		}
	} else {
		infoRGB -= 5;
		if (infoRGB < 140) {
			increaseColor = true;
		}
	}
}, 50);