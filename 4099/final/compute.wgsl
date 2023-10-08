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

@group(0) @binding(10) var<storage, read_write> statein: array<f32>;
@group(0) @binding(11) var<storage, read_write> stateout: array<f32>;

fn index( x:i32, y:i32, a:bool ) -> u32 {
  let _res = vec2i(res);
  if (!a){
    return u32( abs(y % _res.y) * _res.x + abs(x % _res.x ) ) + u32(_res.x*_res.y);
  }
  return u32( abs(y % _res.y) * _res.x + abs(x % _res.x ) );
}

fn laplace(x:i32, y:i32, a:bool) -> f32 {
  var sum = 0.0;
  sum += statein[ index(x, y, a) ] * -1.0;

  sum += statein[ index(x - 1, y, a) ] * 0.2;
  sum += statein[ index(x + 1, y, a) ] * 0.2;
  sum += statein[ index(x, y - 1, a) ] * 0.2;
  sum += statein[ index(x, y + 1, a) ] * 0.2;

  sum += statein[ index(x - 1, y - 1, a) ] * 0.05;
  sum += statein[ index(x + 1, y - 1, a) ] * 0.05;
  sum += statein[ index(x - 1, y + 1, a) ] * 0.05;
  sum += statein[ index(x + 1, y + 1, a) ] * 0.05;
  
  return sum;
}

fn laplaceB(x:i32, y:i32) -> f32 {
  return 1.0;
}

@compute
@workgroup_size(8,8)
fn cs( @builtin(global_invocation_id) _cell:vec3u ) {
  //return;
  let cell = vec3i(_cell); 
  
  let iA = index(cell.x, cell.y, true);
  let iB = index(cell.x, cell.y, false);
  
  let a = statein[iA];
  let b = statein[iB];
  let tempFeed: f32 = feed - (abs(feed-minfeed))*(f32(cell.x)/res.x);
  let tempKill: f32 = kill - (abs(kill-minkill))*(f32(cell.y)/res.y);
  var newa = a + (da*laplace(cell.x, cell.y, true)) - (a*b*b) + (tempFeed*(1-a));
  var newb = b + (db*laplace(cell.x, cell.y, false)) + (a*b*b) - ((tempKill + tempFeed)*b);
  if (newa < 0.0){
    newa = 0.0;
  }
  if (newb < 0.0){
    newb = 0.0;
  }
  if (newa > 1.0){
    newa = 1.0;
  }
  if (newb > 1.0){
    newb = 1.0;
  }
  stateout[iA] = newa;
  stateout[iB] = newb;

  if (mousex != 0. && mousey != 0.){
    let mX = i32(mousex);
    let mY = i32(mousey);
    let brush = i32(brushsize);
    // let iA1 = index(mousex, mousey, true);
    // let iB1 = index(mousex, mousey, false);
    // let iA1 = index(500, 500, true);
    // let iB2 = index(500, 500, false);
    let imin = mX - brush;
    let imax = mX + brush;
    let jmin = mY - brush;
    let jmax = mY + brush;

    for (var i = imin; i < imax; i++){
      for (var j = jmin; j < jmax; j++){
        let iA1 = index(i, j, true);
        let iB1 = index(i, j, false);

        stateout[iA1] = 0.05;
        stateout[iB1] = 1.0;
      }
    }
  }
}
