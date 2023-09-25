import { default as seagulls } from '../../seagulls.js'
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.1/dist/tweakpane.min.js';

const WORKGROUP_SIZE = 8

let frame = 0

const sg = await seagulls.init(),
      render_shader  = await seagulls.import( './render.wgsl' ),
      compute_shader = await seagulls.import( './compute.wgsl' )

const NUM_PARTICLES = 1024, 
      // must be evenly divisble by 4 to use wgsl structs
      NUM_PROPERTIES = 4, 
      state = new Float32Array( NUM_PARTICLES * NUM_PROPERTIES )

      const pane = new Pane();
      const params = { size: 0.02}// dB: 0.5, minfeed: 0.055, feed:0.055, minkill: 0.062, kill:0.062, brushSize: 5.0, enableMouse:true}
      
     // Mouse.init();
      
      pane
          .addBinding(params, 'size', { min: 0.05, max: 0.25 })
          .on('change',  e => { sg.uniforms.size = e.value; })
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

for( let i = 0; i < NUM_PARTICLES * NUM_PROPERTIES; i+= NUM_PROPERTIES ) {
  state[ i ] = -1 + Math.random() * 2
  state[ i + 1 ] = -1 + Math.random() * 2
  state[ i + 2 ] = Math.random() * 10
}

var psize = 0.015
sg.buffers({ state })
  .backbuffer( false )
  .blend( true )
  .uniforms({ frame, res:[sg.width, sg.height ] })
  .compute( compute_shader, NUM_PARTICLES / (WORKGROUP_SIZE*WORKGROUP_SIZE) )
  .render( render_shader )
  .onframe( ()=>  sg.uniforms.frame = frame++  )
  .run( NUM_PARTICLES )

