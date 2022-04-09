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
"user node";

var gridWidth = 32;
var gridHeight = 32;

var playerX = 10
var playerY = 12

var playerSprite

//tile ids
let EMPTY = 0;
let WALL = 1;
let EXIT = 2;
let START = 3;
let SPIKE = 4;
let TRANSPARENT = 5;
let KEY = 6;
let LOCK = 7;

let WALL_COLOR = PS.COLOR_BLACK

var fallTimer = null

var beadData = Array(32*32).fill(0);

var levelStrings = ["images/level0.png", "images/level1.png", "images/level2.png", "images/level3.png"];

var levelIndex = 0;
let levelCount = levelStrings.length;

var levelsCompleted = Array(levelCount).fill(false);

var oldColor = PS.COLOR_GRAY

var selecting = false;
var died = false;
var completed = false;
var finished = false;
var moving = false;
var moveTimer = null;

var moveTickCount = 0;

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

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


	//PS.alpha(0, 0, 0);
	PS.gridColor(PS.COLOR_CYAN);
	levelSelect();
	// Add any other initialization code you need here.
};
function levelSelect(){
	selecting = true;
	PS.gridSize(levelCount, 1);
	beadData.fill(0);
	PS.gridColor(PS.COLOR_CYAN);
	PS.statusText("Select a level");
	PS.alpha(PS.ALL, PS.ALL, 255);
	for (let i = 0; i < levelCount; i++){
		if (levelsCompleted[i]){
			PS.color(i, 0, PS.COLOR_GREEN);
		}else{
			PS.color(i, 0, PS.COLOR_WHITE);
		}
		PS.glyph(i, 0, (i+1).toString());
	}
}


function getBeadData(x, y){
	return beadData[y*32 + x];
}
function setBeadData(x, y, data){
	beadData[y*32 + x] = data;
}
function initLevel(index){
	died = false;
	completed = false;
	finished = false;
	//PS.color(PS.ALL, PS.ALL, PS.COLOR_GRAY)
	//PS.data(PS.ALL, PS.ALL, EMPTY);
	var myLoader;
	beadData.fill(0);
	PS.statusText("Level: " + (levelIndex+1) + " / " + levelCount);
	// Image loading function
	// Called when image loads successfully
	// [data] parameter will contain imageData
	//PS.alpha(PS.ALL, PS.ALL, 0);

	myLoader = function ( imageData ) {
		var x, y, ptr, color;

		if (imageData.height > imageData.width){
			gridWidth = imageData.height;
			gridHeight = imageData.height;
		}else{
			gridWidth = imageData.width;
			gridHeight = imageData.width;
		}
		PS.gridSize(gridWidth, gridHeight);
		PS.gridColor(PS.COLOR_CYAN);
		PS.border(PS.ALL,PS.ALL,0);
		// Extract colors from imageData and
		// assign them to the beadsd
		ptr = 0; // init pointer into data array
		for ( y = 0; y < gridHeight; y += 1 ) {
			for ( x = 0; x < gridWidth; x += 1 ) {
				color = imageData.data[ ptr ]; // get color
				//PS.debug(color + "\n");

				//PS.color( x, y, color ); // assign to bead
				PS.alpha(x, y, 255);
				PS.radius(x, y, 0);
				PS.bgAlpha(x, y, 0);
				PS.glyphAlpha(x, y, 0);
				var tempData = 0
				switch (color){
					case 0:			//black
						tempData = WALL;
						break;
					case 5046016: 	//green
						tempData = START;
						playerX = x;
						playerY = y;
						break;
					case 16766976:	//yellow
						tempData = EXIT;
						break;
					case 16711680:	//red
						tempData = SPIKE;
						break;
					case 16711900:	//magenta
						tempData = TRANSPARENT;
						break;
					case 255:		//blue
						tempData = KEY;
						break;
					case 16756224:	//orange
						tempData = LOCK;
						break;
					default:
						tempData = EMPTY;
				}
				if (x >= imageData.width || y >= imageData.height){
					tempData = TRANSPARENT;
				}
				dataToColor(x, y, tempData);
				//PS.data( x, y, color );
				ptr += 1; // point to next value
			}
		}
		movePlayer(playerX, playerY);
	};
	oldColor = PS.COLOR_GRAY
	PS.imageLoad( levelStrings[index], myLoader, 1 );	
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

	//PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

	// Add code here for mouse clicks/touches
	// over a bead.

	if (selecting){
		selecting = false;
		levelIndex = x;
		PS.gridSize( gridWidth, gridHeight ); // set initial size
		initLevel(levelIndex);
	}
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
Called when the mouse cursor/touch enters bead(x, y).
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

let UP_KEY = 1006
let DOWN_KEY = 1008
let LEFT_KEY = 1005
let RIGHT_KEY = 1007

let Z_KEY = 122;
let X_KEY = 120;
let Q_KEY = 113;
let R_KEY = 114;

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	if (key == Q_KEY){
		levelSelect();
		return;
	}
	//PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );
	if (finished || selecting){
		return;
	}

	switch (key){
		case LEFT_KEY:
			if (!moving){
				moveTimer = PS.timerStart(1, moveLeft);
				moveTickCount = 0;
				moving = true;
			}
			//PS.debug("lEFT\n");
			//movePlayer(playerX - 1, playerY);
			break;
		case RIGHT_KEY:
			if (!moving){
				moveTimer = PS.timerStart(1, moveRight);
				moveTickCount = 0;
				moving = true;
			}
			//PS.debug("RIGHT\n");
			//movePlayer(playerX + 1, playerY);
			break;
		case X_KEY:
			if (died){
				return;
			}
			rotateImage(true);
			break;
		case Z_KEY:
			if (died){
				return;
			}
			if (completed){
				completed = false;
				initLevel(levelIndex);
				return;
			}
			rotateImage(false);
			break;
		case R_KEY:
			initLevel(levelIndex);
			break;
	}
	// Add code here for when a key is pressed.
};

function moveLeft(){
	if (moveTickCount % 6 == 0){
		movePlayer(playerX - 1, playerY);
	}
	moveTickCount += 1;	
}
function moveRight(){
	if (moveTickCount % 6 == 0){
		movePlayer(playerX + 1, playerY);
	}
	moveTickCount += 1;
}

function movePlayer(x, y){

	if (selecting || completed || finished || died){
		return;
	}
	if (fallTimer != null){
		PS.timerStop(fallTimer);
		fallTimer = null;
	}

	if (y >= gridWidth){
		y = 0;
	}
	if (x >= 0 && x < gridWidth && y >= 0 && getBeadData(x, y) != WALL){
		PS.color(playerX, playerY, oldColor);
		PS.radius(playerX, playerY, 0);
		PS.bgAlpha(x, y, 255);
		PS.color(x, y, PS.COLOR_GREEN);
		PS.radius(x, y, 50);
		
		playerX = x;
		playerY = y;
		switch(getBeadData(playerX, playerY)){
			case EMPTY:
				oldColor = PS.COLOR_WHITE;
				break;
			case WALL:
				oldColor = PS.COLOR_BLACK;
				break;
			case START:
				oldColor = PS.COLOR_GRAY;
				break;
			case EXIT:
				oldColor = PS.COLOR_YELLOW;
				break;
			case SPIKE:
				oldColor = PS.COLOR_RED;
				break;
			case KEY:
				oldColor = PS.COLOR_BLUE;
				break;
			case LOCK:
				oldColor = PS.COLOR_ORANGE;
				break;
		}
		PS.bgColor(x, y, oldColor);
	}
	if (getBeadData(playerX, playerY) == EXIT){
		levelsCompleted[levelIndex] = true;
		levelIndex += 1;
		if (levelIndex == levelCount){
			finished = true;
			PS.statusText("YOU WIN! Thanks For Playing!");
		}else{
			completed = true;
			PS.statusText("Level Complete! Z to Continue or Q to Quit\n");
		}
	}
	if (getBeadData(playerX, playerY) == SPIKE){
		PS.statusText("Level Failed! R to Restart or Q to Quit\n");
		died = true;
	}
	if (getBeadData(playerX, playerY) == KEY){
		unlockDoors();
	}
	if (!playerOnGround()){
		fallTimer = PS.timerStart(5, movePlayer, playerX, playerY+1);
	}
}
function playerOnGround(){
	return getBeadData(playerX, playerY + 1) === WALL;
}
function unlockDoors(){
	setBeadData(playerX, playerY, EMPTY);
	PS.glyphAlpha(playerX, playerY, 0);
	PS.bgColor(playerX, playerY, PS.COLOR_WHITE);
	oldColor = PS.COLOR_WHITE;
	for (let x = 0; x < gridWidth; x++){
		for (let y = 0; y < gridHeight; y++){
			if (getBeadData(x, y) == LOCK){
				setBeadData(x, y, EXIT);
				PS.color(x, y, PS.COLOR_YELLOW);
				PS.glyphAlpha(x, y, 0);
			}
		}
	}
}

function rotateImage(clockwise){
	if (completed){
		return
	}
	let oldX = playerX;
	let oldY = playerY;

	var newBeadData = createAndFillTwoDArray({rows:gridHeight, columns:gridWidth, defaultValue: 0})

	//record new rotated bead data
	for (var r = 0; r < gridHeight; r++)
	{
		for (var c = 0; c < gridWidth; c++)
		{
			if (clockwise){//clockwise
				newBeadData[gridHeight - c - 1][r] = getBeadData(r, c);
			}else{ //counter clockwise
				newBeadData[c][gridWidth - r - 1] = getBeadData(r, c);
			}
		}
	}
	//TODO: fix big where the tile the player was previously on stays white on rotate
	for (let y = 0; y < gridWidth; y += 1 ) {
		for (let x = 0; x < gridHeight; x += 1 ) {
			PS.alpha( x, y, 255); // assign to bead
			PS.glyphAlpha(x, y, 0);
			PS.bgAlpha(x, y, 0);
			PS.radius(x, y, 0);
			dataToColor(x, y, newBeadData[x][y]);
		}
	}
	//This chunk accounts fixes the bug where the players old position would get set to empty color

	var newColor;
	//PS.debug(oldX + ", " + oldY + " OLD\n")
	//PS.debug(getBeadData(oldX, oldY) + "\n");
	switch(getBeadData(oldX, oldY)){
		case EMPTY:
			newColor = PS.COLOR_WHITE;
			break;
		case WALL:
			oldColor = PS.COLOR_BLACK;
			break;
		case START:
			oldColor = PS.COLOR_GRAY;
			break;
		case EXIT:
			oldColor = PS.COLOR_YELLOW;
			break;
		case SPIKE:
			oldColor = PS.COLOR_RED;
			break;
	}
	PS.color(oldX, oldY, newColor);

	if (clockwise){
		movePlayer(gridHeight - playerY - 1, playerX);
	}else{
		movePlayer(playerY, gridWidth - playerX - 1);
	}

}

function createAndFillTwoDArray({rows, columns, defaultValue}){
	return Array.from({ length:rows }, () => (
		Array.from({ length:columns }, ()=> defaultValue)
	 ))
  }

function dataToColor(x, y, data){
	switch (data){
		case EMPTY:
			PS.color( x, y, PS.COLOR_WHITE ); // assign to bead
			setBeadData(x,y, EMPTY);
			break;
		case WALL:
			PS.color( x, y, PS.COLOR_BLACK ); // assign to bead
			setBeadData(x,y, WALL);
			break;
		case EXIT:
			//PS.debug("Got yellow!!\n");
			PS.color( x, y, PS.COLOR_YELLOW ); // assign to bead
			setBeadData(x,y, EXIT);
			break;
		case START:
			PS.color( x, y, PS.COLOR_GRAY ); // assign to bead
			setBeadData(x,y, START);
			break;
		case SPIKE:
			PS.color( x, y, PS.COLOR_RED); // assign to bead
			setBeadData(x,y, SPIKE);
			break;
		case TRANSPARENT:
			PS.alpha( x, y, 0); // assign to bead
			setBeadData(x,y, TRANSPARENT);
			break;
		case KEY:
			PS.color( x, y, PS.COLOR_BLUE); // assign to bead
			setBeadData(x,y, KEY);
			PS.glyphAlpha(x, y, 255);
			PS.glyph(x, y, 0x1F511);
			break;
		case LOCK:
			PS.color( x, y, PS.COLOR_ORANGE); // assign to bead
			setBeadData(x,y, LOCK);
			PS.glyphAlpha(x, y, 255);
			PS.glyph(x, y, 0x1F512);
			break;
	}
}
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
	//PS.debug("Key released\n");
	if (moving){
		switch (key){
			case LEFT_KEY:
				moving = false;
				PS.timerStop(moveTimer);
				moveTimer = null;
				//PS.debug("lEFT\n");
				//movePlayer(playerX - 1, playerY);
				break;
			case RIGHT_KEY:
				moving = false;
				PS.timerStop(moveTimer);
				moveTimer = null;
				//PS.debug("RIGHT\n");
				//movePlayer(playerX + 1, playerY);
				break;
		}
	}

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
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

