import { default as seagulls } from '../../seagulls.js'
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js';

const WORKGROUP_SIZE = 8

let frame = 0

const sg = await seagulls.init(),
      render_shader  = await seagulls.import( './render.wgsl' ),
      compute_shader = await seagulls.import( './compute.wgsl' )

const NUM_PARTICLES = 128, 
      // must be evenly divisble by 4 to use wgsl structs
      NUM_PROPERTIES = 5, 
      stateSize = 128*5, //NUM_PARTICLES * NUM_PROPERTIES,
      state = new Float32Array( 256*5 )

      const pane = new Pane();
      const params = { boidSize: 0.01, r1: 50, r2: 0.15, r3: 50.}// dB: 0.5, minfeed: 0.055, feed:0.055, minkill: 0.062, kill:0.062, brushSize: 5.0, enableMouse:true}
      
     // Mouse.init();
    var psize = 0.01
    var csize = 0.08
    var speedMult = 1.0
    var cloudSpeed = 1.0
    var r1 = 50.0
    var r2 = 0.15 
    var r3 = 50.0
    pane
          .addBinding(params, 'boidSize', { min: 0.001, max: 0.06 })
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

for( let i = 0; i < 90*NUM_PROPERTIES ; i+= NUM_PROPERTIES ) {
  state[ i ] = -1 + Math.random()*2
  state[ i + 1 ] = -1 + Math.random()*2
  state[ i + 2 ] = (-0.5 + Math.random())*0.5
  state[ i + 3 ] = (-0.5 + Math.random())*0.5
  state[ i + 4 ] = 0.15;
}

const workgroup_count = [
  Math.round( window.innerWidth /  8), 
  Math.round( window.innerHeight / 8), 
  1
] 

sg.buffers({ state:state, stateout:state })
  .backbuffer( false )
  .blend( true )
  .uniforms({ frame, psize: psize, csize: csize, speedMult: speedMult, cloudSpeed: cloudSpeed,  stateSize: 16*5, r1value:r1, r2value:r2, r3value:r3,res:[sg.width, sg.height] })
  .pingpong( 1 )
  .compute( compute_shader, workgroup_count,{ pingpong:['state'] })
  .render( render_shader )
  .onframe( ()=>  {
          sg.uniforms.frame = frame++;
          sg.uniforms.psize = psize;
          sg.uniforms.csize = csize;
          sg.uniforms.speedMult = speedMult;
          sg.uniforms.cloudSpeed = cloudSpeed;
          sg.uniforms.r1value = r1;
          sg.uniforms.r2value = r2;
          sg.uniforms.r3value = r3;
        }
      )
  .run( NUM_PARTICLES )

