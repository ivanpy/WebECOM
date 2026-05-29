/**
 * hero-code-windows.js
 * Ventanas flotantes de código animadas en la columna derecha del hero.
 * Symfony 6 / React / Python — typewriter carácter a carácter.
 */
(function () {
  'use strict';

  // Salir si el usuario prefiere movimiento reducido
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const stage = document.getElementById('hero-code-stage');
  if (!stage) return;

  // ── Snippets de código ────────────────────────────────────────
  const SNIPPETS = [
    {
      label: 'PHP · Symfony 6',
      color: '#ec268f',
      lines: [
        '#[Route("/api/clientes", methods: ["GET"])]',
        'public function listar(ClienteRepo $repo): JsonResponse',
        '{',
        '    $clientes = $repo->findActivos();',
        '    return $this->json($clientes, 200, [], [',
        '        "groups" => ["cliente:read"]',
        '    ]);',
        '}',
      ],
    },
    {
      label: 'PHP · Symfony 6',
      color: '#ec268f',
      lines: [
        'class ClienteType extends AbstractType',
        '{',
        '    public function buildForm(',
        '        FormBuilderInterface $b, array $opts): void',
        '    {',
        '        $b->add("razonSocial", TextType::class)',
        '          ->add("cuit",        TextType::class)',
        '          ->add("activo",      CheckboxType::class);',
        '    }',
        '}',
      ],
    },
    {
      label: 'JSX · React',
      color: '#5059bc',
      lines: [
        'const ClienteCard = ({ nombre, cuit, activo }) => {',
        '  const [open, setOpen] = useState(false);',
        '  return (',
        '    <div className="card">',
        '      <h3>{nombre}</h3>',
        '      <span className="cuit">{cuit}</span>',
        '      {activo && <Badge type="success">Activo</Badge>}',
        '    </div>',
        '  );',
        '};',
      ],
    },
    {
      label: 'JSX · React',
      color: '#5059bc',
      lines: [
        'useEffect(() => {',
        '  const load = async () => {',
        '    const res  = await fetch("/api/clientes");',
        '    const data = await res.json();',
        '    setClientes(data);',
        '  };',
        '  load();',
        '}, []);',
      ],
    },
    {
      label: 'Python',
      color: '#00d4ff',
      lines: [
        'def sincronizar_padron(session, url):',
        '    datos = requests.get(url).json()',
        '    for item in datos["registros"]:',
        '        e = session.query(Entidad)',
        '                   .filter_by(cuit=item["cuit"])',
        '                   .first()',
        '        if e:',
        '            e.nombre = item["nombre"]',
        '        else:',
        '            session.add(Entidad(**item))',
        '    session.commit()',
      ],
    },
    {
      label: 'Python',
      color: '#00d4ff',
      lines: [
        '@app.route("/reporte")',
        'def reporte():',
        '    mes = request.args.get("mes")',
        '    df  = pd.read_sql(QUERY, engine,',
        '                      params={"mes": mes})',
        '    return df.to_json(orient="records",',
        '                      force_ascii=False)',
      ],
    },
  ];

  // ── Configuración ─────────────────────────────────────────────
  const MAX_WINS      = 4;    // máximo simultáneo en desktop
  const MAX_WINS_SM   = 2;    // máximo en stage < 500px alto
  const CHAR_DELAY    = 28;   // ms por carácter
  const LINE_PAUSE    = 120;  // ms entre líneas
  const RETAIN_MS     = 2200; // ms de retención tras terminar escritura
  const FADE_OUT_MS   = 700;  // debe coincidir con transition en CSS (0.6s ≈ 600ms)
  const SPAWN_STAGGER = 1200; // ms entre arranque de cada ventana al init
  const WIN_MIN_W     = 220;
  const WIN_MAX_W     = 300;

  // ── Estado ────────────────────────────────────────────────────
  // Grilla virtual 2 columnas × 3 filas = 6 zonas
  const ZONES         = 6;
  const occupiedZones = new Set();
  let activeCount     = 0;
  let paused          = false;
  let lastSnippet     = -1;
  const pendingTimers = [];

  function later(fn, ms) {
    const id = setTimeout(fn, ms);
    pendingTimers.push(id);
    return id;
  }

  function clearAllTimers() {
    pendingTimers.forEach(clearTimeout);
    pendingTimers.length = 0;
  }

  // ── Utilidades ────────────────────────────────────────────────
  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickSnippet() {
    let idx;
    do { idx = Math.floor(Math.random() * SNIPPETS.length); }
    while (idx === lastSnippet && SNIPPETS.length > 1);
    lastSnippet = idx;
    return SNIPPETS[idx];
  }

  function freeZone() {
    const all  = Array.from({ length: ZONES }, (_, i) => i);
    const free = all.filter(z => !occupiedZones.has(z));
    if (!free.length) return null;
    return free[Math.floor(Math.random() * free.length)];
  }

  function zoneToPosition(zone, winW) {
    const stageW = stage.offsetWidth;
    const stageH = stage.offsetHeight;
    const col    = zone % 2;             // 0 = izq, 1 = der
    const row    = Math.floor(zone / 2); // 0,1,2 = arriba, medio, abajo
    const margin = 20;
    const colW   = (stageW - margin * 3) / 2;
    const rowH   = (stageH - margin * 4) / 3;

    const x = margin + col * (colW + margin) + rand(0, Math.max(0, colW - winW));
    const y = margin + row * (rowH + margin) + rand(0, Math.max(0, rowH - 60));
    return {
      x: Math.max(margin, Math.min(x, stageW - winW - margin)),
      y: Math.max(margin, Math.min(y, stageH - 80 - margin)),
    };
  }

  // ── DOM ───────────────────────────────────────────────────────
  function createWindow(snippet, zone) {
    const winW = Math.round(rand(WIN_MIN_W, WIN_MAX_W));
    const pos  = zoneToPosition(zone, winW);

    const win = document.createElement('div');
    win.className = 'code-win';
    win.style.cssText = [
      `width:${winW}px`,
      `left:${pos.x}px`,
      `top:${pos.y}px`,
      'opacity:0',
    ].join(';');

    // Barra de título
    const bar = document.createElement('div');
    bar.className = 'code-win__bar';
    bar.innerHTML =
      '<span class="code-win__dot code-win__dot--r"></span>' +
      '<span class="code-win__dot code-win__dot--y"></span>' +
      '<span class="code-win__dot code-win__dot--g"></span>';

    const lbl = document.createElement('span');
    lbl.className   = 'code-win__label';
    lbl.textContent = snippet.label;
    lbl.style.color = snippet.color;
    bar.appendChild(lbl);

    // Cuerpo
    const body = document.createElement('div');
    body.className = 'code-win__body';

    const pre  = document.createElement('pre');
    pre.className = 'code-win__pre';
    const code = document.createElement('code');
    code.className = 'code-win__code';
    pre.appendChild(code);
    body.appendChild(pre);

    win.appendChild(bar);
    win.appendChild(body);
    stage.appendChild(win);

    return { win, code };
  }

  // ── Typewriter ────────────────────────────────────────────────
  function typeLines(codeEl, lines, onDone) {
    let lineIdx = 0;
    let charIdx = 0;
    let content = '';

    // Cursor parpadeante
    const cursor = document.createElement('span');
    cursor.className = 'code-win__cursor';

    function typeTick() {
      if (paused) { later(typeTick, 80); return; }
      if (lineIdx >= lines.length) {
        // Quitar cursor y llamar onDone
        if (cursor.parentNode) cursor.remove();
        onDone();
        return;
      }

      const line = lines[lineIdx];

      if (charIdx < line.length) {
        content += line[charIdx];
        charIdx++;
        codeEl.textContent = content;
        codeEl.appendChild(cursor);
        later(typeTick, CHAR_DELAY);
      } else {
        // Fin de línea
        content += '\n';
        charIdx = 0;
        lineIdx++;
        codeEl.textContent = content;
        codeEl.appendChild(cursor);
        later(typeTick, LINE_PAUSE);
      }
    }

    typeTick();
  }

  // ── Ciclo de vida de una ventana ──────────────────────────────
  function spawnWindow() {
    if (paused) return;

    const maxW = stage.offsetHeight < 500 ? MAX_WINS_SM : MAX_WINS;
    if (activeCount >= maxW) return;

    const zone = freeZone();
    if (zone === null) return;

    const snippet = pickSnippet();
    occupiedZones.add(zone);
    activeCount++;

    const { win, code } = createWindow(snippet, zone);

    // Fade in
    later(() => { win.style.opacity = '1'; }, 30);

    // Typewriter → retención → fade out → limpieza → siguiente
    later(() => {
      typeLines(code, snippet.lines, () => {
        later(() => {
          win.style.opacity = '0';
          later(() => {
            win.remove();
            occupiedZones.delete(zone);
            activeCount--;
            // Relanzar una nueva ventana después del fade
            later(spawnWindow, 800);
          }, FADE_OUT_MS + 50);
        }, RETAIN_MS);
      });
    }, 650); // esperar el fade-in
  }

  // ── Init: arrancar ventanas con stagger ───────────────────────
  function init() {
    const maxW = stage.offsetHeight < 500 ? MAX_WINS_SM : MAX_WINS;
    for (let i = 0; i < maxW; i++) {
      later(spawnWindow, i * SPAWN_STAGGER);
    }
  }

  // ── Pausar cuando el hero sale del viewport (performance) ─────
  const heroSection = stage.closest('section.hero');
  if (heroSection) {
    const visObs = new IntersectionObserver(entries => {
      paused = !entries[0].isIntersecting;
    }, { threshold: 0.1 });
    visObs.observe(heroSection);
  }

  // ── Reiniciar en resize (por si cambia el tamaño del stage) ──
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      clearAllTimers();
      stage.innerHTML = '';
      occupiedZones.clear();
      activeCount = 0;
      paused = false;
      init();
    }, 300);
  });

  init();
})();
