const LIGHT_GRAY = 'RGB(200,200,200)';
const pieStartDeg = 0;

// canvas 2D context
var ctx;
// x origin
let xOrigin;
// y origin
let yOrigin;
// max circle radius without outer ring
let radius;
// first pie start degree
// click call back function
let clickHandler;
// labels in outer donut
let pieLabels;
// circles to classify clicking area 
const circles = [];
// pies to divide different field
const pies = [];

// init
function Init(canvas, cfg) {
  xOrigin = cfg.xOrigin;
  yOrigin = cfg.yOrigin;
  radius = cfg.radius;
  pieLabels = cfg.pieLabels;
  // crate pies data
  createPies(pies, cfg.pieColors);
  // create circles data
  createCircles(circles, radius, cfg.circleNum);
  clickHandler = cfg.clickHandler;
  ctx = canvas.getContext('2d');
}

// draw everything
function Render() {
  // move origin point
  ctx.translate(xOrigin, yOrigin);
  // draw outer donut
  drawDonut(xOrigin-5, xOrigin, LIGHT_GRAY);
  // draw outer pie
  pies.forEach(pie => {
    let point = getPoint(pie.startDeg);
    // erease pie with white color
    fillPie(pie, xOrigin - 5, point.x, point.y, pie.fillColor);
  });
  // draw inner donut
  drawDonut(radius, radius+5, LIGHT_GRAY);
  // draw filled circles
  let oldAlpha = ctx.globalAlpha;
  circles.forEach(circle => {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI, false);
    // erease first
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = 'white';
    ctx.fill();
    // draw 
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = circle.color;
    ctx.fill();
  });
  ctx.globalAlpha = oldAlpha;

  // draw pies
  drawPies();
  // draw text on outer circle
  drawText();
  // draw pie when user click  
  canvas.addEventListener('click', (e) => {
    const pos = {
      x: e.clientX,
      y: e.clientY
    };

    // get hited circle
    let hitedCircle = getHitedCircle(pos);
    // get hited pie
    let hitedPie = getHitedPie(pos);
    if(hitedCircle == undefined ||
      hitedPie == undefined) {
      return
    }
    // clear pies
    let savedAlpha = ctx.globalAlpha;
    circles.forEach(cc => {
      let ratio = cc.radius/radius;
      let x = ratio*hitedPie.x1;
      let y = ratio*hitedPie.y1;
      // erease pie with white color
      ctx.globalAlpha = 1;
      fillPie(hitedPie, cc.radius, x, y, 'white');
      // fill selected pie
      ctx.globalAlpha = 0.25;
      fillPie(hitedPie, cc.radius, x, y, cc.color);
    });
    ctx.globalAlpha = savedAlpha;

    //hitedPie.hited = !hitedPie.hited;
    let r = hitedCircle.radius;
    let ratio = r/radius;
    let x1 = ratio*hitedPie.x1;
    let y1 = ratio*hitedPie.y1;

    // fill hited pie
    fillPie(hitedPie, r, x1, y1, hitedPie.fillColor);

    // draw pies agin
    drawPies();
    // caculate scores when clicking pies 
    clickHandler(hitedPie.id, hitedCircle.id); 
  });
}

function createCircles(cc, maxR, circleNum) {
  const colors = [
    'RGB(255, 160, 122)', 
    'RGB(233, 150, 122)',
    'RGB(250, 128, 114)',
    'RGB(240, 128, 128)',
  ];
  
  const step = maxR / circleNum; 
  // draw arc from big to small
  for(let i = 0; i < circleNum; i++) {
    cc.push({x:0, y:0,
      id: circleNum - i - 1,
      radius: maxR - step*i,
      color:colors.pop()});
  }
}

// make pies's data 
function createPies(pies, pieColors) {
  let pieNum = pieColors.length;
  const PIE_STEP_DEG = 360.0/pieNum;
  let degree = pieStartDeg;

  for(let i = 0; i < pieNum; i++ ) {
    let p1 = getPoint(degree);
    let p2 = getPoint(degree + PIE_STEP_DEG);
    pies.push({"x1":p1.x, "y1":p1.y,
      "x2":p2.x, "y2":p2.y, 
      "id":i,
      "startDeg":degree,
      //"hited":false,
      "fillColor": pieColors[i],
      "endDeg":degree + PIE_STEP_DEG});
    degree += PIE_STEP_DEG; 
  }
}

function drawPies() {
  ctx.beginPath();
  ctx.strokeStyle = "white";
  pies.forEach(pie => {
    ctx.moveTo(0, 0);
    ctx.lineTo(pie.x1, pie.y1);
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, pie.startDeg*Math.PI/180.0,
      pie.endDeg*Math.PI/180.0);
    ctx.lineTo(pie.x2, pie.y2);
  });
  ctx.stroke();
}

// caculate x,y from radius and degree
function getPoint(deg) {
  return {"x":Math.cos(deg * Math.PI / 180.0)*radius,
  "y":Math.sin(deg * Math.PI / 180.0)*radius}
}

// is point in the circle
function isIntersect(point, circle) {
  return Math.sqrt((point.x-xOrigin) ** 2.0 +
    (point.y - yOrigin) ** 2.0) < circle.radius;
}

// get circle which is hited
function getHitedCircle(pos) {
  // from small to big
  for(let i = circles.length - 1; i >= 0; i--) {
    let circle = circles[i];
    if (isIntersect(pos, circle)) {
      return circle;
    }
  }
}

// is degree in the pie 
function isInPie(deg, pie) {
  return deg > pie.startDeg && deg < pie.endDeg;
}

// get the pie which is clicked
function getHitedPie(pos) {
  // get translated position
  let x = pos.x - xOrigin;
  let y = pos.y - yOrigin;
  let degree = (360.0+180.0*Math.atan2(y, x)/Math.PI)%360.0;
  // from small to big
  for(let i = pies.length - 1; i >= 0; i--) {
    let pie = pies[i];
    if (isInPie(degree, pie)) {
      return pie;
    }
  }
}

// fill the pie within the arc which start from (x,y)
function fillPie(pie, r, x, y, color) {
  // fill a pie
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(x, y);
  ctx.arc(0, 0, r, pie.startDeg*Math.PI/180.0,
    pie.endDeg*Math.PI/180.0);
  ctx.lineTo(0, 0);
  ctx.fill();
}

// draw outer labels
function drawText() {
  ctx.save();
  let strokeColor = 'white';

  ctx.font='15px sans-serif';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  // rotate first text to first pie
  ctx.rotate(Math.PI*0.38);
  pieLabels.forEach(t => {
    ctx.rotate(Math.PI*0.25);
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    // TODO dynamitic caculate 18
    drawTextAlongArc(ctx, t, 0, 0, radius + 18, Math.PI*0.13);
  });

  ctx.restore();
}

// draw arc text
function drawTextAlongArc(context, str, centerX, centerY, radius, angle) {
  let len = str.length, s;
  context.save();
  context.translate(centerX, centerY);
  context.rotate(-1 * angle / 2);
  context.rotate(-1 * (angle / len) / 2);
  for(let n = 0; n < len; n++) {
    context.rotate(angle / len);
    context.save();
    context.translate(0, -1 * radius);
    s = str[n];
    context.fillText(s, 0, 0);
    context.restore();
  }
  context.restore();
}

// draw outer donut
function drawDonut(innerR, outR, color) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, outR, 0, 2 * Math.PI, false);
  // draw 
  ctx.fillStyle = color;
  ctx.fill();
  // erease
  ctx.beginPath();
  ctx.arc(0, 0, innerR, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.restore();
}

export { Init, Render };
