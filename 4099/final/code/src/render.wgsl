struct VertexInput {
  @location(0) pos: vec2f,
  @builtin(instance_index) instance: u32,
  @builtin(vertex_index) index: u32,
};

struct Particle {
  pos: vec2f,
  vel: vec2f,
  length: f32,
};

struct VertexOutput {
  @builtin( position ) pos: vec4f,
  @location(0) @interpolate(linear) particlePos: vec2f
};

@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<uniform> psize: f32;
@group(0) @binding(2) var<uniform> stateSize: u32;

@group(0) @binding(3) var<uniform> r1value: f32;
@group(0) @binding(4) var<uniform> r2value: f32;
@group(0) @binding(5) var<uniform> r3value: f32;
@group(0) @binding(6) var<uniform> lwind: vec2f;
@group(0) @binding(7) var<uniform> rwind: vec2f;
@group(0) @binding(8) var<uniform> camOp: f32;
@group(0) @binding(9) var<uniform> res:   vec2f;

@group(0) @binding(10) var videoSampler:   sampler;

@group(0) @binding(11) var<storage> state: array<Particle>;
@group(0) @binding(12) var<storage> stateout: array<Particle>;

@group(1) @binding(0) var videoBuffer:    texture_external;


// // @group(0) @binding(13) var backSampler:    sampler;
// // @group(0) @binding(14) var backBuffer:     texture_2d<f32>;



@vertex 
fn vs( input: VertexInput ) -> VertexOutput{
  let aspect = res.y / res.x;
  let p = state[ input.instance ];
  var size = input.pos * psize;
  let ind = input.index;

  // if (p.speed == 0){
  //   size = input.pos * csize;
  // }
  // let pos = vec4f( (p.pos.x - size.x * aspect)*0.4, p.length*(p.pos.y + size.y), 0., 0.5); 
  var x = rwind.x;
  var y = rwind.y;
  if (x < 0.5){
     x = 0.5;
  }
  if (y < 0.5){
     y = 0.5;
  }
let position = array<vec2f,6>(
    //Bottom right
    vec2f(1,0),
    //Bottom left
    vec2f(0,0),
    //Top left
    vec2f(0,1),
    //Bottom right
    vec2f(1,0),
    //Top left
    vec2f(0,1),
    //Top right
    vec2f(1,1)
  );
  let pos = vec4f( f32(p.pos.x - size.x * aspect), f32(p.pos.y + size.y), 0., 1.); 
  return VertexOutput(pos, position[ind]);

}

@fragment 
fn fs( vertexOutput : VertexOutput ) -> @location(0) vec4f {
  let pos = vertexOutput.pos;
  let p = pos.xy / res;
  let particlePos = vertexOutput.particlePos;
  if(distance(particlePos,vec2f(0.5)) > .4){
    discard;
  }
  let red =  f32(pos.y)/res.y + 0.3;
  let green =  f32(pos.x)/res.x + 0.2;
  //let fb = textureSample( backBuffer, backSampler, p );
  let vid = textureSampleBaseClampToEdge( videoBuffer, videoSampler, p );
  var boids =  vec4f(red,green, 0.0 , 1.0 );
  var out = mix(vid, boids, camOp);
  return out;
}
