/*
game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)

// Aaron Waldman
// Team Name: The AAA Studio
// Mod 1: Changed click color from black to random
// Mod 2: made it so that a ripple of beads originating from the clicked bead change color over time
// Mod 3: made the radius of the changed beads random
// Mod 4: Added a short musical jingle on click
// Mod 5: Changed size of grid to 32 x 32
// Mod 6: Changed the status line so that it counts the number of times clicked
// Mod 7: Changed grid background color to teal
// Mod 8: Added a white shadow around the grid
 */
/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT remove this directive!

PS.init = function( system, options ) {
	// Establish grid dimensions
	PS.gridSize( 32, 32 ); //modded to be 32x32

	PS.gridShadow(true, 255,255,255); //modded: added grid shadow

	PS.gridColor( [0,200,200] ); //modded to be teal

	// Change status line color and text

	PS.statusColor( PS.COLOR_RED ); //modded to be red
	PS.statusText( "Left click any bead for a surprise :)" ); //modded

	// Preload jingle sounds

	PS.audioLoad( "piano_d4" );
	PS.audioLoad( "piano_d5" );
	PS.audioLoad( "piano_a4" );
};
var clickNum = 0;
var count = 0;
var myTimer = null;

PS.touch = function( x, y) { //x and y are coords of mouse click.
	clickNum += 1; //counts times user has clicked
	PS.statusText("Times clicked: " + clickNum); //modded

	var randColor = [(PS.random(256) - 1), (PS.random(256) - 1), (PS.random(256) - 1)]; //sets bead to random color

	PS.color(x, y, randColor); // set color to current value of randColor
	PS.radius(x, y, 10 * (PS.random(6) - 1));


	var newX = x;
	var newY = y;
	if (!myTimer){ //if timer is null, start new timer
	myTimer = PS.timerStart(2, ripple, x, y, randColor);
	};

	PS.debug("count is " + count + "\n" +
		"PS.touch() @ " + x + ", " + y + "\n");

	PS.audioPlay("piano_d4"); //modded: plays piano now


}
var ripple = function(x,y,randColor){ //modded: now makes a ripple of beads that change color in the 4 cardinal directions
	count+=1; //count up by 1
	PS.debug("count is " + count + "\n");
	if(count>32){
		PS.debug("count is " + count + "\n");
		PS.timerStop( myTimer );
		myTimer = null;
		count = 0;
	}
	else {
		//play the 2nd, 3rd, and 4th notes of the jingle
		if(count == 5){
			PS.audioPlay("piano_d4");
		};
		if(count == 10){
			PS.audioPlay("piano_d5");
		};
		if(count == 20){
			PS.audioPlay("piano_a4");
		};

		//creates ripple effect
		if (0 <= (x - count)) {
			PS.color(x - count, y, randColor); //left of mouse
			PS.radius(x - count, y, 10 * (PS.random(6) - 1));
		};

		if ((x + count) <= 31) {
			PS.color(x + count, y, randColor); //right of mouse
			PS.radius(x + count, y, 10 * (PS.random(6) - 1));
		};

		if (0 <= (y - count)) {
			PS.color(x, y - count, randColor); //above mouse
			PS.radius(x, y - count, 10 * (PS.random(6) - 1));
		};

		if ((y + count) <= 31) {
			PS.color(x, y + count, randColor); //below mouse
			PS.radius(x, y + count, 10 * (PS.random(6) - 1));
		};


	};
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

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

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

