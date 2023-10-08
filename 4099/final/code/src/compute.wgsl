struct Particle {
  pos: vec2f,
  vel: vec2f,
  length: f32
};

@group(0) @binding(0) var<uniform> frame: f32;
@group(0) @binding(1) var<uniform> psize: f32;
@group(0) @binding(2) var<uniform> csize: f32;
@group(0) @binding(3) var<uniform> speedMult: f32;
@group(0) @binding(4) var<uniform> cloudSpeed: f32;
@group(0) @binding(5) var<uniform> stateSize: u32;
@group(0) @binding(6) var<uniform> res:   vec2f;
@group(0) @binding(7) var<storage, read_write> state: array<Particle>;

fn cellindex( cell:vec3u ) -> u32 {
  let size = 8u;
  return cell.x + (cell.y * size) + (cell.z * size * size);
}

fn rule1(boidIndex: u32) -> vec2f{
    //TODO: GET ACTAUL ARRAY SIZE
    var v: vec2f = vec2f(0., 0.);
    var b = state[ boidIndex ];
    var s: u32 = 48*5;
    for (var i:u32 = 0; i < s; i = i + 5){
      if (i == boidIndex){
        continue;
      }
      var p = state[ i ];
      v += p.pos;
    }
    v.x /= f32(48-1);
    v.y /= f32(48-1);

    var ret = (v - b.pos)/50;
    return ret;
}

fn rule2(boidIndex: u32) -> vec2f{

    //TODO: GET ACTAUL ARRAY SIZE
    var v: vec2f = vec2f(0., 0.);
    var b = state[ boidIndex ];
    var s: u32 = 48*5;
    for (var i:u32 = 0; i < s; i = i + 5){
      if (i == boidIndex){
        continue;
      }
      var p = state[ i ];
      if (distance(p.pos, b.pos) < 0.15){
        v = v - (p.pos - b.pos);
      }
    }
    return v;
}

fn rule3(boidIndex: u32) -> vec2f{

    //TODO: GET ACTAUL ARRAY SIZE
    var v: vec2f = vec2f(0., 0.);
    var b = state[ boidIndex ];
    var s: u32 = 48*5;
    for (var i:u32 = 0; i < s; i = i + 5){
      if (i == boidIndex){
        continue;
      }
      var p = state[ i ];
      v = v + p.vel;
    }
    v.x /= f32(48-1);
    v.y /= f32(48-1);
    var ret = (v - b.vel)*0.005;
    return ret;
}

@compute
@workgroup_size(8,8)
fn cs(@builtin(global_invocation_id) cell:vec3u)  {
  let i = cellindex( cell );
  let v1 = rule1(i);
  let v2 = rule2(i);
  let v3 = rule3(i);
  var p = state[ i ];
  // if (p.speed == 0){
  //   p.length = 10.;
  // }
  let v = v1 + v2 + v3;
  
  var next = p.pos.y;
  var nextx = p.pos.x;

  next = p.pos.y + v.y;
  state[i].vel.y = v.y;
  if( next >= 1) { next -= 2.; }
  if( next <= -1) { next += 2.; }
  nextx = p.pos.x + v.x;// + 0.005;
  state[i].vel.x = v.x;// + 0.005;
  if( nextx >= 1 ) { nextx -= 2.; }
  if( nextx <= -1) { nextx += 2.; }

  state[i].pos.y = next;
  state[i].pos.x = nextx;
  //state[i].pos.x += 0.005*sin(f32(state[i].pos.x));
  // if (state[i].pos.x <= 0.){
  //     state[i].pos.x = res.x;
  // }
}