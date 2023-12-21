struct Particle {
  pos: vec2f,
  speed: f32,
  length: f32
};

@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<uniform> psize: f32;
@group(0) @binding(2) var<uniform> csize: f32;
@group(0) @binding(3) var<uniform> speedMult: f32;
@group(0) @binding(4) var<uniform> cloudSpeed: f32;
@group(0) @binding(5) var<uniform> res:   vec2f;
@group(0) @binding(6) var<storage, read_write> state: array<Particle>;

fn cellindex( cell:vec3u ) -> u32 {
  let size = 8u;
  return cell.x + (cell.y * size) + (cell.z * size * size);
}

@compute
@workgroup_size(8,8)
fn cs(@builtin(global_invocation_id) cell:vec3u)  {
  let i = cellindex( cell );
  var p = state[ i ];
  // if (p.speed == 0){
  //   p.length = 10.;
  // }
  var next = p.pos.y;
  var nextx = p.pos.x;
  if (p.speed > 0){
    next = p.pos.y - (0.5 / res.y) * p.speed * speedMult;
    if( next <= -1. ) { next += 3.; }
  }else{
    nextx = p.pos.x + cloudSpeed * 0.001;
    if( nextx >= 1. ) { nextx -= 2.; }
  }

  state[i].pos.y = next;
  state[i].pos.x = nextx;
  //state[i].pos.x += 0.005*sin(f32(state[i].pos.x));
  // if (state[i].pos.x <= 0.){
  //     state[i].pos.x = res.x;
  // }
}
