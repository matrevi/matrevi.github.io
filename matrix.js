// Light threads are rendered into one surface and sampled through vertical glass ribs.
const canvas = document.getElementById('matrix');
const surface = document.createElement('canvas');
const ink = surface.getContext('2d');
const glass = canvas.getContext('2d');
const lanes = 64;
const samples = 126;
let width, height, frame, previous = 0, phase = 0;

const logo = document.querySelector('.cover-logo');
const spotlight = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, targetStrength: 0 };
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let logoBounds, canvasBounds;
let introTime = !matchMedia('(any-hover: hover)').matches && !reducedMotion.matches ? 0 : null;

function fadeSpotlight() {
  introTime = null;
  spotlight.targetStrength = 0;
}

function followPointer(event) {
  if (event.pointerType === 'touch' || !logoBounds) return;
  introTime = null;
  const x = event.clientX - logoBounds.left;
  const y = event.clientY - logoBounds.top;
  const gapX = Math.max(-x, x - logoBounds.width, 0);
  const gapY = Math.max(-y, y - logoBounds.height, 0);
  spotlight.targetStrength = Math.max(0, 1 - Math.hypot(gapX, gapY) / 72);
  spotlight.targetX = x;
  spotlight.targetY = y;
  if (spotlight.strength === 0) {
    spotlight.x = x;
    spotlight.y = y;
  }
}

function updateSpotlight(delta) {
  if (introTime !== null) {
    introTime += delta;
    const progress = Math.min(1, introTime / 1150);
    spotlight.targetX = logoBounds.width * progress;
    spotlight.targetY = logoBounds.height / 2;
    spotlight.targetStrength = .82 * Math.sin(Math.PI * progress);
    if (progress === 1) fadeSpotlight();
  }
  if (!spotlight.strength && !spotlight.targetStrength) return;
  const follow = reducedMotion.matches ? 1 : 1 - Math.exp(-delta / 65);
  spotlight.x += (spotlight.targetX - spotlight.x) * follow;
  spotlight.y += (spotlight.targetY - spotlight.y) * follow;
  const fade = 1 - Math.exp(-delta / (spotlight.targetStrength ? 60 : 80));
  spotlight.strength += (spotlight.targetStrength - spotlight.strength) * fade;
  if (!spotlight.targetStrength && spotlight.strength < .01) spotlight.strength = 0;
  logo.style.setProperty('--light-x', spotlight.x.toFixed(1) + 'px');
  logo.style.setProperty('--light-y', spotlight.y.toFixed(1) + 'px');
  logo.style.setProperty('--light-strength', spotlight.strength.toFixed(3));
}

function drawField() {
  const tall = height > width;
  const extent = Math.min(height, width * .96);
  ink.fillStyle = '#14100e';
  ink.fillRect(0, 0, width, height);

  // Each sampled column forms a rotated cross-section of the same folded sheet.
  const columns = Array.from({length: samples + 1}, (_, i) => {
    const t = i / samples;
    const angle = t * 9.5 + .65 * Math.sin(phase * .36) - .28;
    const x = (t * 1.46 - .23) * width;
    const y = height * (.76 - .55 * t) + extent * .21 * Math.sin(t * 8.4 - .72 + .26 * Math.sin(phase * .54));
    return {
      x, y,
      dx: extent * .115 * Math.cos(angle),
      dy: extent * .28 * Math.sin(angle),
      bend: extent * .115 * Math.cos(angle + .7)
    };
  });
  function point(i, lane) {
    const c = columns[i];
    return [c.x + c.dx * lane, c.y + c.dy * lane + c.bend * (1 - lane * lane)];
  }

  const light = ink.createLinearGradient(0, height, width, 0);
  light.addColorStop(0, '#dc824a');
  light.addColorStop(.17, '#ffe1aa');
  light.addColorStop(.38, '#d4844c');
  light.addColorStop(.52, '#967050');
  light.addColorStop(.72, '#ffdda0');
  light.addColorStop(.88, '#ffc56b');
  light.addColorStop(1, '#ad613c');
  // Lay a continuous amber film beneath the finer matrix lines.
  // Sampling both edges of each band keeps the highlights attached to the fold.
  const bands = 24;
  for (let band = 0; band < bands; band++) {
    const edge = band / bands * 2 - 1;
    const highlight = (.5 + .5 * Math.cos(edge * 8.5 + phase * .18)) ** 3;
    ink.fillStyle = light;
    ink.globalAlpha = .035 + .21 * highlight;
    ink.beginPath();
    ink.moveTo(...point(0, edge));
    for (let i = 1; i <= samples; i++) ink.lineTo(...point(i, edge));
    for (let i = samples; i >= 0; i--) ink.lineTo(...point(i, edge + 2 / bands));
    ink.closePath();
    ink.fill();
  }
  ink.strokeStyle = light;
  for (let j = 0; j <= lanes; j++) {
    const lane = j / lanes * 2 - 1;
    const sheen = (.5 + .5 * Math.cos(lane * 11 - phase * .35)) ** 3;
    ink.globalAlpha = .27 + .55 * sheen;
    ink.lineWidth = (.9 + 1.4 * sheen) * Math.max(.7, width / 1450);
    ink.beginPath();
    for (let i = 0; i <= samples; i++) {
      const [x, y] = point(i, lane);
      if (i === 0) ink.moveTo(x,y);
      else ink.lineTo(x,y);
    }
    ink.stroke();
  }

  // Rows of travelling samples tighten where the sheet turns edge-on.
  ink.globalAlpha = 1;
  const symbols = ['+', '×', '⊕'];
  ink.font = (tall ? 10 : 13) + 'px monospace';
  for (let row = 0; row < 36; row++) {
    const pos = ((row / 36 + phase * .019) % 1) * samples;
    const left = Math.floor(pos);
    const mix = pos - left;
    for (let j = 0; j <= 12; j++) {
      const lane = j / 6 - 1;
      const a = point(left, lane), b = point(left + 1, lane);
      const x = a[0] + (b[0] - a[0]) * mix, y = a[1] + (b[1] - a[1]) * mix;
      const operator = (row + j * 5) % 39 === 0;
      ink.fillStyle = operator ? '#fff0c6' : '#ffc57eb3';
      if (operator) ink.fillText(symbols[(row + j) % symbols.length], x, y);
      else ink.fillRect(x,y,tall ? 1.2 : 1.8,tall ? 1.2 : 1.8);
    }
  }

  if (spotlight.strength) {
    const x = logoBounds.left - canvasBounds.left + spotlight.x;
    const y = logoBounds.top - canvasBounds.top + spotlight.y;
    const radius = Math.min(145, logoBounds.width * .52);
    const glow = ink.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, '#ffd6a0');
    glow.addColorStop(1, 'rgba(255, 183, 90, 0)');
    ink.save();
    ink.globalCompositeOperation = 'color-dodge';
    ink.globalAlpha = .66 * spotlight.strength;
    ink.fillStyle = glow;
    ink.fillRect(x - radius, y - radius, 2 * radius, 2 * radius);
    ink.restore();
  }

  const pitch = tall ? 9 : 15;
  const scale = surface.width / width;
  for (let x = 0; x < width; x += pitch) {
    // Different magnification on the two faces produces a refracted seam.
    const sample = Math.min(x + 2, width - 1);
    glass.drawImage(surface, sample * scale, 0, pitch * .48 * scale, surface.height, x, 0, pitch * .72, height);
    glass.drawImage(surface, Math.min(x + pitch * .50,width-1) * scale, 0, pitch * .50 * scale, surface.height, x + pitch * .72, 0, pitch * .28 + .4, height);
    glass.fillStyle = 'rgba(255,219,174,.045)';
    glass.fillRect(x,0,1,height);
  }
}

function tick(now) {
  if (now - previous >= 33) {
    const delta = previous ? Math.min(now - previous, 80) : 0;
    phase += delta / 1000;
    updateSpotlight(delta);
    previous = now;
    drawField();
  }
  frame = requestAnimationFrame(tick);
}
function updatePlayback() {
  cancelAnimationFrame(frame);
  previous = 0;
  if (!document.hidden) frame = requestAnimationFrame(tick);
}
function resize() {
  logoBounds = logo.getBoundingClientRect();
  canvasBounds = canvas.getBoundingClientRect();
  width = canvas.clientWidth; height = canvas.clientHeight;
  if (!width || !height) return;
  const density = Math.min(devicePixelRatio, 1.5, 1800 / width);
  surface.width = canvas.width = Math.round(width * density);
  surface.height = canvas.height = Math.round(height * density);
  for (const context of [ink, glass]) context.setTransform(canvas.width/width, 0, 0, canvas.height/height, 0, 0);
  drawField();
}
if (ink && glass) {
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  observer.observe(logo);
  canvas.parentElement.addEventListener('pointermove', followPointer, { passive: true });
  canvas.parentElement.addEventListener('pointerleave', fadeSpotlight);
  window.addEventListener('blur', fadeSpotlight);
  window.addEventListener('scroll', () => {
    logoBounds = logo.getBoundingClientRect();
    canvasBounds = canvas.getBoundingClientRect();
    fadeSpotlight();
  }, { passive: true });
  document.addEventListener('visibilitychange', updatePlayback);
  updatePlayback();
}
