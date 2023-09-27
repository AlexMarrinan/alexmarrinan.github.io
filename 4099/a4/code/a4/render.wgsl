struct VertexInput {
  @location(0) pos: vec2f,
  @builtin(instance_index) instance: u32,
  @builtin(vertex_index) index: u32,
};

struct Particle {
  pos: vec2f,
  speed: f32,
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
@group(0) @binding(5) var<uniform> res:   vec2f;
@group(0) @binding(6) var<storage> state: array<Particle>;

@vertex 
fn vs( input: VertexInput ) ->  VertexOutput {
  let aspect = res.y / res.x;
  let p = state[ input.instance ];
  var size = input.pos * psize;
  if (p.speed == 0){
    size = input.pos * csize;
  }
  let ind = input.index;
  let position = array<vec2f,4>(
    //Bottom right
    vec2f(5,0),
    //Bottom left
    vec2f(0,0),
    //Top left
    vec2f(0,5),
    //Bottom right
    vec2f(5,0),
    // //Top left
    // vec2f(0,1),
    // //Top right
    // vec2f(1,1)
  );
  // let pos = vec4f( (p.pos.x - size.x * aspect)*0.4, p.length*(p.pos.y + size.y), 0., 0.5); 
  let pos = vec4f( p.pos.x - size.x * aspect, p.pos.y + size.y, 0., 1.); 
  return VertexOutput(pos,position[ind]);
}

@fragment 
fn fs( vo: VertexOutput ) -> @location(0) vec4f {
  let spos = vo.pos;
  var pos: vec2f = spos.xy/res;
  let red =  f32(res.y - pos.y);
  let green =  f32(res.y - pos.y);

  // let red = 0.4+0.2*sin(frame/60.);
  // let blue = 0.4+0.2*cos(frame/60.);
  return vec4f(1., 1., 5.0 , .1 );
}
// @fragment 
// fn fs( vo: VertexOutput ) -> @location(0) vec4f {
//   let spos = vo.pos;
//   // return vec4f(vo.particlePos,0.,1.);
//   let particlePos = vo.particlePos;
//   var pos: vec2f = spos.xy/res;
//   let aspect = res.y/res.x;
//   pos.x/=aspect;
//   if(distance(particlePos,vec2f(0.5)) > .4){
//     discard;
//   }
//    let brightness = pow(pos.y,dropoffRate);
//     let red = 0.4+0.2*sin(frame/60.);
//     let blue = 0.4+0.2*cos(frame/60.);
//   return vec4f( vec3f(red, .9, blue)*brightness , 1.);
// }
