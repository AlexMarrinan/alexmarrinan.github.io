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

//tile ids
const EMPTY = 0;
const WALL = 1;
const EXIT = 2;
const START = 3;
const SPIKE = 4;
const TRANSPARENT = 5;
const KEY = 6;
const LOCK = 7;

//color ids for colision map
const BACKGROUND_COLOR = 0x827ca6
const EMPTY_COLOR = PS.COLOR_WHITE
const WALL_COLOR = PS.COLOR_BLACK
const EGG_COLOR = 255
const KEY_COLOR = 0xd98e04
const LOCK_COLOR = 0x00788c
const PLAYER_COLOR = 5046016
let mapWidth = 16;
let mapHeight = 16;


//Current direction the player is moving, not moving when zero
var moveX = 0;
var moveY = 0;

var playerX = 0;
var playerY = 0;

var timer = null;
var tickCount = 0;

var eggCount = 0
const EGG_MAX = 15

var beadData = Array(32*32).fill(0);
var colisionData = Array(32*32).fill(0);

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
	PS.gridSize(GRID_WIDTH, GRID_HEIGHT)
	PS.statusText("Egg Expedition!");
	timer = PS.timerStart(1, onTick);
	initLevel(0)
	// Add any other initialization code you need here.
};


function onTick(){
	//Move player if they have a velocity
	if (tickCount % 4 == 0){
		setPlayerPos(playerX + moveX, playerY + moveY);
	}


	tickCount++;
}
function initLevel(index){
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
		var x, y, ptr, color;

		mapHeight = imageData.height
		mapWidth = imageData.width

		colisionData = Array(mapWidth*mapHeight).fill(PS.COLOR_WHITE);
		ptr = 0; // init pointer into data array
		for ( y = 0; y < mapHeight; y += 1 ) {
			for ( x = 0; x < mapWidth; x += 1 ) {
				color = imageData.data[ ptr ]; // get color
				//PS.debug(color + "\n");
				if (color == PLAYER_COLOR){//green
					playerX = x;
					playerY = y;
				}else if (color == EGG_COLOR){
					//PS.debug("Egg placed at " + x + ", " + y + "\n");
				}					
				setColisionData(x, y, color);
				//PS.data( x, y, color );*/
				ptr += 1; // point to next value
			}
		}
		setPlayerPos(playerX, playerY);
	};
	graphicsLoader = function ( imageData ) {
		var x, y, ptr, color;

		mapHeight = imageData.height
		mapWidth = imageData.width

		beadData = Array(mapWidth*mapHeight).fill(PS.COLOR_WHITE);

		ptr = 0; // init pointer into data array
		for ( y = 0; y < mapHeight; y += 1 ) {
			for ( x = 0; x < mapWidth; x += 1 ) {
				color = imageData.data[ ptr ]; // get color
				setBeadData(x, y, color);
				//PS.data( x, y, color );*/
				ptr += 1; // point to next value
			}
		}
	};
	PS.imageLoad( "images/level0.png", collisionLoader, 1 );	
	PS.imageLoad( "images/level0_graphics.png", graphicsLoader, 1 );	

}
function getBeadData(x, y){
	return beadData[y*mapWidth + x];
}
function setBeadData(x, y, data){
	beadData[y*mapWidth + x] = data;
}

function getColisionData(x, y){
	return colisionData[y*mapWidth + x];
}
function setColisionData(x, y, data){
	colisionData[y*mapWidth + x] = data;
}

function setPlayerPos(x, y){
	if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight){
		return;
	}
	if (getColisionData(x, y) == WALL_COLOR){
		return;
	}
	if (getColisionData(x, y) == EGG_COLOR){
		collectEgg();
		setColisionData(x, y, EMPTY_COLOR);
	}
	playerX = x;
	playerY = y;

	renderCamera();
	//renderPlayer();
}

function collectEgg(){
	PS.debug("Found egg #" + (eggCount+1) + "! \n");
	PS.color(eggCount, GRID_HEIGHT-1, 0x827ca6);
	eggCount++;
}

function renderCamera(){
	let minX = playerX - 7;
	let maxX = playerX + 7;
	let minY = playerY - 7;
	let maxY = playerY + 7;
	let x = 0;
	let y = 0;
	//PS.debug(minX+ "\n");
	//PS.debug(maxX+ "\n");

	for ( var tempy = minY; tempy <= maxY; tempy += 1 ) {
		for ( var tempx = minX; tempx <= maxX; tempx += 1 ) {
			if (tempy < 0 || tempy >= mapHeight || tempx < 0 || tempx >= mapWidth){
				PS.border(x, y, 0);
				PS.color(x, y, PS.COLOR_GRAY)
				PS.radius(x, y, 0);
			}else if (x == 7 && y == 7){
				PS.color(x, y, PS.COLOR_GREEN);
				PS.border(x, y, 2);
				PS.radius(x, y, 50);
				PS.bgAlpha(x, y, 255);
				PS.bgColor(x, y, getBeadData(tempx, tempy));
			}else if (getColisionData(tempx, tempy) == EGG_COLOR){
				PS.border(x, y, 2);
				PS.radius(x, y, 50);
				PS.bgAlpha(x, y, 255);
				PS.color(x, y, EGG_COLOR);
				PS.bgColor(x, y, getBeadData(tempx, tempy));
			}else{
				PS.radius(x, y, 0);
				PS.border(x, y, 0);
				PS.color(x, y, getBeadData(tempx, tempy));
			}
			x += 1;
		}
		x = 0;
		y += 1;
	}
	//PS.debug(x+ "\n");
	//PS.debug(y+ "\n");
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
const UP_KEY = 1006
const DOWN_KEY = 1008
const LEFT_KEY = 1005
const RIGHT_KEY = 1007

const W_KEY = 119
const A_KEY = 97
const S_KEY = 115
const D_KEY = 100


PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	//PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );
	switch (key){
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

