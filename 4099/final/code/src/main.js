import { default as seagulls } from '../../seagulls.js'
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js';

const WORKGROUP_SIZE = 8

let frame = 0

const sg = await seagulls.init(),
      render_shader  = await seagulls.import( './render.wgsl' ),
      compute_shader = await seagulls.import( './compute.wgsl' )

const NUM_PARTICLES = 48, 
      // must be evenly divisble by 4 to use wgsl structs
      NUM_PROPERTIES = 5, 
      stateSize = 64*5, //NUM_PARTICLES * NUM_PROPERTIES,
      state = new Float32Array( 64*5 )

      const pane = new Pane();
      const params = { particleSize: 0.007, cloudSize: 0.08, fallSpeed: 1.0, cloudSpeed: 1.0}// dB: 0.5, minfeed: 0.055, feed:0.055, minkill: 0.062, kill:0.062, brushSize: 5.0, enableMouse:true}
      
     // Mouse.init();
    var psize = 0.02
    var csize = 0.08
    var speedMult = 1.0
    var cloudSpeed = 1.0
    pane
          .addBinding(params, 'particleSize', { min: 0.001, max: 0.06 })
          .on('change',  e => { psize = e.value; })
    pane
        .addBinding(params, 'cloudSize', { min: 0.005, max: 0.2 })
        .on('change',  e => { csize = e.value; })
    pane
          .addBinding(params, 'fallSpeed', { min: 0.05, max: 5.0 })
          .on('change',  e => { speedMult = e.value; })
    pane
          .addBinding(params, 'cloudSpeed', { min: 0.05, max: 5.0 })
          .on('change',  e => { cloudSpeed = e.value; })
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

  const NUM_CLOUDPARTICLES = 0;

  // var x = -1.;
  // var y = 1.0;
  // for( let i = 0; i < NUM_CLOUDPARTICLES*NUM_PROPERTIES; i+= NUM_PROPERTIES ) {
  //     state[ i ] = x;
  //     state[ i + 1 ] = y;
  //     state[ i + 2 ] = 0.0
  //     state[ i + 3 ] = 0.0;
  //     state[ i + 4 ] = 0.5;
  //     // x += 0.08 * Math.random();
  //     // if (x > 1.0){
  //     //   x = -1.;
  //     //   y -= 0.02;
  //     // }
  // }


for( let i = 0; i < NUM_PARTICLES*NUM_PROPERTIES ; i+= NUM_PROPERTIES ) {
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

sg.buffers({ state })
  .backbuffer( false )
  .blend( true )
  .uniforms({ frame, psize: psize, csize: csize, speedMult: speedMult, cloudSpeed: cloudSpeed, stateSize: 16*5, res:[sg.width, sg.height] })
  .compute( compute_shader, [8, 8] )
  .render( render_shader )
  .onframe( ()=>  {
          sg.uniforms.frame = frame++;
          sg.uniforms.psize = psize;
          sg.uniforms.csize = csize;
          sg.uniforms.speedMult = speedMult;
          sg.uniforms.cloudSpeed = cloudSpeed;
        }
      )
  .run( NUM_PARTICLES )

