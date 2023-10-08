struct VertexInput {
  @location(0) pos: vec2f,
  @builtin(instance_index) instance: u32,
  @builtin(vertex_index) index: u32,
};

struct Particle {
  pos: vec2f,
  vel: vec2f,
  length: f32
};

struct VertexOutput {
  @builtin( position ) pos: vec4f,
  @location(0) @interpolate(linear) particlePos: vec2f
};

@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<uniform> psize: f32;
@group(0) @binding(2) var<uniform> csize: f32;
@group(0) @binding(3) var<uniform> speedMult: f32;
@group(0) @binding(4) var<uniform> cloudSpeed: f32;
@group(0) @binding(5) var<uniform> stateSize: u32;
@group(0) @binding(6) var<uniform> res:   vec2f;
@group(0) @binding(7) var<storage> state: array<Particle>;

@vertex 
fn vs( input: VertexInput ) ->  @builtin(position) vec4f {
  let aspect = res.y / res.x;
  let p = state[ input.instance ];
  var size = input.pos * psize;
  // if (p.speed == 0){
  //   size = input.pos * csize;
  // }
  // let pos = vec4f( (p.pos.x - size.x * aspect)*0.4, p.length*(p.pos.y + size.y), 0., 0.5); 
  return vec4f( p.pos.x - size.x * aspect, p.pos.y + size.y, 0., 1.); 
}

@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {;
  let red =  f32(pos.y)/res.y + 0.6;
  let green =  f32(pos.y)/res.y + 0.8;
  return vec4f(red, green, 5.0 , .1 );
}

