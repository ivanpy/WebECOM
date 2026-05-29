/**
 * software-canvas.js
 * Animación de circuito impreso (PCB) con pulsos de datos.
 * Solo objetos geométricos, sin texto. Colores de marca.
 */
(function () {
  'use strict';

  const canvas = document.getElementById('sw-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = ['#ec268f', '#5059bc', '#00d4ff'];

  let W, H, nodes, edges, pulses, hexagons;

  function rand(min, max) { return min + Math.random() * (max - min); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function init() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;

    nodes    = [];
    edges    = [];
    pulses   = [];
    hexagons = [];

    /* ── Nodos en grilla con desplazamiento orgánico ── */
    const spacing = 88;
    const cols = Math.ceil(W / spacing) + 2;
    const rows = Math.ceil(H / spacing) + 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.28) {
          nodes.push({
            x:          c * spacing - spacing * 0.5 + rand(-spacing * 0.22, spacing * 0.22),
            y:          r * spacing - spacing * 0.5 + rand(-spacing * 0.22, spacing * 0.22),
            r:          rand(1.2, 3.2),
            phase:      rand(0, Math.PI * 2),
            phaseSpeed: rand(0.008, 0.022),
            color:      pick(COLORS),
          });
        }
      }
    }

    /* ── Tramos de circuito (solo conexiones casi horizontales/verticales) ── */
    const MAX_DIST = spacing * 1.75;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > MAX_DIST) continue;
        const isOrtho = Math.abs(dx) < 18 || Math.abs(dy) < 18;
        if (isOrtho && Math.random() > 0.42) {
          edges.push({ from: i, to: j, alpha: rand(0.04, 0.14) });
        }
      }
    }

    /* ── Hexágonos flotantes decorativos ── */
    for (let i = 0; i < 9; i++) {
      hexagons.push({
        x:       rand(0, W),
        y:       rand(0, H),
        r:       rand(18, 48),
        rot:     rand(0, Math.PI),
        rotSpd:  rand(-0.003, 0.003),
        vx:      rand(-0.18, 0.18),
        vy:      rand(-0.18, 0.18),
        alpha:   rand(0.03, 0.09),
        color:   pick(COLORS),
      });
    }
  }

  function spawnPulse() {
    if (!edges.length) return;
    const edge = pick(edges);
    const flip = Math.random() > 0.5;
    pulses.push({
      from:  flip ? edge.to   : edge.from,
      to:    flip ? edge.from : edge.to,
      t:     0,
      speed: rand(0.004, 0.009),
      color: pick(COLORS),
    });
  }

  function drawHex(x, y, r, rot, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a  = rot + (i / 6) * Math.PI * 2;
      const px = x + r * Math.cos(a);
      const py = y + r * Math.sin(a);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  let lastSpawn = 0;

  function animate(ts) {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, W, H);

    /* ── Spawn pulsos ── */
    if (ts - lastSpawn > 175) { spawnPulse(); lastSpawn = ts; }

    /* ── Tramos de circuito ── */
    for (const e of edges) {
      const a = nodes[e.from], b = nodes[e.to];
      ctx.save();
      ctx.globalAlpha = e.alpha;
      ctx.strokeStyle = '#5059bc';
      ctx.lineWidth   = 0.9;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }

    /* ── Nodos ── */
    for (const n of nodes) {
      n.phase += n.phaseSpeed;
      const pulse = 0.55 + 0.45 * Math.sin(n.phase);
      ctx.save();
      ctx.globalAlpha = 0.45 * pulse;
      ctx.fillStyle   = n.color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      /* anillo exterior */
      ctx.globalAlpha = 0.12 * pulse;
      ctx.strokeStyle = n.color;
      ctx.lineWidth   = 0.8;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 2.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    /* ── Pulsos de datos ── */
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += p.speed;
      if (p.t >= 1) { pulses.splice(i, 1); continue; }

      const a  = nodes[p.from];
      const b  = nodes[p.to];
      const px = a.x + (b.x - a.x) * p.t;
      const py = a.y + (b.y - a.y) * p.t;
      const fade = Math.sin(p.t * Math.PI);

      /* halo */
      const grad = ctx.createRadialGradient(px, py, 0, px, py, 9);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, 'transparent');
      ctx.save();
      ctx.globalAlpha = 0.28 * fade;
      ctx.fillStyle   = grad;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fill();
      /* núcleo */
      ctx.globalAlpha = 0.88 * fade;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* ── Hexágonos decorativos ── */
    for (const h of hexagons) {
      h.rot += h.rotSpd;
      h.x   += h.vx;
      h.y   += h.vy;
      if (h.x < -60)     h.x = W + 60;
      if (h.x > W + 60)  h.x = -60;
      if (h.y < -60)     h.y = H + 60;
      if (h.y > H + 60)  h.y = -60;
      drawHex(h.x, h.y, h.r, h.rot, h.color, h.alpha);
    }
  }

  requestAnimationFrame(animate);

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 120);
  });
})();
