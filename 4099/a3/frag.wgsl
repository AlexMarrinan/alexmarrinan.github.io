@group(0) @binding(0) var<uniform> res: vec2f;

@group(0) @binding(1) var<uniform> da: f32;
@group(0) @binding(2) var<uniform> db: f32;
@group(0) @binding(3) var<uniform> minfeed: f32;
@group(0) @binding(4) var<uniform> feed: f32;
@group(0) @binding(5) var<uniform> minkill: f32;
@group(0) @binding(6) var<uniform> kill: f32;
@group(0) @binding(7) var<uniform> brushsize: f32;

@group(0) @binding(8) var<uniform> mousex: f32;
@group(0) @binding(9) var<uniform> mousey: f32;

@group(0) @binding(10) var<storage> state: array<f32>;

@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  let _res = vec2i(res);
  let x = i32(pos.x);
  let y = i32(pos.y);
  let idxA : u32 = u32( abs(y % _res.y) * _res.x + abs(x % _res.x ) );
  let idxB : u32 = u32( abs(y % _res.y) * _res.x + abs(x % _res.x ) ) + u32(_res.x*_res.y);
  let vA = state[ idxA ];
  let vB = state[ idxB ];
  return vec4f( vB, vB, vB, 1.);
}
