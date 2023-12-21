/*
game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT remove this directive!

// Alex Marrinan
// AAA Studio
// Mod 1: Changed size of grid to 16 x 16
// Mod 2: Drag over multiple beads to paint in one stroke
// Mod 3: Change color by pressing number buttons (1-9)
// Mod 4: Change grid size using arrow keys
// Mod 5: Fill entire board by pressing F key


//key vaues
let WHITE = 49  //1
let BLACK = 50  //2
let RED = 51    //3
let ORANGE = 52 //4
let YELLOW = 53 //5
let GREEN = 54  //6
let BLUE = 55   //7
let VIOLET = 56 //8
let GRAY = 57 //9

let FILL_KEY = 102   //F
let HELP_KEY = 104 //H
let UP_KEY = 1006    //UP
let DOWN_KEY = 1008  //DOWN
let LEFT_KEY = 1005  //LEFT
let RIGHT_KEY = 1007 //RIGHT

//Board size
var boardWidth = 16
var boardHeight = 16

//Current Color
var currentColor = PS.COLOR_BLACK //default color is black
var painting = false;			  //indicates when the user is pressing, and when beads should change color

PS.init = function( system, options ) {
	// Establish grid dimensions

	PS.gridSize( boardWidth, boardHeight );

	// Set background color to Perlenspiel logo gray

	PS.gridColor( 0x303030 );

	// Change status line color and text

	PS.statusColor( PS.COLOR_WHITE );
	PS.statusText( "Paint! (Press 'H' for help)");
	
	// Preload click sound

	PS.audioLoad( "fx_click" );
};

PS.touch = function( x, y, data, options ) {
	//when the user holds left click, begin painting
	painting = true;
	//paint current bead
	PS.color( x, y, currentColor ); // set color to currentColor
	PS.data( x, y, currentColor );  // set data to color value
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
	//once the user lets go of left click, stop painting
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

	//if the user is painting (i.e, holding left click) set the current beads color
	if (painting){
		PS.color( x, y, currentColor ); // set color to currentColor
		PS.data( x, y, currentColor );  // set data to color value
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
	//when the user exits the gird, stop painting
	//this is needed when the user let goes of left mouse when outside the grid, the release method is not called
	//since the user is not currently releasing on a bead
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

	//PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );
	
	if (key == HELP_KEY){//H key displays help/controls text
		PS.statusText( "1-9: change color|F: fill|Arrows: change size");
	}
	else if (key == FILL_KEY){ //F key fills board with current color
		fillCanvas();
	}
	else if (key == RIGHT_KEY){ //right key increases the grid width
		changeCanvasSize(true, +1)
	}
	else if (key == LEFT_KEY){//left key decreases the grid width
		changeCanvasSize(true, -1);
	}
	else if (key == UP_KEY){ //up key increases the grid height
		changeCanvasSize(false, +1);
	}
	else if (key == DOWN_KEY){//down key decreases the grid height
		changeCanvasSize(false, -1);
	}
	else {//check if should change color
		changeColor(key);
	}
};

//fills the canvas with the current color
function fillCanvas(){
	for (let x = 0; x < boardWidth; x++) {
		for (let y = 0; y < boardHeight; y++) {
			PS.color(x, y, currentColor);
			PS.data(x, y, currentColor);
		}
	}
	PS.statusText(`Filled Canvas`);
}


//changes the boards width or height by the given amount
//width: boolean that says whether to change the width or height
//amount: amount to change the given board dimension by 
function changeCanvasSize (width, amount){ 
	if (width == true){
		boardWidth += amount;
		if (boardWidth > 32){
			boardWidth = 32;
		}else if (boardWidth < 1){
			boardWidth = 1;
		}
	}else{
		boardHeight += amount;
		if (boardHeight > 32){
			boardHeight = 32;
		}else if (boardHeight < 1){
			boardHeight = 1;
		}
	}
	PS.gridSize(boardWidth, boardHeight);
	PS.gridColor( 0x303030 );
	PS.statusColor( PS.COLOR_WHITE );
	PS.statusText(`Changed Canvas Size: ${boardWidth}x${boardHeight}`);
};

//change the current color if the given key is any number between 1-8
function changeColor(key){
	if (key == BLACK){
		PS.statusText( "Changed Color: Black" );		//display new text showing what color they are now using
		currentColor = PS.COLOR_BLACK	//change the currently used color value
	}
	else if (key == WHITE){
		PS.statusText( "Changed Color: White" );
		currentColor = PS.COLOR_WHITE
	}
	else if (key == RED){
		PS.statusText( "Changed Color: Red" );
		currentColor = PS.COLOR_RED
	}
	else if (key == GREEN){
		PS.statusText( "Changed Color: Green" );
		currentColor = PS.COLOR_GREEN
	}
	else if (key == BLUE){
		PS.statusText( "Changed Color: Blue" );
		currentColor = PS.COLOR_BLUE
	}
	else if (key == YELLOW){
		PS.statusText( "Changed Color: Yellow" );
		currentColor = PS.COLOR_YELLOW
	}
	else if (key == ORANGE){
		PS.statusText( "Changed Color: Orange" );
		currentColor = PS.COLOR_ORANGE
	}
	else if (key == VIOLET){
		PS.statusText( "Changed Color: Violet" );
		currentColor = PS.COLOR_VIOLET
	}
	else if (key == GRAY){
		PS.statusText( "Changed Color: Gray" );
		currentColor = PS.COLOR_GRAY
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

