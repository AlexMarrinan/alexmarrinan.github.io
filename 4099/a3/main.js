import { default as seagulls } from './seagulls.js'
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
      feed = 0.055,
      kill = 0.062

  // Tweakpane
const pane = new Pane();

const params = { dA: 1, dB: 0.5, feed:0.055, kill:0.062 }

pane
    .addBinding(params, 'dA', { min: 0, max: 1.0 })
    .on('change',  e => { sg.uniforms.da = e.value; })
pane
    .addBinding(params, 'dB', { min: 0, max: 1.0 })
    .on('change',  e => { sg.uniforms.db = e.value; })
pane
    .addBinding(params, 'feed', { min: 0, max: .1 })
    .on('change',  e => { sg.uniforms.da = e.value; })
pane
    .addBinding(params, 'kill', { min: 0, max: .1 })
    .on('change',  e => { sg.uniforms.db = e.value; })


//SET UP INITAL VALUES 
for( let i = 0; i < halfsize; i++ ) {
  state[i] = 0.95
  //store A values in first half of buffer, store B values in second half
  state[i+halfsize] = 0.05;
}

// console.log(halfsize);
// console.log(size);
// console.log(state.length);

for (let x = 40; x < 250; x++ ){
    for (let y = 200; y < 300; y++ ){
        state[index(x, y)] = 0.05;
        state[index(x, y)+halfsize] = 1.;
    }
}
for (let x = 250; x < 500; x++ ){
    for (let y = 300; y < 550; y++ ){
        state[index(x, y)] = 0.05;
        state[index(x, y)+halfsize] = 1.;
    }
}
for (let x = 0; x < 150; x++ ){
    for (let y = 0; y < 150; y++ ){
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
            feed: feed,
            kill: kill})
  .backbuffer( false )
  .pingpong( 1 )
  .compute( 
    compute, 
    workgroup_count, 
    { pingpong:['statein'] } 
  )
  .render( render )
  .run()

