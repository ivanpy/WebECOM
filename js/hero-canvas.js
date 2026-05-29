/**
 * hero-canvas.js
 * Red de nodos animada + ventanas de código flotantes con efecto typing.
 * Lenguajes: Python · Symfony/PHP · React/JSX
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════
     CONFIGURACIÓN
  ══════════════════════════════════════════════════ */
  const CFG = {
    /* red de nodos */
    nodes:       68,
    connectDist: 155,
    speed:       0.26,
    lineAlpha:   0.12,
    nodeAlpha:   0.70,
    packets:     10,
    nodeColors:  ['#00d4ff','#3b82f6','#06b6d4','#818cf8','#22d3ee'],

    /* bloques de código */
    maxBlocks:    0,
    typingDelay:  36,    // ms por carácter
    readDelay:    2600,  // ms mostrando el bloque completo
    fadeStep:     0.014, // velocidad de desvanecimiento
    blockFont:    '11.5px "Courier New", monospace',
    headerFont:   '10px "Courier New", monospace',
    lineH:        16,
    padX:         11,
    padY:         8,
    headerH:      22,
    minSpawnDelay:450,
    maxSpawnDelay:950,
  };

  /* ══════════════════════════════════════════════════
     PALETA DE SINTAXIS
  ══════════════════════════════════════════════════ */
  const S = {
    kw:      'rgba(82,183,255,0.93)',   // keywords — azul cyan
    str:     'rgba(95,215,135,0.90)',   // strings  — verde
    cmt:     'rgba(105,130,158,0.80)',  // comments — gris azul
    jsx:     'rgba(255,168,75,0.90)',   // JSX tags — ámbar
    fn:      'rgba(210,155,255,0.88)',  // funciones — lila
    base:    'rgba(182,208,245,0.85)',  // texto base — blanco frío
    num:     'rgba(255,200,95,0.88)',   // números  — oro
    punct:   'rgba(165,185,215,0.80)',  // puntuación
  };

  /* ══════════════════════════════════════════════════
     SNIPPETS DE CÓDIGO
     Cada línea → { text: string, color: cssColor }
  ══════════════════════════════════════════════════ */
  function L(text, color) { return { text, color }; }

  const SNIPPETS = [

    /* ── Python · async fetch ─────────────────────── */
    { lang: 'Python', lines: [
      L('import asyncio',             S.kw),
      L('import aiohttp',             S.kw),
      L('',                           S.base),
      L('async def fetch(url):',      S.kw),
      L('  async with aiohttp',       S.kw),
      L('  .ClientSession() as s:',   S.base),
      L('    r = await s.get(url)',   S.base),
      L('    return await r.json()',  S.kw),
    ]},

    /* ── Python · NetworkNode ─────────────────────── */
    { lang: 'Python', lines: [
      L('class NetworkNode:',          S.kw),
      L('  def __init__(self, ip):',   S.fn),
      L('    self.ip   = ip',          S.base),
      L('    self.peers = []',         S.base),
      L('',                            S.base),
      L('  def ping(self):',           S.fn),
      L('    cmd = f"ping {self.ip}"', S.str),
      L('    return os.system(cmd)',   S.kw),
    ]},

    /* ── Python · subnet scan ─────────────────────── */
    { lang: 'Python', lines: [
      L('# Análisis de red',          S.cmt),
      L('def scan_subnet(cidr):',     S.fn),
      L('  net = IPv4Network(cidr)',  S.base),
      L('  active = []',              S.base),
      L('  for host in net.hosts():', S.kw),
      L('    if ping(str(host)):',    S.kw),
      L('      active.append(host)',  S.base),
      L('  return active',            S.kw),
    ]},

    /* ── Symfony · Controller ─────────────────────── */
    { lang: 'Symfony', lines: [
      L('#[Route("/api/nodes",',       S.cmt),
      L(' methods: ["GET"])]',         S.cmt),
      L('public function getNodes()',  S.fn),
      L(': JsonResponse {',            S.base),
      L('  $nodes = $this->repo',      S.base),
      L('    ->findActiveNodes();',    S.base),
      L('  return $this->json(',       S.kw),
      L('    $nodes);',                S.base),
      L('}',                           S.base),
    ]},

    /* ── Symfony · HttpClient ─────────────────────── */
    { lang: 'Symfony', lines: [
      L('// Consumir API externa',     S.cmt),
      L('$client = HttpClient',        S.base),
      L('  ::create([',                S.base),
      L("   'timeout' => 10",         S.num),
      L('  ]);',                       S.base),
      L('$resp = $client->request(',   S.fn),
      L("  'GET',",                    S.str),
      L("  'https://api.ecom.ar/v1'", S.str),
      L(');',                          S.base),
      L('$data = $resp->toArray();',   S.base),
    ]},

    /* ── Symfony · AuthService ────────────────────── */
    { lang: 'Symfony', lines: [
      L('class AuthService {',         S.kw),
      L('  public function validate(', S.fn),
      L('    string $token',           S.base),
      L('  ): bool {',                 S.base),
      L('    return JWT::verify(',     S.base),
      L('      $token,',               S.base),
      L('      $this->secret',         S.base),
      L('    );',                      S.base),
      L('  }',                         S.base),
      L('}',                           S.base),
    ]},

    /* ── React · NodeCard ─────────────────────────── */
    { lang: 'React', lines: [
      L('const NodeCard = ({ node }) => {', S.kw),
      L('  const [up, setUp] =',           S.kw),
      L('    useState(true);',              S.fn),
      L('  return (',                       S.base),
      L('    <div className="node-card">', S.jsx),
      L('      <span>{node.ip}</span>',    S.jsx),
      L('      <Badge active={up} />',     S.jsx),
      L('    </div>',                      S.jsx),
      L('  );',                            S.base),
      L('};',                              S.base),
    ]},

    /* ── React · useEffect fetch ──────────────────── */
    { lang: 'React', lines: [
      L('useEffect(() => {',          S.fn),
      L("  fetch('/api/network')",    S.str),
      L('    .then(r => r.json())',   S.base),
      L('    .then(data => {',        S.base),
      L('      setNodes(data.nodes);',S.base),
      L('      setStats(data.stats);',S.base),
      L('    });',                    S.base),
      L('}, []);',                    S.base),
    ]},

    /* ── React · Dashboard ────────────────────────── */
    { lang: 'React', lines: [
      L('export default function',       S.kw),
      L('  Dashboard() {',              S.fn),
      L('  return (',                   S.base),
      L('    <NetworkMap',              S.jsx),
      L('      nodes={nodes}',          S.jsx),
      L('      onSelect={handleSelect}',S.jsx),
      L('      theme="dark"',           S.jsx),
      L('    />',                       S.jsx),
      L('  );',                         S.base),
      L('}',                            S.base),
    ]},

    /* ── React · WebSocket hook ───────────────────── */
    { lang: 'React', lines: [
      L('function useSocket(url) {',     S.fn),
      L('  const ws = useRef(null);',    S.kw),
      L('  useEffect(() => {',           S.fn),
      L('    ws.current =',              S.base),
      L('      new WebSocket(url);',     S.base),
      L('    ws.current.onmessage =',    S.base),
      L('      (e) => onData(e.data);',  S.base),
      L('    return () =>',              S.kw),
      L('      ws.current.close();',     S.base),
      L('  }, [url]);',                  S.base),
      L('}',                             S.base),
    ]},

    /* ── Python · ML pipeline ─────────────────────── */
    { lang: 'Python', lines: [
      L('# Pipeline de ML',              S.cmt),
      L('from sklearn.pipeline import', S.kw),
      L('  Pipeline',                    S.base),
      L('',                              S.base),
      L('pipe = Pipeline([',             S.base),
      L("  ('scaler', StandardScaler()),",S.str),
      L("  ('clf', RandomForest(",       S.str),
      L('     n_estimators=100))',       S.num),
      L('])',                            S.base),
      L('pipe.fit(X_train, y_train)',    S.fn),
    ]},

  ];

  /* ══════════════════════════════════════════════════
     ESTADO GLOBAL
  ══════════════════════════════════════════════════ */
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  let nodes      = [];
  let packets    = [];
  let codeBlocks = [];
  let raf, lastTs;

  const rand   = (a, b) => a + Math.random() * (b - a);
  const pick   = (arr)  => arr[Math.floor(Math.random() * arr.length)];
  const dist2  = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  const clamp  = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ══════════════════════════════════════════════════
     NODOS
  ══════════════════════════════════════════════════ */
  function mkNode() {
    return {
      x: rand(0, W), y: rand(0, H),
      vx: rand(-CFG.speed, CFG.speed),
      vy: rand(-CFG.speed, CFG.speed),
      r:  rand(1.4, 3.0),
      color:  pick(CFG.nodeColors),
      phase:  rand(0, Math.PI * 2),
      pSpeed: rand(0.015, 0.032),
    };
  }

  /* ══════════════════════════════════════════════════
     PAQUETES DE DATOS
  ══════════════════════════════════════════════════ */
  function mkPacket() {
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    const b = nodes[Math.floor(Math.random() * nodes.length)];
    if (a === b) return null;
    return { a, b, t: 0, speed: rand(0.003, 0.007), color: pick(CFG.nodeColors) };
  }

  /* ══════════════════════════════════════════════════
     BLOQUES DE CÓDIGO — CREACIÓN
  ══════════════════════════════════════════════════ */
  function mkCodeBlock() {
    const snippet = pick(SNIPPETS);

    // Medir el bloque antes de posicionarlo
    ctx.font = CFG.blockFont;
    const maxLineW = Math.max(...snippet.lines.map(l => ctx.measureText(l.text).width));
    const blockW   = maxLineW + CFG.padX * 2;
    const blockH   = snippet.lines.length * CFG.lineH + CFG.padY * 2 + CFG.headerH;

    const margin = 24;
    const x = clamp(rand(margin, W - blockW - margin), margin, W - blockW - margin);
    const y = clamp(rand(margin, H - blockH - margin), margin, H - blockH - margin);

    return {
      snippet, x, y, blockW, blockH,
      state:       'typing',   // typing | reading | fading
      alpha:       0,
      fadingIn:    true,
      lineIdx:     0,           // índice de línea actual
      charIdx:     0,           // char dentro de la línea actual
      typingAcc:   0,           // acumulador ms para typing
      readAcc:     0,           // acumulador ms para reading
      cursorAcc:   0,           // acumulador ms para parpadeo cursor
      cursorOn:    true,
    };
  }

  /* ══════════════════════════════════════════════════
     BLOQUES DE CÓDIGO — ACTUALIZACIÓN
  ══════════════════════════════════════════════════ */
  function updateBlock(b, dt) {
    /* fade in */
    if (b.fadingIn) {
      b.alpha = Math.min(1, b.alpha + 0.02);
      if (b.alpha >= 1) b.fadingIn = false;
    }

    /* cursor blink */
    b.cursorAcc += dt;
    if (b.cursorAcc >= 520) { b.cursorOn = !b.cursorOn; b.cursorAcc = 0; }

    const lines = b.snippet.lines;

    if (b.state === 'typing') {
      b.typingAcc += dt;
      while (b.typingAcc >= CFG.typingDelay) {
        b.typingAcc -= CFG.typingDelay;

        /* saltar líneas vacías inmediatamente */
        while (b.lineIdx < lines.length && lines[b.lineIdx].text === '') {
          b.lineIdx++;
        }

        if (b.lineIdx >= lines.length) {
          b.state = 'reading';
          break;
        }

        b.charIdx++;
        if (b.charIdx >= lines[b.lineIdx].text.length) {
          b.lineIdx++;
          b.charIdx = 0;
          /* saltar posibles vacías al avanzar de línea */
          while (b.lineIdx < lines.length && lines[b.lineIdx].text === '') {
            b.lineIdx++;
          }
        }

        if (b.lineIdx >= lines.length) {
          b.state = 'reading';
          break;
        }
      }

    } else if (b.state === 'reading') {
      b.readAcc += dt;
      if (b.readAcc >= CFG.readDelay) b.state = 'fading';

    } else if (b.state === 'fading') {
      b.alpha = Math.max(0, b.alpha - CFG.fadeStep);
    }
  }

  /* ══════════════════════════════════════════════════
     BLOQUES DE CÓDIGO — DIBUJADO
  ══════════════════════════════════════════════════ */
  function drawBlock(b) {
    if (b.alpha <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = b.alpha;

    const { x, y, blockW, blockH } = b;
    const { padX: px, padY: py, lineH: lh, headerH: hh } = CFG;
    const lines = b.snippet.lines;

    /* fondo del bloque */
    ctx.fillStyle = 'rgba(3,8,22,0.75)';
    rrect(x, y, blockW, blockH, 7);
    ctx.fill();

    /* borde exterior */
    ctx.strokeStyle = 'rgba(0,175,255,0.22)';
    ctx.lineWidth   = 0.9;
    rrect(x, y, blockW, blockH, 7);
    ctx.stroke();

    /* barra de título */
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    rrectTop(x, y, blockW, hh, 7);
    ctx.fill();

    /* línea separadora bajo el header */
    ctx.strokeStyle = 'rgba(0,160,240,0.14)';
    ctx.lineWidth   = 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y + hh);
    ctx.lineTo(x + blockW, y + hh);
    ctx.stroke();

    /* dots de ventana */
    const dotY = y + hh / 2;
    [
      'rgba(255,90,82,0.82)',
      'rgba(255,185,60,0.82)',
      'rgba(38,195,58,0.82)',
    ].forEach((dc, i) => {
      ctx.beginPath();
      ctx.arc(x + px + i * 13, dotY, 4, 0, Math.PI * 2);
      ctx.fillStyle = dc;
      ctx.fill();
    });

    /* etiqueta de lenguaje */
    ctx.font      = CFG.headerFont;
    ctx.fillStyle = 'rgba(140,175,215,0.72)';
    ctx.textAlign = 'right';
    ctx.fillText(b.snippet.lang, x + blockW - px, dotY + 3.5);
    ctx.textAlign = 'left';

    /* ── Líneas de código ── */
    ctx.font = CFG.blockFont;

    const totalTyped = (b.state === 'reading' || b.state === 'fading')
      ? lines.length
      : b.lineIdx;

    for (let i = 0; i <= totalTyped && i < lines.length; i++) {
      const lineY = y + hh + py + (i + 1) * lh - 3;
      const lineX = x + px;
      const line  = lines[i];

      let text;
      if (i < totalTyped) {
        text = line.text;
      } else if (i === totalTyped && b.state === 'typing') {
        text = line.text.slice(0, b.charIdx);
      } else {
        continue;
      }

      if (text) {
        ctx.fillStyle = line.color;
        ctx.fillText(text, lineX, lineY);
      }

      /* cursor */
      const isCursorLine =
        (b.state === 'typing'  && i === totalTyped) ||
        (b.state === 'reading' && i === lines.length - 1);

      if (isCursorLine && b.cursorOn) {
        const cx = lineX + ctx.measureText(text || '').width + 1;
        ctx.fillStyle = 'rgba(0,225,255,0.92)';
        ctx.fillRect(cx, lineY - lh + 5, 1.8, lh - 4);
      }
    }

    ctx.restore();
  }

  /* ── Helpers para rectángulos redondeados ── */
  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);        ctx.arcTo(x + w, y,     x + w, y + r,     r);
    ctx.lineTo(x + w, y + h - r);    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);        ctx.arcTo(x,     y + h, x,     y + h - r, r);
    ctx.lineTo(x, y + r);            ctx.arcTo(x,     y,     x + r, y,         r);
    ctx.closePath();
  }

  function rrectTop(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);        ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x,     y + h);
    ctx.lineTo(x,     y + r);        ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  /* ══════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════ */
  function resize() {
    const wrap = canvas.parentElement;
    W = canvas.width  = wrap.offsetWidth  || window.innerWidth;
    H = canvas.height = wrap.offsetHeight || window.innerHeight;
  }

  function init() {
    resize();
    nodes      = Array.from({ length: CFG.nodes }, mkNode);
    packets    = [];
    codeBlocks = [];

    for (let i = 0; i < CFG.packets; i++) {
      const p = mkPacket(); if (p) packets.push(p);
    }

    /* Bloques iniciales escalonados para que no aparezcan todos a la vez */
    for (let i = 0; i < CFG.maxBlocks; i++) {
      setTimeout(() => {
        if (codeBlocks.length < CFG.maxBlocks) {
          codeBlocks.push(mkCodeBlock());
        }
      }, i * 2200);
    }
  }

  /* ══════════════════════════════════════════════════
     LOOP PRINCIPAL
  ══════════════════════════════════════════════════ */
  function frame(ts) {
    const dt = lastTs ? Math.min(ts - lastTs, 50) : 16;
    lastTs   = ts;

    ctx.clearRect(0, 0, W, H);

    /* ── Conexiones ── */
    const thr2 = CFG.connectDist ** 2;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b  = nodes[j];
        const d2 = dist2(a, b);
        if (d2 > thr2) continue;
        const t  = 1 - Math.sqrt(d2) / CFG.connectDist;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(0,175,255,${CFG.lineAlpha * t})`;
        ctx.lineWidth   = 0.55 * t + 0.15;
        ctx.stroke();
      }
    }

    /* ── Nodos ── */
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy; n.phase += n.pSpeed;
      if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
      if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;

      const pulse = 0.7 + 0.3 * Math.sin(n.phase);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle   = n.color;
      ctx.globalAlpha = CFG.nodeAlpha * pulse;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    /* ── Paquetes de datos ── */
    for (let i = packets.length - 1; i >= 0; i--) {
      const p  = packets[i];
      p.t     += p.speed;
      if (p.t >= 1) {
        packets.splice(i, 1);
        const np = mkPacket(); if (np) packets.push(np);
        continue;
      }
      const px = p.a.x + (p.b.x - p.a.x) * p.t;
      const py = p.a.y + (p.b.y - p.a.y) * p.t;

      const tr = ctx.createRadialGradient(px, py, 0, px, py, 6);
      tr.addColorStop(0, p.color); tr.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = tr; ctx.globalAlpha = 0.32; ctx.fill();

      ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.82; ctx.fill();
      ctx.globalAlpha = 1;
    }

    /* ── Bloques de código ── */
    for (let i = codeBlocks.length - 1; i >= 0; i--) {
      const b = codeBlocks[i];
      updateBlock(b, dt);
      drawBlock(b);

      if (b.state === 'fading' && b.alpha <= 0) {
        codeBlocks.splice(i, 1);
        /* respawn con pequeño delay aleatorio */
        const delay = rand(CFG.minSpawnDelay, CFG.maxSpawnDelay);
        setTimeout(() => {
          if (codeBlocks.length < CFG.maxBlocks) codeBlocks.push(mkCodeBlock());
        }, delay);
      }
    }

    raf = requestAnimationFrame(frame);
  }

  /* ══════════════════════════════════════════════════
     CICLO DE VIDA
  ══════════════════════════════════════════════════ */
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) return; // respeta preferencia de accesibilidad

  function start() {
    lastTs = undefined;
    init();
    raf = requestAnimationFrame(frame);
  }

  function stop() { cancelAnimationFrame(raf); raf = null; }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else { lastTs = undefined; raf = requestAnimationFrame(frame); }
  });

  let rTimer;
  window.addEventListener('resize', () => {
    clearTimeout(rTimer);
    rTimer = setTimeout(() => { stop(); start(); }, 160);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

})();
