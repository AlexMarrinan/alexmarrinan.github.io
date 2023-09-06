@fragment 
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  var p : vec2f = uvN( pos.xy );
  p.y -= .5;

  var color: f32 = 0.;
  let bpm: f32 = 187;
  let offset: f32 = 2;
  for (var i:f32 = 1.; i <= 3.; i+= 1.) {
       p.y += sin( p.x * 5 + (p.x + frame/bpm*offset)) * audio[i32(i)-2] * 0.75/i; 
       p.x = cos( p.x * 5 + dpdy(p.y + frame/bpm*offset)) * audio[i32(i)-2] *0.75/i; 
       color += abs(.0000 / p.y);
  }
  let gOffset: f32 = 0.5;
  let bOffset: f32 = 0.8;
  let nowOff: f32 = .85;
  let lastOff: f32 =.15;
  let last = lastframe( rotate( uvN( pos.xy ), seconds()/bpm*offset ) );
  let now = vec4f(round(color)*0.68, ceil(gOffset*(p.y))*0.4, ceil(bOffset*(-p.y))* 0.4, 1.);

  let out = now * nowOff + last * lastOff;
  return out;
}

