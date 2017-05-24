
function canvasMouseEnterHandler() {
	mouseOverCanvas = true;
}



function canvasMouseLeaveHandler() {
	mouseOverCanvas = false;
}



function canvasMouseDownHandler(e) {
	if(!searching) {
		mousePressed = true;
		elementRect = canvas.getBoundingClientRect();
		mouseX = e.pageX - elementRect.left;
		mouseY = e.pageY - elementRect.top;
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
		clearInterval(interval);
		interval = setInterval(renderFrame, 40);
		infoText = "Draw obstacles and click <strong>Find path</strong>.";
	}
}



function canvasMouseUpHandler() {
	mousePressed = false;
}



function canvasMouseMoveHandler(e) {
	elementRect = canvas.getBoundingClientRect();
	mouseX = e.pageX - elementRect.left;
	mouseY = e.pageY - elementRect.top;
	cellX = Math.floor(mouseX / cellSize);
	cellY = Math.floor(mouseY / cellSize);
	
	if(mousePressed) {
		if (matrix[cellY][cellX] === 0 && drawingMode) {
			matrix[cellY][cellX] = 1;
		} else if (matrix[cellY][cellX] === 1 && !drawingMode) {
			matrix[cellY][cellX] = 0;
		}
	}
}



function cuttingCornersCheckboxHandler() {
	allowCuttingCorders = !allowCuttingCorders;
	if (allowCuttingCorders) {
		$('#cuttingCornersCheckbox').html('<i style="font-size: 20px" class="fa fa-check" aria-hidden="true"></i>');
	} else {
		$('#cuttingCornersCheckbox').html('&nbsp;');
	}
}



function showStepsCheckboxHandler() {
	showSteps = !showSteps;
	if (showSteps) {
		$('#showStepsCheckbox').html('<i style="font-size: 20px" class="fa fa-check" aria-hidden="true"></i>');
		$('#speedSelectionDiv').css('display', 'block');
	} else {
		$('#showStepsCheckbox').html('&nbsp;');
		$('#speedSelectionDiv').css('display', 'none');
	}
}



function drawOptionHandler() {
	$('#removeOption').removeClass('activeOption');
	$('#drawOption').addClass('activeOption');
	drawingMode = true;
	
	if(disableDrawing && !searching) {
		clearInterval(interval);
		interval = setInterval(renderFrame, 40);
	}
}



function removeOptionHandler() {
	$('#drawOption').removeClass('activeOption');
	$('#removeOption').addClass('activeOption');
	drawingMode = false;
	
	if(disableDrawing && !searching) {
		clearInterval(interval);
		interval = setInterval(renderFrame, 40);
	}
}



function slowOptionHandler() {
	$('.speedOptionDiv').removeClass('activeOption');
	$('#slowOption').addClass('activeOption');
	animationSpeed = 1000;
}



function mediumOptionHandler() {
	$('.speedOptionDiv').removeClass('activeOption');
	$('#mediumOption').addClass('activeOption');
	animationSpeed = 100;
}



function fastOptionHandler() {
	$('.speedOptionDiv').removeClass('activeOption');
	$('#fastOption').addClass('activeOption');
	animationSpeed = 3;
}



function setStartButtonHandler() {
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
}



function setFinishButtonHandler() {
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
}



function resetButtonHandler() {
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
}



function findButtonHandler() {
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
		
		searching = false;
		$('#setFinishButton').attr('disabled', false);
		$('#setFinishButton').removeClass('disabledButton');
		$('#setStartButton').attr('disabled', false);
		$('#setStartButton').removeClass('disabledButton');
		$('#resetButton').attr('disabled', false);
		$('#resetButton').removeClass('disabledButton');
	}
}



// displaying a message in the bottom-left section
var infoInterval = setInterval(function() {
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