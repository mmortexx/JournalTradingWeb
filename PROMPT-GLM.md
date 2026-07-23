# PROMPT DE TRASPASO — pégalo entero a GLM (o a cualquier agente de código)

Trabajas sobre el repo **JournalTradingWeb** (github.com/mmortexx/JournalTradingWeb),
la web de marketing de "Trading Journal" (diario de trading nativo de Windows).
Tu misión: **seguir mejorando TODO al máximo nivel de detalle y perfección SIN
romper el diseño existente**, que está aprobado pieza a pieza por el dueño tras
muchas iteraciones. Lee este documento entero antes de tocar nada.

---

## 1. Stack y flujo de trabajo

- **Next.js 16 (App Router) + Tailwind v4 + shadcn**, gestor **bun** (`bun install`, `bun run build`).
- **Export estático** a GitHub Pages: `next build` → `./out/`, 12 rutas.
  `next.config.ts` aplica `basePath /JournalTradingWeb` + `output: "export"` SOLO
  en producción; el dev sirve en `http://localhost:3000` sin basePath. **No toques
  next.config.ts.**
- **Deploy automático**: cada push a `main` dispara `.github/workflows/deploy.yml`.
  Push = publicar. Verifica siempre el workflow en verde y la web pública
  (https://mmortexx.github.io/JournalTradingWeb/) tras cada push.
- Dev server: `bun x next dev -p 3000` (el script `dev` de package.json usa `tee`,
  que falla en cmd de Windows — usa el comando directo).
- Typecheck: `./node_modules/.bin/tsc --noEmit` — **ignora los 2 errores de
  `examples/websocket/`** (deps ausentes, ajenos a la app; todo lo demás debe
  estar limpio). Lint: `./node_modules/.bin/eslint <archivos>`.

## 2. El diseño actual — qué es cada cosa y por qué (NO deshacer)

- **"El Ojo del Mercado"** (`src/components/tj/BackgroundFX.tsx`): fondo global
  fijo de TODA la web. Un ojo en WebGL (shader en un template literal `FRAG`):
  iris de fibras rojo (centro) → ámbar → verde (fuera) = lenguaje P&L de la
  marca. Anatomía ya construida: silueta ALMENDRADA por párpados entreabiertos
  (el iris es circular, como en la vida), collarette (anillo de contracción),
  catch-light doble en la pupila (dirección fija, tipo luz de estudio), borde de
  pupila irregular, sombra del párpado superior, halo exterior emplumado (JAMÁS
  aros geométricos con rayas), bokeh cercano + polvo atmosférico en pantalla.
- **Comportamiento del ojo** (decisiones firmes del dueño):
  - **NO ROTA** (se probó y se descartó: antinatural).
  - **NO se desplaza con el scroll** (se probó y se descartó: parallax barato).
    Está anclado (uEyeY fijo 0.46) y solo MUEVE LA MIRADA.
  - Scroll = **sacadas y fijaciones** (sacada balística 160 ms → fijación →
    retorno al centro 500 ms después de parar). La pupila recibe un **pulso de
    atención** al arrancar el gesto (decae sola, τ≈0.9 s) — nunca ligada a la
    velocidad (palpitaba).
  - **Parpadeo** cada 4,5–9 s (cierre 110 ms + apertura 190 ms, doble ~1/4),
    **micro-sacadas** cada 1,4–4 s, mirada suave al cursor (pointer:fine).
  - **MISMO TONO en claro y oscuro**: ambas ramas del compuesto usan el mismo
    `richColor` (saturación 1.6). El claro es "tinta sobre papel" (compuesto
    over por presencia geométrica — pupil+irisBand+halo—, NUNCA suma aditiva
    sobre blanco: clippea a blanco, ya pasó). Petición expresa del dueño.
- **Paleta**: acento **grafito** (#B9B2A6) institucional — sin colores llamativos
  de marca; el color vívido es EXCLUSIVO del ojo (P&L rojo/verde). Tokens del
  design system en `globals.css`: `--bg/--surface/--ink/--line...` (dark+light).
- **Home corta multi-vista**: Hero → OverviewApp → Ticker → HomeDemo (app demo
  embebida) → VideoCTA → FinalCTANew. El resto vive en /features, /pricing,
  /demo, /about, /faq — NO volver a apilar todo en vertical.
- **VideoCTA** = sección narrativa "El Ojo del Mercado" (da SENTIDO al ojo:
  rojo=pérdida vigilada, verde=beneficio a la vista, 40+ métricas sin parpadear).
  El texto flota DIRECTO sobre el ojo con `.tj-legible-text` (text-shadow
  theme-aware). **Prohibido** poner paneles/tarjetas opacas encima del ojo ahí.
- **Navbar píldora** con megamenú "Producto", reloj UTC en vivo, toggle de tema
  y CTA Comprar. **SideRail** 01–07 en la home. **IntroSequence** (loader
  000→100 primera visita + reveal del hero), **SectionReveal** (WAAPI, jamás
  estilos inline pre-hidratación: causa hydration mismatch), **ScrollProgress**,
  **DecorFX** (spotlight .tj-spot).
- **Precios canónicos: Core $29 · Pro $49.** Jamás reintroducir 149/249.
- Los componentes de la familia vieja fueron BORRADOS. No los resucites.

## 3. Trampas conocidas (todas han pasado de verdad)

1. **Backticks en comentarios del shader GLSL**: el FRAG vive en un template
   literal de JS — un backtick en un comentario ROMPE el archivo. Tras editar:
   `awk '/^const FRAG = \x60/,/^\x60;$/' src/components/tj/BackgroundFX.tsx | grep -n '\x60'`
   → deben salir exactamente 2 (apertura y cierre).
2. **La consola del navegador ACUMULA errores de cargas anteriores**: verifica
   siempre en una PESTAÑA NUEVA; si no, perseguirás fantasmas (errores de
   versiones ya arregladas, contextos WebGL zombis con "shader: null").
3. **readPixels devuelve ceros** con `preserveDrawingBuffer: false`. Para medir
   colores del canvas: ponlo a `true` TEMPORALMENTE y **reviértelo** antes de
   comitear.
4. **No mutar atributos DOM de nodos React antes de que hidraten** (secciones
   `next/dynamic`): usa Web Animations API (`el.animate()`), como SectionReveal.
5. GLSL: no redeclarar variables (p. ej. `richColor` se declara UNA vez).
6. Verificación visual: capturas en AMBOS temas (el toggle está en la navbar,
   `[data-theme-toggle]`) y a ser posible mediciones de píxel, no impresiones.

## 4. Protocolo de cierre de CADA cambio

1. `awk` anti-backticks (si tocaste el shader).
2. `eslint` de los archivos tocados → 0 errores.
3. `tsc --noEmit` → limpio salvo examples/.
4. Pestaña nueva del navegador: consola sin errores, captura en dark y light.
5. `bun run build` → 12 rutas estáticas.
6. Commit descriptivo (qué + por qué + cómo se verificó) y push a main.
7. GitHub Actions en verde + comprobar la web pública.

## 5. Mejoras pendientes, por prioridad (sigue desarrollando TODO)

1. **Afinar ritmos del ojo con el dueño delante**: frecuencia de parpadeo,
   amplitud de sacadas, apertura de la almendra (0.84), exposición por tramo.
   Son constantes claras en BackgroundFX.tsx — cambios quirúrgicos.
2. **og.png**: la imagen social sigue siendo del diseño viejo — regenerarla con
   el ojo (1200×630, PNG; los SVG no renderizan en redes).
3. **Parallax 3D del mockup de OverviewApp** (del HTML de referencia original):
   rotateY≈cx·0.05, rotateX≈−cy·0.06, ease 0.08, desactivado <900px y con
   prefers-reduced-motion.
4. **Contadores animados** en las cifras (StatsBandNew, stats del VideoCTA):
   1300 ms easeOutCubic al entrar en viewport (IntersectionObserver 0.4).
5. **Spotlight `.tj-spot`** en más tarjetas de cristal (mockup de GuardianNew,
   RiskCalculator, OverviewApp).
6. **QA móvil**: navbar/megamenú en táctil, encuadre y rendimiento del ojo en
   viewports estrechos (el escalado adaptativo ya existe — verificar que actúa).
7. **Accesibilidad**: contraste AA del texto sobre el ojo en claro,
   focus-visible en megamenú/SideRail, aria del toggle de tema.
8. **Performance**: Lighthouse, peso de chunks de la home (AppDemoClient es el
   más pesado), fuentes.
9. **/features**: las secciones restantes de la etapa anterior (Gallery,
   BeforeAfter, HowItWorks, MoreFeatures, Wrapped, TechSpecs, Integrations)
   funcionan pero pueden acercarse más al idioma nuevo (eyebrows §, serif,
   velos) — SIN cambiar su contenido.
10. **Demo embebida**: revisar visualmente la pestaña Ajustes (paleta única
    grafito) y el resto de páginas del demo en ambos temas.

Regla de oro: **cambios quirúrgicos, verificación real en navegador, y ante la
duda sobre una decisión de diseño ya tomada (rotación, parallax, paneles sobre
el ojo, tonos, precios) — NO la revoques: pregunta al dueño.**
