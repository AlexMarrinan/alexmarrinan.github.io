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

var text;
var gridWidth = 1;
var gridHeight = 1;

var r = 0;
var g = 0;
var b = 0;

var rOriginal = 0;
var gOriginal = 0;
var bOriginal = 0;

var rRange = 0;
var bRange = 0;
var gRange = 0;

var radius = 0;
var radiusRange = 0;

var brushSize = 1;

var tickCount = 0;

var started = false;
var painting = false;

var timer;

var seed = null; //seed is now global so that PS.touch can access it
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

	// Add any other initialization code you need here.


	PS.gridSize( gridWidth, gridHeight ); // set initial size
	//PS.alpha(0, 0, 0);
	PS.borderAlpha(0,0,0);
	textPrompt();
};

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

	if (!started){
		return;
	}
	if (x == gridWidth-1 && y == gridHeight-1){
		started = false;
		var gridCount = gridHeight * gridWidth;
		tickCount = 64;

		PS.gridFade(30);
		PS.fade( PS.ALL, PS.ALL, 30, {onEnd: textPrompt}); 
		PS.borderFade( PS.ALL, PS.ALL, 30); 
		PS.statusFade(30);
		PS.borderAlpha(PS.ALL, PS.ALL, 0);
		//timer = PS.timerStart(1, fadeOut);
		PS.gridColor(PS.COLOR_WHITE);
		PS.statusColor(PS.COLOR_BLACK);
		PS.alpha(PS.ALL, PS.ALL, 0);
		return;
	}
	
	if (x == 0 && y == gridHeight-1){
		changeBrushSize();
		return;
	}
	// Add code here for mouse clicks/touches
	// over a bead.
	painting = true;
	PS.seed(seed*PS.random(30)); //makes it not the same color every time
	paint(x, y);

	//PS.color( x, y, PS.COLOR_WHITE ); // set color to currentColor
	//PS.data( x, y, PS.COLOR_WHITE );  // set data to color value
};
function textPrompt(){
	started = false;
	PS.statusInput( "Name your piece: ", function ( result ) {
		text = result;
		seed = generateSeed(text);
		//started = true;
		//PS.statusText( "Seed: " + seed );
		PS.statusText( "Painting title: " + text );
		//resetAlpha();
		changeBoardSize(seed);
		randomizeBoard(seed);
		changeBeadRadius(seed);
		makeResetButton();
		makeBrushButton();
		tickCount = 64;
		started = true;
		//timer = PS.timerStart(1, fadeIn);
	} );
}
function resetAlpha(){
	for (let i = 0; i < gridWidth; i++ ){
		for (let j = 0; j < gridHeight; j++){
			PS.alpha(i, j, 0);
		}
	}
}
function generateSeed(text){
	var str = String(text);
	var number = 0;
	for (let i = 0; i < str.length; i++) {
		number += str.charCodeAt(i)*(i+1);
	}
	return number;
}

function changeBoardSize(seed){
	PS.seed(seed);
	gridWidth = PS.random(31)+1;
	gridHeight = PS.random(31)+1;
	PS.gridSize(gridWidth, gridHeight);
	PS.gridFade(30);
	PS.fade( PS.ALL, PS.ALL, 30);
	PS.borderFade( PS.ALL, PS.ALL, 30); 
	PS.statusFade(30);
	PS.borderAlpha(PS.ALL, PS.ALL, 255);
}
function randomizeBoard(seed){
	PS.seed(seed);
	r = PS.random(255);
	rRange = PS.random(100);

	g = PS.random(255);
	gRange = PS.random(100);

	b = PS.random(255);
	bRange = PS.random(100);

	for (let i = 0; i < gridWidth; i++ ){
		for (let j = 0; j < gridHeight; j++){
			var rTemp = r + (PS.random(rRange*2) - rRange);
			var gTemp = g + (PS.random(gRange*2) - gRange);
			var bTemp = b + (PS.random(bRange*2) - bRange);
			PS.color( i, j, rTemp, gTemp, bTemp ); // set bead color
		}
	}
	rOriginal = r;
	bOriginal = b;
	gOriginal = g;
	PS.gridColor(r, g, b);
	if (r < 100 || g < 100 || b < 100){
		PS.statusColor(PS.COLOR_WHITE);
	}else{
		PS.statusColor(PS.COLOR_BLACK);
	}
}
function changeBeadRadius(seed){
	PS.seed(seed);
	radius = PS.random(50);
	radiusRange = 10;
	for (let i = 0; i < gridWidth; i++ ){
		for (let j = 0; j < gridHeight; j++){
			PS.radius(i, j, radius + PS.random(radiusRange*2) - radiusRange);
		}
	}
}
function makeBrushButton(){
	PS.color(0, gridHeight-1, PS.COLOR_BLACK);
	PS.glyph(0, gridHeight-1,  brushSize.toString());
	PS.glyphColor(0, gridHeight-1, PS.COLOR_WHITE);
}
function makeResetButton(){
	PS.color(gridWidth-1, gridHeight-1, PS.COLOR_RED);
	PS.glyph(gridWidth-1, gridHeight-1, '?');
	PS.glyphColor(gridWidth-1, gridHeight-1, PS.COLOR_WHITE);
}
function changeBrushSize(){
	switch(brushSize){
		case 1:
			brushSize = 3;
			PS.audioPlay( "fx_pop" , {volume: 0.75} );
			PS.glyph(0, gridHeight-1, "3");
			break;
		case 3:
			brushSize = 5;
			PS.audioPlay( "fx_pop" , {volume: 0.75} );
			PS.glyph(0, gridHeight-1, "5");
			break;
		case 5:
			brushSize = 1;
			PS.audioPlay( "fx_pop" , {volume: 0.75} );
			PS.glyph(0, gridHeight-1, "1");
			break;
	}
	PS.statusText( "Changed brush size: " + brushSize);
}
function paint(x, y){
	//paint current bead
	PS.fade( PS.ALL, PS.ALL, 0);
	r = PS.random(255);
	rRange = PS.random(150) + 50;

	g = PS.random(255);
	gRange = PS.random(100) + 50;

	b = PS.random(255);
	bRange = PS.random(150) + 50;
	var xMin = x;
	var xMax = x+1;
	var yMin = y;
	var yMax = y+1;

	if (brushSize == 3){
		xMin -= 1;
		yMin -= 1;
		xMax += 1;
		yMax += 1;
	}
	if (brushSize == 5){
		xMin -= 2;
		yMin -= 2;
		xMax += 2;
		yMax += 2;
	}
	for (let i = xMin; i < xMax; i++){
		for (let j = yMin; j < yMax; j++){
			//PS.debug(i + ", " + j + "\n");
			if (i < 0 || i > gridWidth-1 || j < 0 || j > gridHeight-1){
				continue;
			}
			if((i == 0 && j == gridHeight-1 ) || (i == gridWidth-1 && j == gridHeight-1)) {
				continue;
			}else{
				var rTemp2 = r + (PS.random(rRange*2) - rRange);
				var gTemp2 = g + (PS.random(gRange*2) - gRange);
				var bTemp2 = b + (PS.random(bRange*2) - bRange);
				PS.color( i, j, rTemp2, gTemp2, bTemp2 );// set bead color
			}
		}
	}

	PS.data( x, y, [rTemp2, gTemp2, bTemp2]);  // set data to color value
}
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
	painting = false;
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
	if (!started){
		return;
	}
	if (x == gridWidth - 1 && y == gridHeight - 1){
		PS.statusText("Make new painting");
		return;
	}
	if (x == 0 && y == gridHeight - 1){
		PS.statusText("Change brush size");
		return;
	}
	if (painting){
		paint(x, y)
	}
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
	if (!started){
		return;
	}
	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );
	if (x == gridWidth - 1 && y == gridHeight - 1){
		PS.statusText( "Painting title: " + text );
		return;
	}
	if (x == 0 && y == gridHeight - 1){
		PS.statusText( "Painting title: " + text );
		return;
	}
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
	painting = false;
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

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	//PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

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
