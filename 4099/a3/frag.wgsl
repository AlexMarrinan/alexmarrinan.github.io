@group(0) @binding(0) var<uniform> res: vec2f;
@group(0) @binding(1) var<uniform> halfsize: u32;
@group(0) @binding(2) var<uniform> da: f32;
@group(0) @binding(3) var<uniform> db: f32;
@group(0) @binding(4) var<uniform> feed: f32;
@group(0) @binding(5) var<uniform> kill: f32;

@group(0) @binding(6) var<storage> state: array<f32>;

@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  let idxA : u32 = u32( pos.y * res.x + pos.x );
  let idxB : u32 = u32( pos.y * res.x + pos.x ) + halfsize;
  let vA = state[ idxA ];
  let vB = state[ idxB ];
  return vec4f( vA, vA, vA, 1.);
}
