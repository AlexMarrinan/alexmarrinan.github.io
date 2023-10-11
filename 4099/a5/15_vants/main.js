import { default as seagulls } from '../seagulls.js'

const WORKGROUP_SIZE = 8,
      GRID_SIZE = 32,
      NUM_AGENTS = 64

const W = Math.round( window.innerWidth  / GRID_SIZE ),
      H = Math.round( window.innerHeight / GRID_SIZE )


//TODO: MAKE SHADERS SEPERATE FILES MAYBE IDK
//const render_shader = await seagulls.import('render.wgsl')

const render_shader = seagulls.constants.vertex + `
struct VertexInput {
  @location(0) pos: vec2f,
  @builtin(instance_index) instance: u32,
}

struct Vant {
  pos: vec2f,
  dir: f32,
  flag: f32
}

@group(0) @binding(0) var<storage> vants: array<Vant>;
@group(0) @binding(1) var<storage> pheromones: array<f32>;
@group(0) @binding(2) var<storage> render: array<f32>;

@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  let grid_pos = floor( pos.xy / ${GRID_SIZE}.);
  
  let pidx = grid_pos.y  * ${W}. + grid_pos.x;
  let p = pheromones[ u32(pidx) ];
  let v = render[ u32(pidx) ];

  let out = select( vec3(p) , vec3(1.,0.,0.), v == 1. );
  
  return vec4f( out, 1. );
}`
 
const compute_shader1 =`
struct Vant {
  pos: vec2f,
  dir: f32,
  flag: f32
}

@group(0) @binding(0) var<storage, read_write> vants: array<Vant>;
@group(0) @binding(1) var<storage, read_write> pheremones: array<f32>;
@group(0) @binding(2) var<storage, read_write> render: array<f32>;

fn vantIndex( cell:vec3u ) -> u32 {
  let size = ${WORKGROUP_SIZE}u;
  return cell.x + (cell.y * size); 
}

fn pheromoneIndex( vant_pos: vec2f ) -> u32 {
  let width = ${W}.;
  return u32( abs( vant_pos.y % ${H}. ) * width + vant_pos.x );
}

@compute
@workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE},1)

fn cs(@builtin(global_invocation_id) cell:vec3u)  {
  let pi2   = ${Math.PI*2};
  let index = vantIndex( cell );
  var vant:Vant  = vants[ index ];

  let pIndex    = pheromoneIndex( vant.pos );
  let pheromone = pheremones[ pIndex ];
  let flag = vant.flag;
  // if pheromones were found

  //type 0: standard
  if (flag == 0.0){ //type 0
    if (pheromone != 0.){
      vant.dir += .25; // turn 90 degrees ccw
      pheremones[ pIndex ] = 0.;  // set pheromone flag
    }else{
      vant.dir -= .25; // turn clockwise
      pheremones[ pIndex ] = 1.;  // unset pheromone flag
    }
  }

  //type 1: loops 
  if (flag == 1.0){ 
    if (pheromone != 0.){
      vant.dir -= .25; // turn 90 degrees cw
      pheremones[ pIndex ] = 0.;  // set pheromone flag
    }else{
      vant.dir += .05; // rotate slightly clockwise
      pheremones[ pIndex ] = 1.;  // unset pheromone flag
    }
  }

  //type 2: slowly seperating lines
  if (flag == 2.0){ 
    if (pheromone != 0.){
      vant.dir -= 5; // turn 180 degrees
      pheremones[ pIndex ] = 0.;  // set pheromone flag
    }else{
      vant.dir += .25; // turn counter-clockwise
      pheremones[ pIndex ] = 1.;  // unset pheromone flag
    }
  }

  //type 3: ever expanding boat
  if (flag == 3.0){ 
    if (pheromone != 0.){
      vant.dir += .2; // turn 90 cw
      pheremones[ pIndex ] = 0.;  // set pheromone flag
    }else{
      vant.dir += .5; // turn 180
      pheremones[ pIndex ] = 1.;  // unset pheromone flag
    }
  }

  // calculate direction based on vant heading
  let dir = vec2f( cos( vant.dir * pi2 ), sin( vant.dir * pi2 ) );
  
  vant.pos = round( vant.pos + dir ); 

  vants[ index ] = vant;
  
  // we'll look at the render buffer in the fragment shader
  // if we see a value of one a vant is there and we can color
  // it accordingly. in our JavaScript we clear the buffer on every
  // frame.
  render[ pIndex ] = 1.;
}`

// const render_shader  = await seagulls.import( './render.wgsl' ),
//       compute_shader = await seagulls.import( './compute.wgsl' )

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const NUM_PROPERTIES = 4 // must be evenly divisble by 4!
const pheromones   = new Float32Array( W*H ) // hold pheromone data
const vants_render = new Float32Array( W*H ) // hold info to help draw vants
const vants        = new Float32Array( NUM_AGENTS * NUM_PROPERTIES ) // hold vant info


for( let i = 0; i < NUM_AGENTS * NUM_PROPERTIES; i+= NUM_PROPERTIES ) {
  vants[ i ]   = Math.floor( Math.random() * W )
  vants[ i+1 ] = Math.floor( Math.random() * H )
  vants[ i+2 ] = 0 // this is used to hold direction
  vants[ i+3 ] = getRandomInt(0, 3)
}

const sg = await seagulls.init()

sg.buffers({
    vants:vants,
    pheromones:pheromones,
    vants_render
  })
  .backbuffer( false )
  .compute( compute_shader1, 1 )
  .render( render_shader )
  .onframe( ()=> sg.buffers.vants_render.clear() )
  .run( 1, 100 )
