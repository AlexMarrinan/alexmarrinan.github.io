@group(0) @binding(0) var<uniform> res: vec2f;
@group(0) @binding(1) var<uniform> da: f32;
@group(0) @binding(2) var<uniform> db: f32;
@group(0) @binding(3) var<uniform> feed: f32;
@group(0) @binding(4) var<uniform> kill: f32;
@group(0) @binding(5) var<storage> state: array<f32>;

@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  let _res = vec2i(res);
  let idxA : u32 = u32( pos.y * res.x + pos.x );
  let idxB : u32 = u32( pos.y * res.x + pos.x ) + u32(_res.x*_res.y);
  let vA = state[ idxA ];
  let vB = state[ idxB ];
  return vec4f( vB, vB, vB, 1.);
}
