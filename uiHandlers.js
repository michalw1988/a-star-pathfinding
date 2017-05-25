// if mouse entered canvas
function canvasMouseEnterHandler() {
	mouseOverCanvas = true;
}



// if mouse left canvas
function canvasMouseLeaveHandler() {
	mouseOverCanvas = false;
}



// if mouse button pressed
function canvasMouseDownHandler(e) {
	if(!searching) {
		mousePressed = true;
		
		// calculating mouse position and map's cell based on that position
		elementRect = canvas.getBoundingClientRect();
		mouseX = e.pageX - elementRect.left;
		mouseY = e.pageY - elementRect.top;
		cellX = Math.floor(mouseX / cellSize);
		cellY = Math.floor(mouseY / cellSize);
		
		// setting start point
		if (settingStartPoint && matrix[cellY][cellX] !== 'F') {
			matrix[startY][startX] = 0;
			startX = cellX;
			startY = cellY;
			matrix[startY][startX] = 'S';
			settingStartPoint = false;
			
			// enabling buttons and updating app message
			infoText = "Draw obstacles and click <strong>Find path</strong>.";
			$('#resetButton').attr('disabled', false);
			$('#resetButton').removeClass('disabledButton');
			$('#findButton').attr('disabled', false);
			$('#findButton').removeClass('disabledButton');
			$('#setFinishButton').attr('disabled', false);
			$('#setFinishButton').removeClass('disabledButton');
			
		} else if (settingFinishPoint && matrix[cellY][cellX] !== 'S') { // setting finish point
			matrix[finishY][finishX] = 0;
			finishX = cellX;
			finishY = cellY;
			matrix[finishY][finishX] = 'F';
			settingFinishPoint = false;
			
			// enabling buttons and updating app message
			infoText = "Draw obstacles and click <strong>Find path</strong>.";
			$('#resetButton').attr('disabled', false);
			$('#resetButton').removeClass('disabledButton');
			$('#findButton').attr('disabled', false);
			$('#findButton').removeClass('disabledButton');
			$('#setStartButton').attr('disabled', false);
			$('#setStartButton').removeClass('disabledButton');
			
		} else if (matrix[cellY][cellX] === 0 && drawingMode) { // setting obstacle
			matrix[cellY][cellX] = 1;
		} else if (matrix[cellY][cellX] === 1 && !drawingMode) { // removing obstacle
			matrix[cellY][cellX] = 0;
		}
	}
	
	// when search is completed and the canvas is clicked, drawing is enabled again
	if (!searching && disableDrawing) {
		disableDrawing = false;
		clearInterval(interval);
		interval = setInterval(renderFrame, 40);
		infoText = "Draw obstacles and click <strong>Find path</strong>.";
	}
}



// if mouse button up
function canvasMouseUpHandler() {
	mousePressed = false;
}



// if mouse moved
function canvasMouseMoveHandler(e) {
	// calculating mouse position and map's cell based on that position
	elementRect = canvas.getBoundingClientRect();
	mouseX = e.pageX - elementRect.left;
	mouseY = e.pageY - elementRect.top;
	cellX = Math.floor(mouseX / cellSize);
	cellY = Math.floor(mouseY / cellSize);
	
	// adding or removing obstacles (based on drawing mode)
	if(mousePressed) {
		if (matrix[cellY][cellX] === 0 && drawingMode) {
			matrix[cellY][cellX] = 1;
		} else if (matrix[cellY][cellX] === 1 && !drawingMode) {
			matrix[cellY][cellX] = 0;
		}
	}
}



// checking or unchecking "cutting through corners" checkbox
function cuttingCornersCheckboxHandler() {
	allowCuttingCorders = !allowCuttingCorders;
	if (allowCuttingCorders) {
		$('#cuttingCornersCheckbox').html('<i style="font-size: 20px" class="fa fa-check" aria-hidden="true"></i>');
	} else {
		$('#cuttingCornersCheckbox').html('&nbsp;');
	}
}



// checking or unchecking "show algorithm step" checkbox and showing / hiding additional options
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



// selecting drawing mode
function drawOptionHandler() {
	$('#removeOption').removeClass('activeOption');
	$('#drawOption').addClass('activeOption');
	drawingMode = true;
	
	// if drawing was disabled during path-finding, enabling it again
	if(disableDrawing && !searching) {
		clearInterval(interval);
		interval = setInterval(renderFrame, 40);
	}
}



// selecting removing mode
function removeOptionHandler() {
	$('#drawOption').removeClass('activeOption');
	$('#removeOption').addClass('activeOption');
	drawingMode = false;
	
	// if drawing was disabled during path-finding, enabling it again
	if(disableDrawing && !searching) {
		clearInterval(interval);
		interval = setInterval(renderFrame, 40);
	}
}



// selecting slow algorithm visualisation
function slowOptionHandler() {
	$('.speedOptionDiv').removeClass('activeOption');
	$('#slowOption').addClass('activeOption');
	animationSpeed = 1000;
}



// selecting medium algorithm visualisation
function mediumOptionHandler() {
	$('.speedOptionDiv').removeClass('activeOption');
	$('#mediumOption').addClass('activeOption');
	animationSpeed = 100;
}



// selecting fast algorithm visualisation
function fastOptionHandler() {
	$('.speedOptionDiv').removeClass('activeOption');
	$('#fastOption').addClass('activeOption');
	animationSpeed = 3;
}



// if "set start point" button has been pressed, entering "setting start point" mode and disabling other buttons
function setStartButtonHandler() {
	settingStartPoint = true;
	infoText = "Click on the map to set start point.";
	
	$('#resetButton').attr('disabled', true);
	$('#resetButton').addClass('disabledButton');
	$('#findButton').attr('disabled', true);
	$('#findButton').addClass('disabledButton');
	$('#setFinishButton').attr('disabled', true);
	$('#setFinishButton').addClass('disabledButton');
	
	// if drawing was disabled during path-finding, enabling it again
	if(disableDrawing) {
		clearInterval(interval);
		interval = setInterval(renderFrame, 40);
	}
}



// if "set finish point" button has been pressed, entering "setting finish point" mode and disabling other buttons
function setFinishButtonHandler() {
	settingFinishPoint = true;
	infoText = "Click on the map to set finish point.";
	
	$('#resetButton').attr('disabled', true);
	$('#resetButton').addClass('disabledButton');
	$('#findButton').attr('disabled', true);
	$('#findButton').addClass('disabledButton');
	$('#setStartButton').attr('disabled', true);
	$('#setStartButton').addClass('disabledButton');
	
	// if drawing was disabled during path-finding, enabling it again
	if(disableDrawing) {
		clearInterval(interval);
		interval = setInterval(renderFrame, 40);
	}
}



// if "reset" button has been pressed, map is cleared and the algorithm is restarted
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



// if "reset" button has been pressed, the path from start point to finish point is calculated
function findButtonHandler() {
	
	// locking the canvas, so drawing is impossible during searching
	searching = true;
	disableDrawing = true;
	infoText = 'Searching...';
	
	// also locking some of the buttons
	$('#setFinishButton').attr('disabled', true);
	$('#setFinishButton').addClass('disabledButton');
	$('#setStartButton').attr('disabled', true);
	$('#setStartButton').addClass('disabledButton');
	$('#resetButton').attr('disabled', true);
	$('#resetButton').addClass('disabledButton');

	// displaying current state of the map (to remove the old path if "Find path" button has been presses again)
	renderFrame();
	
	// stopping map refreshing (no needed during path-finding process)
	clearInterval(interval);
	
	// initiating the search algorithm
	searchFailed = false;
	openList = {};
	closedList = {};
	cumulatedGCost = 0;
	grid = makeGrid(matrix);
	
	// adding start point to the "open list"
	current = grid[calculatePosition(startX, startY)];	
	current.hCost = Math.abs(current.x - finishX) + Math.abs(current.y - finishY);
	current.gCost = 0;
	current.fCost = current.hCost + current.gCost;
	openList[calculatePosition(startX, startY)] = current;
	current.onOpenList = true;
	
	// adding its neighbors to the "open list" (if they can be added) / updating the neighbors that are already added there
	addNeighborsToOpenList(current);
	
	// if showing algorithm steps is enabled, draw the first step. Also refresh the start point (so its always clearly visible)
	if (showSteps) {
		renderStep();
		ctx.fillStyle = startPointColor;
		ctx.fillRect(startX*cellSize, startY*cellSize, cellSize, cellSize);
	}
	
	// further algorithm steps
	if (showSteps) { // when displaying steps is selected
		var searchingForPath = setInterval(function() { // repeatedly calculating and drawing the steps 
		
			// calculating next steps if searching still possible and finish point not reached yet
			if (current.position !== calculatePosition(finishX, finishY) && !searchFailed) {
			
				// removing current node from the "open list" and adding it to the "closed list"
				delete openList[current.position];
				current.onOpenList = false;
				closedList[current.position] = current;
				current.onClosedList = true;	
				
				// adding its neighbors to the "open list" (if they can be added) / updating the neighbors that are already added there
				addNeighborsToOpenList(current);	
				
				// if no nodes left on the "open list", search failed
				if (Object.keys(openList).length === 0) {
					searchFailed = true;
				} else {
					// else find a node that is closer to the finish point than current one (based on F cost heuristic)
					current = findNodeWithLowestFCost(current.position);
				}	
				
				// drawing current step
				renderStep();
				
			} else { // if current node = finish point or search failed
				
				// stop searching
				clearInterval(searchingForPath); 
				
				if (!searchFailed) {
					drawPath(); // draw the path if search succeeded
					infoText = 'Path found!';
				} else {
					infoText = 'Path does not exist.';
				}
				
				searching = false;
				
				// enable the buttons that was locked during searching
				$('#setFinishButton').attr('disabled', false);
				$('#setFinishButton').removeClass('disabledButton');
				$('#setStartButton').attr('disabled', false);
				$('#setStartButton').removeClass('disabledButton');
				$('#resetButton').attr('disabled', false);
				$('#resetButton').removeClass('disabledButton');
				
			}
		}, animationSpeed);
	} else { // further algorithm steps when displaying steps is not selected
	
		// calculating next steps if searching still possible and finish point not reached yet
		while (current.position !== calculatePosition(finishX, finishY) && !searchFailed) {
		
			// removing current node from the "open list" and adding it to the "closed list"
			delete openList[current.position];	
			current.onOpenList = false;
			closedList[current.position] = current;
			current.onClosedList = true;	
			
			// adding its neighbors to the "open list" (if they can be added) / updating the neighbors that are already added there
			addNeighborsToOpenList(current);	
			
			// if no nodes left on the "open list", search failed
			if (Object.keys(openList).length === 0) {
				searchFailed = true;
			} else {
				// else find a node that is closer to the finish point than current one (based on F cost heuristic)
				current = findNodeWithLowestFCost(current.position);
			}		
		}
		
		// draw the path if search succeeded
		if (!searchFailed) {
			drawPath(); // draw the path if search succeeded
			infoText = 'Path found!';
		} else {
			infoText = 'Path does not exist.';
		}
		
		searching = false;
		
		// enable the buttons that was locked during searching
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