import { default as seagulls } from '../../seagulls.js'
import { default as Video    } from '../video.js'
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js';

const WORKGROUP_SIZE = 8

let frame = 0

var sg = await seagulls.init(),
      render_shader  = await seagulls.import( './render.wgsl' ),
      compute_shader = await seagulls.import( './compute.wgsl' )

var   NUM_PARTICLES = 1024, 
      NUM_BACKGROUND_PARTICLES = 2048,
      // must be evenly divisble by 4 to use wgsl structs
      NUM_PROPERTIES = 6, 
      stateSize =(NUM_PARTICLES+NUM_BACKGROUND_PARTICLES)*NUM_PROPERTIES,
      state = new Float32Array( stateSize )

      const pane = new Pane();
      const params = { boidsCount: 1024, boidSize: 0.01, r1: 50, r2: 0.15, r3: 100.0, cameraOpacity: 1.0}// dB: 0.5, minfeed: 0.055, feed:0.055, minkill: 0.062, kill:0.062, brushSize: 5.0, enableMouse:true}
      
     // Mouse.init();
    var psize = 0.01
    var r1 = 50.0
    var r2 = 0.15 
    var r3 = 100.0
    var cameraOpacity = 1.0
    let lwind = [0, 0];
    let rwind = [0, 0];
    
    pane
        .addBinding(params, 'boidsCount', { min: 64, max: 2048 })
        .on('change',  e => { NUM_PARTICLES = e.value; })
    pane
          .addBinding(params, 'boidSize', { min: 0.001, max: 0.12 })
          .on('change',  e => { psize = e.value; })
    pane
        .addBinding(params, 'r1', { min: 0, max: 200})
        .on('change',  e => { r1 = e.value; })
    pane
        .addBinding(params, 'r2', { min: 0, max: 0.5 })
        .on('change',  e => { r2 = e.value; })
    pane
        .addBinding(params, 'r3', { min: 50, max: 1000 })
        .on('change',  e => { r3 = e.value; })
    pane
        .addBinding(params, 'cameraOpacity', { min: 0., max: 1. })
        .on('change',  e => { cameraOpacity = e.value; })
    const btn = pane.addButton({
      title: 'Reset',
      label: 'reset',   // optional
    });

    btn.on('click',async ()  => {
      sg = await seagulls.init(),
      render_shader  = await seagulls.import( './render.wgsl' ),
      compute_shader = await seagulls.import( './compute.wgsl' )
      run();
    });
    pane

    // pane.addBinding(params, 'controller', {
    //   options: {
    //     xbox: 0,
    //     switch: 1,
    //   },
    // })
    //       .on('change',  e => { controller = e.value; })

const workgroup_count = [
  Math.round( window.innerWidth /  8), 
  Math.round( window.innerHeight / 8), 
  1
] 

function motion(event){
  console.log("Accelerometer: "
    + event.accelerationIncludingGravity.x + ", "
    + event.accelerationIncludingGravity.y + ", "
    + event.accelerationIncludingGravity.z
  );
}
window.addEventListener("gamepadconnected", (e) => {
  console.log(
    "Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index,
    e.gamepad.id,
    e.gamepad.buttons.length,
    e.gamepad.axes.length,
  );
  gameLoop();

});

let interval;

// if (!("ongamepadconnected" in window)) {
//   // No gamepad events available, poll instead.
//   interval = setInterval(pollGamepads, 500);
// }

// function pollGamepads() {
//   const gamepads = navigator.getGamepads();
//   for (const gp of gamepads) {
//     clearInterval(interval);
//   }
// }

function testAxes(a){
  let lx = a[0];
  let ly = a[1];
  let rx = a[2];
  let ry = a[3];
  if (lx > 0 && lx < 0.2){
    lx = 0;
  }
  if (lx < 0 && lx > -0.2){
    lx = 0;
  }
  if (ly > 0 && ly < 0.2){
    ly = 0;
  }
  if (ly < 0 && ly > -0.2){
    ly = 0;
  }

  if (rx > 0 && rx < 0.2){
    rx = 0;
  }
  if (rx < 0 && rx > -0.2){
    rx = 0;
  }
  if (ry > 0 && ry < 0.2){
    ry = 0;
  }
  if (ry < 0 && ry > -0.2){
    ry = 0;
  }
  lwind = [lx, ly];
  rwind = [rx, ry];
}
function gameLoop() {
  const gamepads = navigator.getGamepads();
  if (!gamepads) {
    return;
  }
  let gp = gamepads[0];
  let axes = gp.axes;
  
  testAxes(axes);
  requestAnimationFrame(gameLoop);
}


await Video.init()
run()

function generateBoids(){
  for( let i = 0; i < NUM_PARTICLES*NUM_PROPERTIES ; i+= NUM_PROPERTIES ) {
    state[ i ] = -1 + Math.random()*2
    state[ i + 1 ] = -1 + Math.random()*2
    state[ i + 2 ] = (-0.5 + Math.random())*0.5
    state[ i + 3 ] = (-0.5 + Math.random())*0.5
    state[ i + 4 ] = 0.15;
    state[ i + 5 ] = 0.0;
  }
}

function generateBuffers(){
  sg.buffers({ state:state, stateout:state })
  .backbuffer( false )
  .blend( true )
  .uniforms({ frame, psize: psize, stateSize: stateSize, r1value:r1, r2value:r2, r3value:r3, lwind:lwind,rwind: rwind, camOp: cameraOpacity, res:[sg.width, sg.height] })
  .textures([ Video.element ])
  .compute( compute_shader, workgroup_count)
  .render( render_shader )
  .onframe( ()=>  {
          sg.uniforms.frame = frame++;
          sg.uniforms.psize = psize;
          sg.uniforms.r1value = r1;
          sg.uniforms.r2value = r2;
          sg.uniforms.r3value = r3;
          sg.uniforms.lwind = lwind;
          sg.uniforms.rwind = rwind;
          sg.uniforms.camOp = cameraOpacity;
        }
      )
  .run( NUM_PARTICLES )
}

function run(){
  generateBoids()
  generateBuffers()
}


