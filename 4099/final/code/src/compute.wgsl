struct Particle {
  pos: vec2f,
  vel: vec2f,
  length: f32,
  style: i32
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

@group(0) @binding(10) var<storage, read_write> state: array<Particle>;
@group(0) @binding(11) var<storage, read_write> stateout: array<Particle>;

// // @group(0) @binding(14) var backSampler:    sampler;
// // @group(0) @binding(15) var backBuffer:     texture_2d<f32>;
// @group(0) @binding(14) var videoSampler:   sampler;
// @group(1) @binding(0) var videoBuffer:    texture_external;

fn cellindex( cell:vec3u ) -> u32 {
  let size = 8u;
  return cell.x + (cell.y * size) + (cell.z * size * size);
}

fn rule1(boidIndex: u32) -> vec2f{
    //TODO: GET ACTAUL ARRAY SIZE
    var v: vec2f = vec2f(0., 0.);
    var b = state[ boidIndex ];
    var s = 128*5;
    for (var i = 0; i < s; i = i + 6){
      if (i == i32(boidIndex)){
        continue;
      }
      var p = state[ i ];
      // if (distance(b.pos, p.pos) > 1.0){
      //   continue;
      // }
      v += p.pos*r1value*0.05 ;
    }
    v.x /= f32(127);
    v.y /= f32(127);

    // var ret = vec2f((v - b.pos)/100);
    let retx = (v.x-b.pos.x)/r3value;
    let rety = (v.y-b.pos.y)/r3value;
    return vec2f(retx, rety);
}

fn rule2(boidIndex: u32) -> vec2f{
    //TODO: GET ACTAUL ARRAY SIZE
    var v: vec2f = vec2f(0., 0.);
    var b = state[ boidIndex ];
    var s = 128*5;
    for (var i = 0; i < s; i = i + 6){
      if (i == i32(boidIndex)){
        continue;
      }
      var p = state[ i ];
      if (distance(p.pos, b.pos) < r2value){
        v = v - (p.pos - b.pos) * 0.1;
      }
    }
    return v;
}

fn rule3(boidIndex: u32) -> vec2f{

    //TODO: GET ACTAUL ARRAY SIZE
    var v: vec2f = vec2f(0., 0.);
    var b = state[ boidIndex ];
    var s = 128*5;
    for (var i = 0; i < s; i = i + 6){
      if (i == i32(boidIndex)){
        continue;
      }
      var p = state[ i ];
      v = v + p.vel*r3value*0.05;
    }
    v.x /= f32(s-1);
    v.y /= f32(s-1);
    var ret = vec2f((v - b.vel)/r3value);
    return ret;
}

fn wind() -> vec2f{
  var v: f32 = .015;
  return vec2f(lwind.x*v, -lwind.y*v);
}

@compute
@workgroup_size(8,8)
fn cs(@builtin(global_invocation_id) cell:vec3u)  {
  let i = cellindex( cell );
  var p = state[ i ];
  if (p.style == 1){
    return;
  }
  let v1 = rule1(i);
  let v2 = rule2(i);
  let v3 = rule3(i);
  let v4 = wind();
  // if (p.speed == 0){
  //   p.length = 10.;
  // }
  let v = v1 + v2 + v3 + v4;
  
  var next = p.pos.y;
  var nextx = p.pos.x;

  next = p.pos.y + v.y;
  state[i].vel.y = v.y;
  if( next >= 1.) { next -= 2.; }
  if( next <= -1.) { next += 2.; }
  nextx = p.pos.x + v.x;// + 0.005;
  state[i].vel.x = v.x;// + 0.005;
  if( nextx >= 1. ) { nextx -= 2.; }
  if( nextx <= -1.) { nextx += 2.; }

  state[i].pos.y = next;
  state[i].pos.x = nextx;
  //state[i].pos.x += 0.005*sin(f32(state[i].pos.x));
  // if (state[i].pos.x <= 0.){
  //     state[i].pos.x = res.x;
  // }
}
