// Isometric drawing for the cover. Coordinates are expressed in grid cells.
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
function project(x, y, h = 0) {
  return [400 + (x - y) * 24, 200 + (x + y) * 11.5 - h];
}
function shape(points, fill, outline, width = 1) {
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  if (fill) { ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
  if (outline) { ctx.strokeStyle = outline; ctx.lineWidth = width; ctx.stroke(); }
}
function trace(points, color, width) {
  shape(points.map(point => project(...point)), null, color, width);
}
function block(x,y,size,bottom,height,colors) {
  const corners = [[x,y],[x+size,y],[x+size,y+size],[x,y+size]];
  const top = corners.map(([a,b]) => project(a,b,height));
  const base = corners.map(([a,b]) => project(a,b,bottom));
  shape([top[3],top[2],base[2],base[3]],colors[1],colors[3]);
  shape([top[2],top[1],base[1],base[2]],colors[2],colors[3]);
  shape(top,colors[0],colors[3]);
}
function drawMatrix() {
  const scale = Math.min(devicePixelRatio || 1, 3) * canvas.clientWidth / 800;
  canvas.width = Math.max(1, Math.round(800*scale));
  canvas.height = Math.max(1, Math.round(450*scale));
  ctx.setTransform(scale,0,0,scale,0,0);
  for (let n=-8;n<=8;n++) {
    trace([[-8,n],[8,n]],'#54463572',1);
    trace([[n,-8],[n,8]],'#54463572',1);
  }
  const amber = ['#ffba4d','#d88009','#95500b','#ffc96c'];
  const slate = ['#49463b','#292a25','#35352d','#6d624d'];
  const bronze = ['#a77b3e','#624721','#805b31','#c5914b'];
  for (let lane=0;lane<5;lane++) {
    const start = -3+lane*1.25;
    trace([[-8,start],[-6.6,start],[-5.8,start+.8],[-3.6,start+.8]],'#c07d32',1.4);
    trace([[start,4],[start,5.5],[start+.7,6.2],[start+.7,8]],'#b9863d',1.4);
    const [x,y] = project(start+.7,8);
    ctx.fillStyle='#ffb744';ctx.fillRect(x-2,y-2,4,4);
  }
  block(-4.4,-4.4,8.8,0,10,slate);
  block(-4.2,-4.2,8.4,10,15,bronze);
  block(-4.1,-4.1,8.2,15,24,slate);
  // The central array rises in terraces, with illuminated cells following the diagonal.
  for(let sum=0;sum<=14;sum++){
    for(let i=0;i<8;i++){
      const j=sum-i;
      if(j<0 || j>7) continue;
      const ridge=Math.max(0,1-Math.hypot(i-3.4,j-3.1)/4.4);
      const height=28+Math.round(ridge*6)*13+((i*7+j*3)%3)*4;
      const hot=(i===j || i===j-1) && i>0 && i<7;
      const colors=hot ? amber : ((i+2*j)%5===0?bronze:slate);
      block(i-3.93,j-3.93,.91,24,height,colors);
    }
  }
}
if (ctx) { new ResizeObserver(drawMatrix).observe(canvas.parentElement); }
