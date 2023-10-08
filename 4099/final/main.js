import { default as seagulls } from './seagulls.js'
import { default as Mouse    } from './mouse.js'
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js';

function index(x, y){
    return y * window.innerWidth + x;
}

const sg      = await seagulls.init(),
      frag    = await seagulls.import( './frag.wgsl' ),
      compute = await seagulls.import( './compute.wgsl' ),
      render  = seagulls.constants.vertex + frag,
      size    = window.innerWidth * window.innerHeight * 2,
      halfsize = window.innerWidth * window.innerHeight,
      state   = new Float32Array( size ),
      dA = 1.0,
      dB = 0.05,
      minfeed = 0.055,
      feed = 0.055,
      minkill = 0.055,
      kill = 0.062

var mousex = 0;
var mousey = 0;
var mousedown = false;
var mouseenabled = true;
  // Tweakpane
// const pane = new Pane();
// const params = { dA: 1, dB: 0.5, minfeed: 0.055, feed:0.055, minkill: 0.062, kill:0.062, brushSize: 5.0, enableMouse:true}

Mouse.init();

// pane
//     .addBinding(params, 'dA', { min: 0, max: 1.0 })
//     .on('change',  e => { sg.uniforms.da = e.value; })
// pane.addBinding(params, 'dB', { min: 0, max: 1.0 })
//     .on('change',  e => { sg.uniforms.db = e.value; })
// pane.addBinding(params, 'minfeed', { min: 0.001, max: .1 })
//     .on('change',  e => { sg.uniforms.minfeed = e.value; })
// pane.addBinding(params, 'feed', { min: 0.001, max: .1 })
//     .on('change',  e => { sg.uniforms.feed = e.value; })
// pane.addBinding(params, 'minkill', { min: 0.001, max: .1 })
//     .on('change',  e => { sg.uniforms.minkill = e.value; })
// pane.addBinding(params, 'kill', { min: 0.001, max: .1 })
//     .on('change',  e => { sg.uniforms.kill = e.value; })
// pane.addBinding(params, 'brushSize', { min: 1, max: 50})
//     .on('change',  e => { sg.uniforms.brushsize = e.value; })
// pane.addBinding(params, 'enableMouse')
//     .on('change',  e => { mouseenabled = e.value; })
//SET UP INITAL VALUES 
for( let i = 0; i < halfsize; i++ ) {
  state[i] = 0.95
  //store A values in first half of buffer, store B values in second half
  state[i+halfsize] = 0.05;
}

//SET UP B VALUES
for (let x = 40; x < 500; x++ ){
    for (let y = 100; y < 420; y++ ){
        state[index(x, y)] = 0.05;
        state[index(x, y)+halfsize] = 1.;
    }
}

const workgroup_count = [
    Math.round( window.innerWidth /  8), 
    Math.round( window.innerHeight / 8), 
    1
  ] 

//window.addEventListener( 'load', function() {
sg.buffers({ statein:state, stateout:state })
  .uniforms({ resolution:[ window.innerWidth, window.innerHeight ],
            da: dA,
            db: dB,
            minfeed: minfeed,
            feed: feed,
            minkill: minkill,
            kill: kill,
            brushsize: 5.0,
            mousex: 0,
            mousey: 0
        })
  .backbuffer( false )
  .pingpong( 1 )
  .compute( 
    compute, 
    workgroup_count, 
    { pingpong:['statein'] } 
  )
  .onframe( () => {
    if (mousedown){
        mousex = Mouse.values[0]*window.innerWidth;
        mousey = Mouse.values[1]*window.innerHeight;
    }else{
        mousex = 0
        mousey = 0
    }
    sg.uniforms.mousex = mousex
    sg.uniforms.mousey = mousey
  })
  .render( render )
  .run()

window.onmousedown=function(){
    if (mouseenabled){
        mousedown = true;
    }
}

window.onmouseup = function(){
    mousedown = false;
}