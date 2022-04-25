/*
game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-22 Brian Moriarty.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/

/*
This JavaScript file is a template for creating new Perlenspiel 3.3.x games.
Any unused event-handling function templates can be safely deleted.
Refer to the tutorials and documentation at <https://ps3.perlenspiel.net> for details.
*/

/*
The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these two lines.
*/

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT remove this directive!

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/
const GRID_HEIGHT = 16
const GRID_WIDTH = 15

//color ids for colision map
const BACKGROUND_COLOR = 0x827ca6
const EMPTY_COLOR = PS.COLOR_WHITE
const WALL_COLOR = PS.COLOR_BLACK
const EGG_COLOR = 255
const SPEED_COLOR = 16711680
const RADAR_COLOR = 16756224
const ORIGINAL_PLAYER_COLOR = 5046016
var PLAYER_COLOR = 5046016


//Current direction the player is moving, not moving when zero
var moveX = 0;
var moveY = 0;

var playerX = 0;
var playerY = 0;

var playerCameraX = 7;
var playerCameraY = 7;

var timer = null;
var tickCount = 0;

var eggCount = 0
const EGG_MAX = 15
var speedTime = 0
const SPEED_MAX = 600 //10 seconds
var speedColor = false;
var radarTime = 0
const RADAR_MAX = 720 //12 seconds
var countdownTime = 0
const COUNTDOWN_START = 5

var playing = false;
var victory = false;
var secondsPlayed = 0;

var inLevelSelect = true;
var currentLevelIndex = null;
var levelCount = 2;
var levelNames = ["Ol' Reliable Village", "Heaven's Gate"]

var beadData = Array.from(Array(levelCount), () => new Array(32*32).fill(0));
var colisionData = Array.from(Array(levelCount), () => new Array(32*32).fill(0));
var eggLocationsX = Array.from(Array(levelCount), () => new Array(EGG_MAX));
var eggLocationsY = Array.from(Array(levelCount), () => new Array(EGG_MAX));

var mapHeights = Array(levelCount).fill(0);
var mapWidths = Array(levelCount).fill(0);

var playerStartX = Array(levelCount).fill(0);
var playerStartY = Array(levelCount).fill(0);

const RADAR_FRAMES = 10;
var radarAnimationData = Array(15*15*RADAR_FRAMES).fill(PS.COLOR_WHITE);
var radarImageIndex = 0;

PS.init = function( system, options ) {
	// Uncomment the following code line
	// to verify operation:

	// PS.debug( "PS.init() called\n" );

	// This function should normally begin
	// with a call to PS.gridSize( x, y )
	// where x and y are the desired initial
	// dimensions of the grid.
	// Call PS.gridSize() FIRST to avoid problems!
	// The sample call below sets the grid to the
	// default dimensions (8 x 8).
	// Uncomment the following code line and change
	// the x and y parameters as needed.

	// PS.gridSize( 8, 8 );

	// This is also a good place to display
	// your game title or a welcome message
	// in the status line above the grid.
	// Uncomment the following code line and
	// change the string parameter as needed.

	// PS.statusText( "Game" );
	initLevels(0)
	PS.statusText("Select Level using WASD and SPACE")
	/*countdownTime = COUNTDOWN_START
	PS.gridSize(GRID_WIDTH, GRID_HEIGHT)
	PS.gridColor(PS.COLOR_GRAY);
	PS.statusColor(PS.COLOR_WHITE);
	PS.statusText("Egg Expedition!");
	PS.fade(7, 7, 15);
	initLevel(0)
	PS.border(PS.ALL, PS.ALL, 0);
	timer = PS.timerStart(1, onTick);
*/
	// Add any other initialization code you need here.
};
function levelSelect(){
	inLevelSelect = true;
	victory = false;
	PS.gridSize(levelCount, 1);
	//PS.gridFade(20);
	PS.gridColor(PS.COLOR_GRAY);
	PS.statusColor(PS.COLOR_WHITE);
	PS.alpha(PS.ALL, PS.ALL, 255);

	for (let i = 0; i < levelCount; i++){
		if (i == currentLevelIndex){
			PS.color(i, 0, PLAYER_COLOR);
		}else{
			PS.color(i, 0, PS.COLOR_WHITE);
		}
		//PS.glyph(i, 0, (i+1).toString());
	}
}

function initWorld(){
	inLevelSelect = false
	countdownTime = COUNTDOWN_START
	PS.gridSize(GRID_WIDTH, GRID_HEIGHT)
	PS.borderColor(PS.ALL, PS.ALL, WALL_COLOR);
	PS.gridColor(PS.COLOR_GRAY);
	PS.statusColor(PS.COLOR_WHITE);
	PS.statusText("Egg Expedition!");
	PS.border(PS.ALL, PS.ALL, 0);
	playerX = playerStartX[currentLevelIndex];
	playerY = playerStartY[currentLevelIndex];
	setPlayerPos(playerX, playerY);
	timer = PS.timerStart(1, onTick);
}
function onTick(){
	//Move player if they have a velocity
	if (tickCount % 4 == 0){
		if (moveX != 0 || moveY != 0){
			setPlayerPos(playerX + moveX, playerY + moveY);
		}
	}
	if (speedTime > 0){
		if ((tickCount + 2) % 4 == 0){
			setPlayerPos(playerX + moveX, playerY + moveY);
		}
		speedAnimation()
		//PS.debug(speedTime + "\n");
		speedTime -= 1;
	}
	if (tickCount % 60 == 0){
		if (playing){
			secondsPlayed += 1;
		}
		if (secondsPlayed == 0){
			countdown();
		}else if (radarTime == 0){
			showTime();
		}
		//PS.statusText("Egg Expedition!");
	}
	if (radarTime > 0){
		radarTime -= 1;
		radarAnimation();
	}else if (playing){
		//PS.statusText("Egg Expedition!");
	}
	tickCount++;
}

function showTime(){
	let hours = Math.floor(secondsPlayed / 3600);
	let totalSeconds = secondsPlayed % 3600;
	let minutes = Math.floor(totalSeconds / 60);
	let seconds = totalSeconds % 60;
	if (seconds < 10){
		var inbetween = " : 0"
	}else{
		var inbetween = " : "
	}
	if (!playing){
		var start = "Final time: "
		if (!victory){
			PS.audioLoad("victory", {autoplay: true, path: "audio/", volume: 0.25});
			victory = true;
		}
	}else{
		var start = ""
	}
	PS.statusText(start + minutes + inbetween + seconds);
}
function initLevels(index){
	//PS.fade(PS.ALL, PS.ALL, 2);
	//PS.color(PS.ALL, PS.ALL, PS.COLOR_GRAY)
	//PS.data(PS.ALL, PS.ALL, EMPTY);
	var graphicsLoader;
	var collisionLoader;
	//beadData.fill(0);
	// Image loading function
	// Called when image loads successfully
	// [data] parameter will contain imageData
	//PS.alpha(PS.ALL, PS.ALL, 0);

	collisionLoader = function ( imageData ) {
		var x, y, ptr, color, eggs;

		mapHeights[index] = imageData.height
		mapWidths[index] = imageData.width

		colisionData[index] = Array(mapWidths[index]*mapHeights[index]).fill(PS.COLOR_WHITE);
		ptr = 0; // init pointer into data array
		eggs = 0;
		for ( y = 0; y < mapHeights[index]; y += 1 ) {
			for ( x = 0; x < mapWidths[index]; x += 1 ) {
				color = imageData.data[ ptr ]; // get color
				//PS.debug(color + "\n");
				if (color == PLAYER_COLOR){//green
					playerStartX[index] = x;
					playerStartY[index] = y;
				}
				if (color == EGG_COLOR){
					eggLocationsX[index][eggs] = x;
					eggLocationsY[index][eggs] = y;
					eggs += 1;
				}
				setColisionData(x, y, color, index);
				//PS.data( x, y, color );*/
				ptr += 1; // point to next value
			}
		}
		PS.imageLoad( "images/map"+(index+1)+"_gfx.png", graphicsLoader, 1 );
	}
	graphicsLoader = function ( imageData ) {
		var x, y, ptr, color;
		//PS.debug("yep")
		beadData[index] = Array(mapWidths[index]*mapHeights[index]);

		//PS.debug(mapHeight + " " + mapWidth)
		ptr = 0; // init pointer into data array
		for ( y = 0; y < mapHeights[index]; y += 1 ) {
			for ( x = 0; x < mapWidths[index]; x += 1 ) {
				color = imageData.data[ ptr ]; // get color

				setBeadData(x, y, color, index);
				if (index == 1){
					//PS.debug(getBeadData(x, y, index));
				}
				ptr += 1; // point to next value
			}
		}
		index++;
		if (index < levelCount){
			initLevels(index);
		}else{
			loadRadar()
		}
		//setPlayerPos(playerX, playerY);
		//startTimer();
	};
	PS.imageLoad( "images/map"+(index+1)+"_col.png", collisionLoader, 1 );	
}

function loadRadar(){
	var radarLoader;
	radarLoader = function (imageData) {
		var x, y, ptr, color;
		ptr = 0;
		for ( y = 0; y < GRID_HEIGHT - 1; y += 1 ) {
			for ( x = 0; x < GRID_WIDTH; x += 1 ) {
				color = imageData.data[ ptr ]; // get color
				//PS.debug(color + "\n");
				setRadarData(x, y, radarImageIndex, color);
				ptr += 1; // point to next value
			}
		}
		radarImageIndex++;
		if (radarImageIndex >= RADAR_FRAMES){
			radarImageIndex = 0;
			levelSelect();
			return;
		}
		PS.imageLoad("images/radar"+ (radarImageIndex+1) + ".png", radarLoader, 1)
	}
	PS.imageLoad("images/radar"+ (radarImageIndex+1) + ".png", radarLoader, 1)
}
function startTimer(){
	countdownTime = COUNTDOWN_START;
	if (timer != null){
		PS.timerStop(timer);
	}
	timer = PS.timerStart(60, countdown)
}
function countdown(){
	if (countdownTime > 0) {
		PS.statusText("Find all the eggs as fast as you can!: " + countdownTime);
	}else{
		playing = true;
		PS.statusText("0 : 00");
	}
	countdownTime -= 1;
}


function getBeadData(x, y, level){
	return beadData[level][y*mapWidths[level] + x];
}
function setBeadData(x, y, data, level){
	beadData[level][y*mapWidths[level] + x] = data;
}

function getColisionData(x, y, level){
	return colisionData[level][y*mapWidths[level] + x];
}
function setColisionData(x, y, data, level){
	colisionData[level][y*mapWidths[level] + x] = data;
}
function getRadarData(x, y, i){
	return 	radarAnimationData[i*15*15 + y*15 + x];
}
function setRadarData(x, y, i, data, level){
	radarAnimationData[i*15*15 + y*15 + x] = data;
}


function setPlayerPos(x, y){
	if (x < 0 || x >= mapWidths[currentLevelIndex] || y < 0 || y >= mapHeights[currentLevelIndex]){
		//PS.debug("Move out of bounds\n")
		renderCamera();
		return;
	}
	if (getColisionData(x, y, currentLevelIndex) == WALL_COLOR){
		return;
	}

	//off center camera code
	if (playerCameraX < 7 || playerCameraX >= 8){
		setCameraX(x);
	}
	else if (x < 7 || x >= mapWidths[currentLevelIndex] - 7){
		setCameraX(x);
	}
	if (playerCameraY < 7 || playerCameraY >= 8){
		setCameraY(y);
	}
	else if (y < 7 || y >= mapHeights[currentLevelIndex] - 7){
		setCameraY(y);
	}


	if (getColisionData(x, y, currentLevelIndex) == SPEED_COLOR){
		collectSpeed();
		setColisionData(x, y, EMPTY_COLOR, currentLevelIndex);
	}
	if (getColisionData(x, y, currentLevelIndex) == RADAR_COLOR){
		startRadar();
		setColisionData(x, y, EMPTY_COLOR, currentLevelIndex);
	}
	playerX = x;
	playerY = y;
	if (getColisionData(x, y, currentLevelIndex) == EGG_COLOR){
		collectEgg(x, y);
		setColisionData(x, y, EMPTY_COLOR, currentLevelIndex);
	}
	if (speedTime > 0){
		var xMin = x-1
		var xMax = x+1
		var yMin = y-1
		var yMax = y+1

		for (var xTemp = xMin; xTemp <= xMax; xTemp++){	
			for (var yTemp = yMin; yTemp <= yMax; yTemp++){
				if (xTemp < 0 || xTemp >= mapWidths[currentLevelIndex] || yTemp < 0 || yTemp >= mapHeights[currentLevelIndex]){
					continue;
				}
				if (getColisionData(xTemp, yTemp, currentLevelIndex) == EGG_COLOR){
					collectEgg(xTemp, yTemp);
					setColisionData(xTemp, yTemp, EMPTY_COLOR, currentLevelIndex);
				}
			}
		}
	}
	if (radarTime > 0){
		let distance = getClosestBeed(x, y);
		PS.statusText("Radar: " + distance + " beads");
	}
	renderCamera();
	//renderPlayer();
}

function setCameraX(x){
	if (playerX > x){
		playerCameraX -= 1;
	}else if (playerX < x){
		playerCameraX += 1;
	}
}
function setCameraY(y){
	if (playerY > y){
		playerCameraY -= 1;
	}else if (playerY < y){
		playerCameraY += 1;
	}
	//PS.debug("Camera pos: " + playerCameraX + ", " + playerCameraY + "\n")
}

function collectEgg(x, y){
	//PS.debug("Found egg #" + (eggCount+1) + "! \n");
	PS.color(eggCount, GRID_HEIGHT-1, EGG_COLOR);
	PS.radius(eggCount, GRID_HEIGHT-1, 50);
	PS.bgColor(eggCount, GRID_HEIGHT-1, PS.COLOR_WHITE);
	PS.bgAlpha(eggCount, GRID_HEIGHT-1, 255);
	PS.border(eggCount, GRID_HEIGHT-1, 2);
	PS.audioLoad("egg1", {autoplay: true, path: "audio/"});
	//PS.debug("XY: " +x + ", " + y + "\n");
	//PS.debug("PLAYER:" + playerX +", "+ playerY + "\n")
	for (var i = 0; i < EGG_MAX; i++){
		if (eggLocationsX[currentLevelIndex][i] == null || eggLocationsY[currentLevelIndex][i] == null){
			continue;
		}


		if (eggLocationsX[currentLevelIndex][i] == x && eggLocationsY[currentLevelIndex][i] == y){
			//PS.debug("Set egg location to null\n")
			eggLocationsX[currentLevelIndex][i] = null;
			eggLocationsY[currentLevelIndex][i] = null;
		}
	}
	eggCount++;
	if (eggCount == EGG_MAX){
		radarTime = 0;
		playing = false;
	}
}

function collectSpeed(){
	//PS.debug("Found speed powerup\n");
	//PS.fade(playerCameraX, playerCameraY, 15);
	PS.audioLoad("speedboost", {autoplay: true, path: "audio/", volume: 0.15});
	speedTime = SPEED_MAX;
	
}

function startRadar(){
	//PS.debug("Found radar powerup\n");
	PS.audioLoad("sonar", {autoplay: true, path: "audio/", volume: 0.5});
	radarTime = RADAR_MAX;
	radarImageIndex = 0;
	//PS.debug(eggLocationsX[currentLevelIndex] + ", " + eggLocationsY[currentLevelIndex] + "\n")
}

function getClosestBeed(x, y){
	var distances = Array(EGG_MAX).fill(0);
	//PS.debug("\n\n\n");

	for (var i = 0; i < EGG_MAX; i++){
		if (eggLocationsX[currentLevelIndex][i] != null && eggLocationsY[currentLevelIndex][i] != null){
			let x2 = eggLocationsX[currentLevelIndex][i];
			let y2 = eggLocationsY[currentLevelIndex][i];
			
			let xdiff = Math.abs(x2-x)
			let ydiff = Math.abs(y2-y)

			//PS.debug(x2 + ', ' + y2 + '\n');

			distances[i] = Math.floor(Math.sqrt(xdiff*xdiff + ydiff*ydiff));
			//PS.debug(distances[i] + '\n');
		}else{
			distances[i] = null;
		}
	}
	var lowest = 1000;
	for (var i = 0; i < EGG_MAX; i++){
		if (distances[i] == null){
			continue;
		}
		if (lowest > distances[i]){
			lowest = distances[i];
		}
	}
	return (lowest);
}

function renderCamera(){
	let minX = playerX + (7-playerCameraX) - 7;
	let maxX = playerX + (7-playerCameraX) + 7;
	let minY = playerY + (7-playerCameraY) - 7;
	let maxY = playerY + (7-playerCameraY) + 7;
	let x = 0;
	let y = 0;
	//PS.debug(minX+ "\n");
	//PS.debug(maxX+ "\n");
	for ( var tempy = minY; tempy <= maxY; tempy += 1 ) {
		for ( var tempx = minX; tempx <= maxX; tempx += 1 ) {
			if (tempy < 0 || tempy >= mapHeights[currentLevelIndex] || tempx < 0 || tempx >= mapWidths[currentLevelIndex]){
				PS.border(x, y, 0);
				PS.color(x, y, PS.COLOR_GRAY)
				PS.radius(x, y, 0);
			}else if (getColisionData(tempx, tempy, currentLevelIndex) == WALL_COLOR){
				//PS.gridPlane(1);
				wallBorder(x, y, tempx, tempy, currentLevelIndex);
				//PS.borderAlpha(x, y, 50);
				//PS.gridPlane(0);
				PS.bgAlpha(x, y, 255);
				PS.radius(x, y, 0);
				PS.color(x, y, getBeadData(tempx, tempy, currentLevelIndex));
			}else if (x == playerCameraX && y == playerCameraY){
				PS.color(x, y, PLAYER_COLOR);
				PS.border(x, y, 2);
				PS.radius(x, y, 50);
				PS.bgAlpha(x, y, 255);
				PS.bgColor(x, y, getBeadData(tempx, tempy, currentLevelIndex));
			}else if (getColisionData(tempx, tempy, currentLevelIndex) == EGG_COLOR){
				PS.border(x, y, 2);
				PS.radius(x, y, 50);
				PS.bgAlpha(x, y, 255);
				PS.color(x, y, EGG_COLOR);
				PS.bgColor(x, y, getBeadData(tempx, tempy, currentLevelIndex));
			}else if (getColisionData(tempx, tempy, currentLevelIndex) == SPEED_COLOR){
				PS.border(x, y, 2);
				PS.radius(x, y, 20);
				PS.bgAlpha(x, y, 255);
				PS.color(x, y, SPEED_COLOR);
				PS.bgColor(x, y, getBeadData(tempx, tempy, currentLevelIndex));
			}else if (getColisionData(tempx, tempy, currentLevelIndex) == RADAR_COLOR){
				PS.border(x, y, 2);
				PS.radius(x, y, 20);
				PS.bgAlpha(x, y, 255);
				PS.color(x, y, RADAR_COLOR);
				PS.bgColor(x, y, getBeadData(tempx, tempy, currentLevelIndex));
			}else{
				PS.radius(x, y, 0);
				PS.border(x, y, 0);
				PS.color(x, y, getBeadData(tempx, tempy, currentLevelIndex));
			}
			x += 1;
		}
		x = 0;
		y += 1;
	}
	//PS.debug(x+ "\n");
	//PS.debug(y+ "\n");
}

function wallBorder(x, y, tempx, tempy, level){
	var top = 1;
	var bottom = 1;
	var left = 1;
	var right = 1;

	if (getColisionData(tempx+1, tempy, level) == WALL_COLOR){
		right = 0;
	}
	if (getColisionData(tempx-1, tempy, level) == WALL_COLOR){
		left = 0;
	}
	if (getColisionData(tempx, tempy+1, level) == WALL_COLOR){
		bottom = 0;
	}
	if (getColisionData(tempx, tempy-1, level) == WALL_COLOR){
		top = 0;
	}
	PS.border(x,y, {top : top, left : left, bottom : bottom, right : right, equal: false});
}

function radarAnimation(){
	if (tickCount % 4 != 0){
		return;
	}
	if (radarImageIndex >= RADAR_FRAMES){
		return;
	}
	PS.gridPlane(2);
	for (var x = 0; x < 15; x++){
		for (var y = 0; y < 15; y++){
			let color = getRadarData(x, y, radarImageIndex);
			if (color != PS.COLOR_WHITE){
				PS.color(x, y, PS.COLOR_ORANGE);
				PS.alpha(x, y, 128);
			}else{
				PS.alpha(x, y, 0);
			}
		}
	}
	PS.gridPlane(0);
	radarImageIndex++;
}

function speedAnimation(){
	if (speedTime % 100 == 0){
		PLAYER_COLOR = PS.COLOR_BLUE;	
		
	}else if (speedTime % 100 == 80){
		PLAYER_COLOR = PS.COLOR_VIOLET;
	}
	else if (speedTime % 100 == 60){
		PLAYER_COLOR = PS.COLOR_RED;
	}
	else if (speedTime % 100 == 40){
		PLAYER_COLOR = PS.COLOR_YELLOW;
	}
	else if (speedTime % 100 == 20){
		PLAYER_COLOR = ORIGINAL_PLAYER_COLOR;
	}
}
/*
PS.touch ( x, y, data, options )
Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.touch = function( x, y, data, options ) {
	// Uncomment the following code line
	// to inspect x/y parameters:

	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

	// Add code here for mouse clicks/touches
	// over a bead.
};

/*
PS.release ( x, y, data, options )
Called when the left mouse button is released, or when a touch is lifted, over bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.release = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
};

/*
PS.enter ( x, y, button, data, options )
Called when the mouse cursor/touch enters bead(x, y).collectE
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.enter = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
};

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exit = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/
const UP_KEY = 1006
const DOWN_KEY = 1008
const LEFT_KEY = 1005
const RIGHT_KEY = 1007

const W_KEY = 119
const A_KEY = 97
const S_KEY = 115
const D_KEY = 100

const SPACE_KEY = 32


PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:
	/*if (victory && key == SPACE_KEY){
		levelSelect();
		return;
	}*/
	if (!playing && !inLevelSelect){
		return;
	}
	if (inLevelSelect){
		switch (key){
			case SPACE_KEY:
				if (currentLevelIndex == null){
					break;
				}
				initWorld();
				break;
			case LEFT_KEY:
			case A_KEY:
				if (currentLevelIndex == null){
					currentLevelIndex = 0;
				}
				if (currentLevelIndex > 0){
					currentLevelIndex--;
				}
				PS.statusText("Select Level: " + levelNames[currentLevelIndex]);
				levelSelect()
				break;
			case RIGHT_KEY:
			case D_KEY:
				if (currentLevelIndex == null){
					currentLevelIndex = 0;
				}
				if (currentLevelIndex < levelCount - 1){
					currentLevelIndex++;
				}
				PS.statusText("Select Level: " + levelNames[currentLevelIndex]);
				levelSelect()
				break;
		}
	}
	//PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );
	switch (key){
		case SPACE_KEY:
			break;
		case UP_KEY:
		case W_KEY:
			moveY = -1;
			break;
		case DOWN_KEY:
		case S_KEY:
			moveY = 1;
			break;
		case LEFT_KEY:
		case A_KEY:
			moveX = -1;
			break;
		case RIGHT_KEY:
		case D_KEY:
			moveX = 1;
			break;
	}
	// Add code here for when a key is pressed.
};

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.

	switch (key){
		case UP_KEY:
		case W_KEY:
			moveY = 0;
			break;
		case DOWN_KEY:
		case S_KEY:
			moveY = 0;
			break;
		case LEFT_KEY:
		case A_KEY:
			moveX = 0;
			break;
		case RIGHT_KEY:
		case D_KEY:
			moveX = 0;
			break;
	}
};

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};
