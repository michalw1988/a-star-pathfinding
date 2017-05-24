/* -------- SETTINGS -------- */

// sizes
var width = 1000;
var height = 600;
var cellSize = 20;
var cellXCount = width / cellSize;
var cellYCount = height / cellSize;

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
var parentPointerColor = '#666';



/* -------- GLOBALS -------- */

// default values for points
var startX = 1;
var startY = 1;
var finishX = cellXCount - 2;
var finishY = cellYCount - 2;

// variables for path-finding algorithm
var matrix = [];
var grid = {};
var openList = {};
var closedList = {};
var current;
var cumulatedGCost;

// UI variables
var canvas;
var ctx;
var interval; 

var mouseOverCanvas = false;
var mouseX;
var mouseY;
var cellX;
var cellY;
var elementRect;

var mousePressed = false;
var settingStartPoint = false;
var settingFinishPoint = false;

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

/* ---------------------------------------- */



$(document).ready(function () {
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	// initiate the map
	createMatrix();
	
	// start refreshing the map
	interval = setInterval(renderFrame, 40);
	
	// UI events
	$('#canvas').on('mouseenter', canvasMouseEnterHandler);
	
	$('#canvas').on('mouseleave', canvasMouseLeaveHandler);
	
	$('#canvas').on('mousedown', function(event) {
		canvasMouseDownHandler(event);
	});
	
	$('#canvas').on('mouseup', canvasMouseUpHandler);
		
	$('#canvas').on('mousemove', function(event) {
		canvasMouseMoveHandler(event);
	});
	
	$('#cuttingCornersCheckbox').on('click', cuttingCornersCheckboxHandler);
	
	$('#showStepsCheckbox').on('click', showStepsCheckboxHandler);
	
	$('#drawOption').on('click', drawOptionHandler);
	
	$('#removeOption').on('click', removeOptionHandler);
	
	$('#slowOption').on('click', slowOptionHandler);
	
	$('#mediumOption').on('click', mediumOptionHandler);
	
	$('#fastOption').on('click', fastOptionHandler);
	
	$('#setStartButton').on('click', setStartButtonHandler);
	
	$('#setFinishButton').on('click', setFinishButtonHandler);
	
	$('#resetButton').on('click', resetButtonHandler);
	
	$('#findButton').on('click', findButtonHandler);
});