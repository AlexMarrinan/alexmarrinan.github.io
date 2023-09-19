import { default as seagulls } from './seagulls.js'

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
      dB = 0.25,
      feed = 0.055,
      kill = 0.062

for( let i = 0; i < halfsize; i++ ) {
  state[i] = 1.0
  //store A values in first half of buffer, store B values in second half
  state[i+halfsize] = 0.0;
}

// console.log(halfsize);
// console.log(size);
// console.log(state.length);

for (let x = 40; x < 250; x++ ){
    for (let y = 200; y < 300; y++ ){
        state[index(x, y)] = 0.0;
        state[index(x, y)+halfsize] = 1.0;
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
            halfsize:halfsize,
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

