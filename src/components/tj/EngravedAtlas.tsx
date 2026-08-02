"use client";

import { useEffect, useRef } from "react";

/**
 * EngravedAtlas — el fondo del sitio: un atlas grabado a lápiz.
 *
 * Un atlas es el libro de láminas de un tratado. Este se pasa solo: al
 * bajar por la página, el fondo va GRABANDO una lámina tras otra, trazo
 * a trazo, y cada lámina es una pantalla real de la aplicación.
 *
 *   I.   La curva de rendimiento — capital, techo histórico y drawdown.
 *   II.  El calendario de resultados — el mes día a día.
 *   III. La distribución de R — dónde cae de verdad cada operación.
 *   IV.  El cuadrante de riesgo — cuánto queda antes del límite.
 *
 * ── Por qué NO es una secuencia de fotogramas ─────────────────────────
 * El recurso habitual para un fondo que avanza con el scroll es un vídeo
 * despiezado en 200-400 imágenes que se pintan en un canvas. Funciona,
 * pero cuesta entre 8 y 40 MB, hay que esperar a que descargue antes de
 * que el efecto exista, y queda pixelado en pantallas grandes porque son
 * mapas de bits de tamaño fijo.
 *
 * Aquí no hay fotogramas: hay GEOMETRÍA. Cada lámina se calcula y se
 * dibuja en el momento, así que el fondo entero pesa 0 kB de descarga,
 * es nítido a cualquier resolución, arranca al instante y puede
 * dibujarse A MEDIAS — que es justo lo que permite el efecto de que se
 * esté grabando delante de ti. Un vídeo solo sabe reproducirse; esto
 * sabe dibujarse.
 *
 * ── La lámina, no el diagrama ─────────────────────────────────────────
 * Una primera versión dibujaba solo la figura: curva, ejes, retícula.
 * Salía limpia y salía sosa — un gráfico, no una lámina. Lo que hace que
 * una plancha del XIX se lea como pieza dibujada no es la figura
 * central, es todo lo que la rodea, y aquí está todo:
 *
 *   · MARCO de filete doble con las esquinas REBASADAS. Cuando alguien
 *     traza un rectángulo con regla, las líneas se cruzan un poco en las
 *     esquinas. Ese defecto es la firma de la mano y se dibuja a
 *     propósito; sin él, el marco delata la máquina.
 *   · COLOFÓN de cierre: dos filetes y un rombo, sin rotular nada — a
 *     la figura la nombra su pie, que vive en la página.
 *   · ROSETONES en las cuatro esquinas interiores.
 *   · DETALLE AMPLIADO: un círculo que agranda un fragmento de la figura
 *     y se une a su origen con dos líneas guía. Es EL recurso de la
 *     lámina científica, y aquí amplía justo el peor drawdown.
 *   · ANOTACIONES al margen y escala graduada con sus divisiones.
 *   · SOMBREADO de grafito: trama cruzada más el polvillo de grano que
 *     deja el lápiz al insistir.
 *
 * ── Cómo se consigue el trazo "a lápiz" ───────────────────────────────
 *  - REVELADO POR LONGITUD. Cada línea conoce su recorrido y se pinta
 *    solo hasta el punto que le toca; el buril parece ir avanzando en
 *    vez de aparecer la figura de golpe.
 *  - VARIAS PASADAS. Un trazo importante se repasa dos o tres veces, y
 *    cada pasada lleva su propio temblor y su propia altura. Una sola
 *    línea a opacidad plena sale de vector y canta.
 *  - GROSOR Y OPACIDAD VARIABLES a lo largo del recorrido.
 *  - TEMBLOR DETERMINISTA: un desvío mínimo por punto, siempre el mismo
 *    para el mismo punto. La mano nunca es perfecta; un `Math.random()`
 *    sí lo parecería, además de bailar en cada fotograma y romper la
 *    hidratación.
 *  - TRAMA en vez de relleno: un lápiz no rellena, raya. Los grises
 *    salen de rayar más o menos junto.
 *
 * ── El arranque ───────────────────────────────────────────────────────
 * En p=0 la primera lámina estaría en blanco, así que quien abre la
 * página encontraba un fondo vacío y no se enteraba de que existe. Al
 * montar, la lámina I se graba SOLA durante unos segundos hasta media
 * altura; a partir de ahí manda el scroll. Se entra viendo dibujar.
 *
 * ── Rendimiento ───────────────────────────────────────────────────────
 *  - El scroll solo APUNTA un objetivo; quien dibuja es un bucle de rAF
 *    que lo persigue con suavizado exponencial, así el trazo va fluido
 *    aunque la rueda dé saltos, y nunca se dibuja dentro del manejador
 *    de scroll.
 *  - Si el progreso no se movió lo suficiente, no se redibuja. Parado,
 *    el coste es cero.
 *  - El bucle se detiene con la pestaña oculta.
 *  - dpr limitado a 2.
 *  - Con `prefers-reduced-motion` no hay bucle ni grabado inicial: la
 *    lámina que toque se dibuja entera de una vez. Quien pide menos
 *    movimiento sigue viendo el atlas, no un hueco.
 */

/* Hash entero determinista → [-0.5, 0.5]. El temblor de la mano. */
function jitter(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x) - 0.5;
}
function rnd(seed: number): number {
  const x = Math.sin(seed * 78.233 + 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** Progreso de una fase dentro de la lámina: empieza en `from`, dura `len`. */
const phase = (t: number, from: number, len: number) => easeOut(clamp01((t - from) / len));

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

/* =====================================================================
   Utilidades de grabado
   ===================================================================== */

/**
 * Traza una polilínea revelándola progresivamente.
 * El último segmento se corta a mitad para que la punta avance de forma
 * continua y no a saltos de vértice.
 */
function engraveLine(
  ctx: Ctx,
  pts: Pt[],
  reveal: number,
  width: number,
  alpha: number,
  seed = 0
) {
  if (pts.length < 2 || reveal <= 0 || alpha <= 0) return;

  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    lens.push(d);
    total += d;
  }
  const target = total * clamp01(reveal);

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  /* ---- Segmentos AGRUPADOS, no uno a uno ------------------------------
     La versión anterior hacía `beginPath`/`stroke` por cada segmento
     para poder variar el grosor. Con 150 puntos y tres pasadas de lápiz
     eso son 450 llamadas de dibujo POR TRAZO, y la lámina tiene varios:
     el fotograma se iba a decenas de milisegundos y el scroll se
     entrecortaba.

     Aquí el grosor cambia cada GROUP segmentos en vez de cada uno, así
     que un tramo entero se traza de una sola vez. Baja de ~450 llamadas
     a ~19 sin que se note: el temblor del trazo lo dan el jitter de los
     puntos y las pasadas superpuestas, no la variación de grosor
     segmento a segmento, que a esta escala es invisible. */
  const GROUP = 8;
  let acc = 0;
  let i = 1;
  while (i < pts.length && acc < target) {
    ctx.lineWidth = width * (0.72 + rnd(i + seed) * 0.62);
    ctx.beginPath();
    ctx.moveTo(pts[i - 1][0], pts[i - 1][1]);
    let g = 0;
    while (i < pts.length && g < GROUP && acc < target) {
      const seg = lens[i - 1];
      const [px, py] = pts[i - 1];
      let [x, y] = pts[i];
      if (acc + seg > target) {
        const f = (target - acc) / seg;
        x = px + (x - px) * f;
        y = py + (y - py) * f;
        ctx.lineTo(x, y);
        acc = target;
        break;
      }
      ctx.lineTo(x, y);
      acc += seg;
      i++;
      g++;
    }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Repasa el mismo recorrido varias veces, cada pasada con su temblor y
 * su altura. Es lo que hace la mano al insistir sobre un trazo, y lo que
 * separa un lápiz de una línea de vector.
 */
function pencil(
  ctx: Ctx,
  pts: Pt[],
  reveal: number,
  width: number,
  alpha: number,
  seed = 0,
  passes = 3
) {
  const specs: [number, number, number, number][] = [
    [0, 1.1, 0.75, 0.42],
    [0, 0, 1, 1],
    [0.4, -0.6, 0.8, 0.62],
  ];
  for (let p = 0; p < Math.min(passes, specs.length); p++) {
    const [dx, dy, wk, ak] = specs[p];
    const j = 0.55 + p * 0.35;
    const moved: Pt[] = pts.map((q, i) => [
      q[0] + dx + jitter(i + seed + p * 977) * j,
      q[1] + dy + jitter(i + seed + p * 977 + 500) * j,
    ]);
    engraveLine(ctx, moved, reveal, width * wk, alpha * ak, seed + p * 31);
  }
}

/** Raya la región ya recortada con paralelas a `angle` radianes. */
function hatch(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  angle: number,
  spacing: number,
  width: number,
  alpha: number,
  reveal: number,
  seed = 0
) {
  if (reveal <= 0 || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.lineCap = "butt";
  const diag = Math.hypot(w, h);
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const n = Math.ceil(diag / spacing);
  const shown = Math.ceil(n * clamp01(reveal));
  /* ---- Tres pasadas, no una por raya ---------------------------------
     Una trama densa puede llegar a 400 rayas, y trazarlas de una en una
     para variar el grosor costaba 400 llamadas de dibujo. El grosor se
     reparte en TRES grupos y cada grupo se traza de una vez: 3 llamadas
     en lugar de 400, con la misma irregularidad a la vista, porque lo
     que se percibe en una trama no es el grosor de cada raya sino que
     no todas sean iguales. */
  const BUCKETS = 3;
  for (let b = 0; b < BUCKETS; b++) {
    ctx.lineWidth = width * (0.7 + (b / (BUCKETS - 1)) * 0.7);
    ctx.beginPath();
    for (let i = b; i < shown; i += BUCKETS) {
      const px = -diag / 2 + i * spacing;
      /* Las rayas no llegan siempre al mismo sitio: la mano levanta
         antes o después. Sin esto, los bordes salen a escuadra. */
      ctx.moveTo(px, -diag / 2 + rnd(i + seed + 7) * 6);
      ctx.lineTo(px, diag / 2 - rnd(i + seed + 13) * 6);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Polvillo de grafito: motas sueltas dentro de la región recortada.
 * Es lo que queda en el papel al insistir con el lápiz, y lo que impide
 * que una trama regular se lea como una textura generada.
 */
function graphite(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  count: number,
  alpha: number,
  reveal: number,
  seed = 0
) {
  if (reveal <= 0 || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const shown = Math.ceil(count * clamp01(reveal));
  /* Todas las motas en UN solo trazado y un solo relleno. Antes era un
     `beginPath`/`arc`/`fill` por mota — hasta 420 rellenos por lámina y
     por fotograma, el gasto más caro de todo el atlas para lo poco que
     aporta cada punto. `moveTo` antes de cada arco evita que se unan
     entre sí con una línea. */
  ctx.beginPath();
  for (let i = 0; i < shown; i++) {
    const px = x + rnd(i * 3 + seed) * w;
    const py = y + rnd(i * 3 + seed + 101) * h;
    const r = 0.28 + rnd(i + seed + 55) * 0.5;
    ctx.moveTo(px + r, py);
    ctx.arc(px, py, r, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.restore();
}

/** Rótulo grabado: versalitas espaciadas, como en una plancha. */
function label(
  ctx: Ctx,
  text: string,
  x: number,
  y: number,
  size: number,
  alpha: number,
  reveal: number,
  align: CanvasTextAlign = "left"
) {
  if (reveal <= 0.02 || alpha <= 0) return;
  const shown = Math.ceil(text.length * clamp01(reveal));
  const s = text.slice(0, shown);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `${size}px "Instrument Serif", Georgia, "Times New Roman", serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  /* Letra a letra, con su microdesvío: una cadena de golpe sale
     perfectamente alineada y en una lámina eso no pasa. */
  let cx = x;
  if (align === "center") {
    cx = x - measure(ctx, s, size) / 2;
    ctx.textAlign = "left";
  } else if (align === "right") {
    cx = x - measure(ctx, s, size);
    ctx.textAlign = "left";
  }
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    ctx.fillText(ch, cx, y + jitter(i + 300) * 0.7);
    cx += ctx.measureText(ch).width + size * 0.19;
  }
  ctx.restore();
}
function measure(ctx: Ctx, s: string, size: number) {
  let w = 0;
  for (const ch of s) w += ctx.measureText(ch).width + size * 0.19;
  return w;
}

/* =====================================================================
   Cromo de la lámina — lo que la convierte en lámina y no en diagrama
   ===================================================================== */

/** Rectángulo a mano: las esquinas REBASAN, como al usar la regla. */
function handRect(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  reveal: number,
  width: number,
  alpha: number,
  seed: number,
  over = 4
) {
  const o = over;
  const sides: Pt[][] = [
    [
      [x - o, y],
      [x + w + o, y],
    ],
    [
      [x + w, y - o],
      [x + w, y + h + o],
    ],
    [
      [x + w + o, y + h],
      [x - o, y + h],
    ],
    [
      [x, y + h + o],
      [x, y - o],
    ],
  ];
  /* Los cuatro lados se trazan en orden, no a la vez: se ve cómo se
     cierra el marco. */
  sides.forEach((s, i) => {
    const r = clamp01(reveal * 4 - i);
    /* Cada lado se comba levemente: una recta perfecta de 900 px a mano
       no existe. El punto medio se desvía menos de un píxel. */
    const mid: Pt = [
      (s[0][0] + s[1][0]) / 2 + jitter(seed + i) * 1.6,
      (s[0][1] + s[1][1]) / 2 + jitter(seed + i + 40) * 1.6,
    ];
    engraveLine(ctx, [s[0], mid, s[1]], r, width, alpha, seed + i * 17);
  });
}

/** Rosetón de esquina: cuatro radios y un arco. */
function rosette(ctx: Ctx, x: number, y: number, sx: number, sy: number, r: number, t: number) {
  const p = phase(t, 0.12, 0.3);
  if (p <= 0) return;
  const a: Pt[] = [
    [x + sx * r, y],
    [x, y],
    [x, y + sy * r],
  ];
  engraveLine(ctx, a, p, 0.9, 0.48, 71);
  const arc: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const ang = (i / 12) * (Math.PI / 2);
    arc.push([x + sx * r * 0.62 * Math.cos(ang), y + sy * r * 0.62 * Math.sin(ang)]);
  }
  engraveLine(ctx, arc, p, 0.6, 0.32, 83);
  engraveLine(
    ctx,
    [
      [x + sx * r * 0.26, y + sy * r * 0.26],
      [x + sx * r * 0.44, y + sy * r * 0.44],
    ],
    p,
    0.5,
    0.2,
    91
  );
}

/**
 * El cromo completo: marco de filete doble con las esquinas rebasadas,
 * rosetones en las cuatro esquinas, colofón de cierre y las dos reglas
 * de margen graduadas. Sin un solo rótulo: nombrar la figura es trabajo
 * del pie que vive en la página, no del fondo.
 */
function plateChrome(ctx: Ctx, w: number, h: number, t: number) {
  const m = Math.min(w, h) * 0.055;
  const x = m;
  const y = m;
  const pw = w - m * 2;
  const ph = h - m * 2;

  const fr = phase(t, 0, 0.34);
  handRect(ctx, x, y, pw, ph, fr, 1.3, 0.5, 11, 6);
  handRect(ctx, x + 7, y + 7, pw - 14, ph - 14, phase(t, 0.06, 0.3), 0.55, 0.3, 29, 3);

  const rr = Math.min(pw, ph) * 0.06;
  rosette(ctx, x + 14, y + 14, 1, 1, rr, t);
  rosette(ctx, x + pw - 14, y + 14, -1, 1, rr, t);
  rosette(ctx, x + 14, y + ph - 14, 1, -1, rr, t);
  rosette(ctx, x + pw - 14, y + ph - 14, -1, -1, rr, t);

  /* ---- El colofón -----------------------------------------------------
     Aquí iban el número de lámina en romanos y su título rotulado. Se
     retiran: el fondo NO debe rotularse.

     Dos motivos. Uno de lectura — un letrero grande detrás del texto
     compite con él, y en el cruce entre láminas llegaban a verse dos
     rótulos distintos superpuestos, que es la clase de detalle que
     delata una plantilla. Otro de reparto: quien nombra la figura es su
     PIE, que vive en la página (`PlateInterlude`) donde se puede leer de
     verdad. Que el fondo se rotulara a sí mismo era decir dos veces lo
     mismo, y una de las dos veces mal.

     En su lugar, el remate que un impresor pone al cerrar una plancha:
     dos filetes cortos con un rombo en medio. No dice nada — cierra. */
  const cy = y + ph + m * 0.42;
  const cp = phase(t, 0.5, 0.36);
  const cx = x + pw / 2;
  if (cp > 0) {
    const half = Math.min(pw * 0.17, 170);
    const gap = 22;
    engraveLine(ctx, [[cx - half, cy], [cx - gap, cy]], cp, 0.8, 0.42, 101);
    engraveLine(ctx, [[cx + gap, cy], [cx + half, cy]], cp, 0.8, 0.42, 103);
    /* El rombo del centro, dibujado a línea como todo lo demás. */
    const d = 4.5;
    engraveLine(
      ctx,
      [
        [cx, cy - d],
        [cx + d, cy],
        [cx, cy + d],
        [cx - d, cy],
        [cx, cy - d],
      ],
      cp,
      0.85,
      0.46,
      105
    );
  }

  /* ---- Las reglas de margen -------------------------------------------
     Dos escalas milimetradas verticales pegadas al marco, con su marca
     larga cada cinco divisiones.

     No son adorno: son la ÚNICA parte del atlas que el contenido no
     puede tapar nunca. La mancha de texto ocupa el centro de la pantalla,
     así que todo lo que se dibuje ahí queda debajo del velo; la franja
     de margen, en cambio, está siempre despejada. Poniendo aquí un
     elemento denso y regular, el fondo pasa de intuirse a leerse — que
     era justo lo que faltaba.

     Y es lo que lleva una lámina técnica de verdad al borde del papel:
     la escala con la que se miden las distancias de la figura. */
  const rp = phase(t, 0.2, 0.5);
  if (rp > 0.01) {
    const step = 11;
    const n = Math.floor(ph / step);
    const shown = Math.ceil(n * rp);
    ctx.save();
    ctx.globalAlpha *= 0.34;
    /* Dos trazados —marcas largas y marcas cortas— en vez de uno por
       marca. Son ~150 marcas entre los dos márgenes; de 150 llamadas de
       dibujo a 2. */
    for (const long of [false, true]) {
      ctx.lineWidth = long ? 0.9 : 0.5;
      const len = long ? 13 : 6;
      ctx.beginPath();
      for (let i = 0; i <= shown && i <= n; i++) {
        if ((i % 5 === 0) !== long) continue;
        const yy = y + i * step;
        for (const [sx, dir] of [
          [x - 12, -1],
          [x + pw + 12, 1],
        ] as [number, number][]) {
          ctx.moveTo(sx, yy + jitter(i * 7) * 0.5);
          ctx.lineTo(sx + dir * len, yy + jitter(i * 7 + 3) * 0.5);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
    /* El nervio del que cuelgan las marcas. */
    engraveLine(
      ctx,
      [
        [x - 12, y],
        [x - 12, y + ph],
      ],
      rp,
      0.7,
      0.3,
      171
    );
    engraveLine(
      ctx,
      [
        [x + pw + 12, y],
        [x + pw + 12, y + ph],
      ],
      rp,
      0.7,
      0.3,
      173
    );
  }
}

/* =====================================================================
   LÁMINA I — La curva de rendimiento
   ===================================================================== */
const SERIES = (() => {
  const N = 150;
  const vals: number[] = [];
  let v = 0.2;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const dip =
      (t > 0.17 && t < 0.24 ? -0.011 : 0) +
      (t > 0.46 && t < 0.58 ? -0.016 : 0) +
      (t > 0.82 && t < 0.87 ? -0.01 : 0);
    v = Math.max(0.05, v + 0.0062 + (rnd(i) - 0.45) * 0.014 + dip);
    vals.push(v);
  }
  const peaks: number[] = [];
  let p = -Infinity;
  for (const x of vals) {
    p = Math.max(p, x);
    peaks.push(p);
  }
  /* El punto más hundido bajo el techo: el que se amplía en el detalle. */
  let worst = 0;
  let worstDD = 0;
  for (let i = 0; i < vals.length; i++) {
    const dd = (peaks[i] - vals[i]) / peaks[i];
    if (dd > worstDD) {
      worstDD = dd;
      worst = i;
    }
  }
  return { vals, peaks, max: Math.max(...vals), worst, worstDD };
})();

function plateEquity(ctx: Ctx, w: number, h: number, t: number) {
  plateChrome(ctx, w, h, t);

  /* La figura ocupa CASI TODO el ancho, no el 73 % central.
     Antes iba de 0,14 a 0,87 del ancho: justo el tramo que la mancha de
     contenido cubre, así que la parte interesante del dibujo quedaba
     siempre debajo del texto y en los márgenes —lo único que se ve— solo
     caía retícula. Extendida a los bordes, la curva CRUZA por detrás del
     contenido y sus dos extremos quedan a la vista en los márgenes. */
  const x0 = w * 0.055;
  const x1 = w * 0.945;
  const y0 = h * 0.17;
  const y1 = h * 0.8;
  const { vals, peaks, max, worst } = SERIES;
  const n = vals.length;
  const sx = (i: number) => x0 + (i / (n - 1)) * (x1 - x0);
  const sy = (v: number) => y1 - (v / (max * 1.1)) * (y1 - y0);

  /* Retícula: dos densidades, como el papel milimetrado real. */
  const gp = phase(t, 0.04, 0.22);
  ctx.save();
  ctx.globalAlpha *= 0.115 * gp;
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  for (let i = 0; i <= 50; i++) {
    const x = x0 + ((x1 - x0) * i) / 50;
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
  }
  for (let i = 0; i <= 30; i++) {
    const y = y0 + ((y1 - y0) * i) / 30;
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
  }
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha *= 0.24 * gp;
  ctx.lineWidth = 0.55;
  ctx.beginPath();
  for (let i = 0; i <= 10; i++) {
    const x = x0 + ((x1 - x0) * i) / 10;
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
  }
  for (let i = 0; i <= 6; i++) {
    const y = y0 + ((y1 - y0) * i) / 6;
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
  }
  ctx.stroke();
  ctx.restore();

  /* Ejes con graduación larga/corta y sus cifras. */
  const ap = phase(t, 0.02, 0.2);
  pencil(
    ctx,
    [
      [x0, y0 - 12],
      [x0, y1],
      [x1 + 12, y1],
    ],
    ap,
    1.15,
    0.42,
    31,
    2
  );
  ctx.save();
  ctx.globalAlpha *= 0.4 * ap;
  for (let i = 0; i <= 40; i++) {
    const x = x0 + ((x1 - x0) * i) / 40;
    const long = i % 5 === 0;
    ctx.lineWidth = long ? 0.9 : 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y1 + (long ? 7 : 3.5));
    ctx.stroke();
  }
  for (let i = 0; i <= 24; i++) {
    const y = y0 + ((y1 - y0) * i) / 24;
    const long = i % 4 === 0;
    ctx.lineWidth = long ? 0.9 : 0.5;
    ctx.beginPath();
    ctx.moveTo(x0 - (long ? 7 : 3.5), y);
    ctx.lineTo(x0, y);
    ctx.stroke();
  }
  ctx.restore();
  for (let i = 0; i <= 6; i++) {
    const y = y1 - ((y1 - y0) * i) / 6;
    label(ctx, String(i * 20), x0 - 12, y, 10, 0.3, phase(t, 0.3, 0.3), "right");
  }

  const curveR = phase(t, 0.12, 0.56);
  const shownTo = Math.floor(curveR * (n - 1));

  /* Drawdown: trama cruzada + polvillo, recortados a la región entre el
     techo y la curva. La sombra no puede existir antes que la curva que
     la proyecta, así que va atada al mismo progreso. */
  if (shownTo > 2) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(sx(0), sy(peaks[0]));
    for (let i = 1; i <= shownTo; i++) ctx.lineTo(sx(i), sy(peaks[i]));
    for (let i = shownTo; i >= 0; i--) ctx.lineTo(sx(i), sy(vals[i]));
    ctx.closePath();
    ctx.clip();
    hatch(ctx, x0, y0, x1 - x0, y1 - y0, -Math.PI / 4, 5.5, 0.5, 0.4, 1, 5);
    hatch(ctx, x0, y0, x1 - x0, y1 - y0, Math.PI / 3.2, 9, 0.4, 0.22, 1, 45);
    graphite(ctx, x0, y0, x1 - x0, y1 - y0, 420, 0.3, 1, 9);
    ctx.restore();
  }

  /* Techo histórico: escalera discontinua, nunca una curva suave. */
  const stair: Pt[] = [[sx(0), sy(peaks[0])]];
  for (let i = 1; i < peaks.length; i++) {
    if (peaks[i] !== peaks[i - 1]) {
      stair.push([sx(i), sy(peaks[i - 1])]);
      stair.push([sx(i), sy(peaks[i])]);
    }
  }
  stair.push([sx(n - 1), sy(peaks[n - 1])]);
  ctx.save();
  ctx.setLineDash([6, 5]);
  engraveLine(ctx, stair, curveR, 0.9, 0.42, 7);
  ctx.restore();

  const pts: Pt[] = vals.map((v, i) => [sx(i), sy(v)]);
  pencil(ctx, pts, curveR, 1.25, 0.62, 3);

  /* ---- Detalle ampliado ----
     El recurso de la lámina científica: un círculo que agranda un
     fragmento y dos líneas guía que lo atan a su origen. Amplía el peor
     drawdown, que es el punto que de verdad se mira en esta curva. */
  const dp = phase(t, 0.62, 0.34);
  if (dp > 0.01) {
    const ox = sx(worst);
    const oy = sy(vals[worst]);
    const R = Math.min(w, h) * 0.115;
    const dx = Math.min(w * 0.8, ox + R * 2.1);
    const dy = Math.max(y0 + R * 0.8, oy - R * 1.7);
    /* Aumento y anchura del fragmento. Van juntos y hay que calcularlos,
       no elegirlos a ojo: el trozo ampliado tiene que caber DENTRO de la
       lente. Con ±26 puntos a ×3,4 el fragmento medía cinco veces el
       diámetro del círculo, así que todo caía fuera del recorte y la
       lente salía vacía — un círculo con dos líneas guía apuntando a
       nada. Con ±7 puntos a ×3 el fragmento mide ≈1,05 diámetros: llena
       la lente y sobra lo justo por los lados, que es lo que hace que se
       lea como una ampliación y no como un recorte. */
    const K = 3;
    const SPAN = 7;

    /* Líneas guía desde el origen hasta la circunferencia. */
    for (const s of [-1, 1] as const) {
      const a = Math.atan2(dy - oy, dx - ox) + s * 0.42;
      engraveLine(
        ctx,
        [
          [ox + Math.cos(a) * 8, oy + Math.sin(a) * 8],
          [dx - Math.cos(a) * R, dy - Math.sin(a) * R],
        ],
        dp,
        0.55,
        0.26,
        111 + s
      );
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(dx, dy, R, 0, Math.PI * 2);
    ctx.clip();
    /* El mismo tramo, a escala K alrededor del punto ampliado. */
    const zpts: Pt[] = [];
    const zstair: Pt[] = [];
    for (let i = Math.max(0, worst - SPAN); i < Math.min(n, worst + SPAN); i++) {
      zpts.push([dx + (sx(i) - ox) * K, dy + (sy(vals[i]) - oy) * K]);
      zstair.push([dx + (sx(i) - ox) * K, dy + (sy(peaks[i]) - oy) * K]);
    }
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(zstair[0][0], zstair[0][1]);
    for (const p of zstair) ctx.lineTo(p[0], p[1]);
    for (let i = zpts.length - 1; i >= 0; i--) ctx.lineTo(zpts[i][0], zpts[i][1]);
    ctx.closePath();
    ctx.clip();
    hatch(ctx, dx - R, dy - R, R * 2, R * 2, -Math.PI / 4, 4.5, 0.5, 0.42, dp, 121);
    ctx.restore();
    ctx.save();
    ctx.setLineDash([5, 4]);
    engraveLine(ctx, zstair, dp, 0.8, 0.4, 131);
    ctx.restore();
    pencil(ctx, zpts, dp, 1.35, 0.6, 141, 2);
    ctx.restore();

    /* Doble filete de la lente + rótulo del aumento. */
    const circle = (r: number): Pt[] => {
      const o: Pt[] = [];
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        o.push([dx + Math.cos(a) * r, dy + Math.sin(a) * r]);
      }
      return o;
    };
    engraveLine(ctx, circle(R), dp, 1.15, 0.4, 151);
    engraveLine(ctx, circle(R + 4), dp, 0.5, 0.22, 153);
    label(ctx, "×3", dx, dy + R + 14, 11.5, 0.44, phase(t, 0.74, 0.18), "center");
  }

  label(
    ctx,
    "TECHO HISTÓRICO",
    x1,
    sy(peaks[n - 1]) - 14,
    11,
    0.3,
    phase(t, 0.72, 0.22),
    "right"
  );
}

/* =====================================================================
   LÁMINA II — El calendario de resultados
   ===================================================================== */
function plateCalendar(ctx: Ctx, w: number, h: number, t: number) {
  plateChrome(ctx, w, h, t);

  const cols = 7;
  const rows = 5;
  const gw = Math.min(w * 0.86, h * 1.55);
  const gh = gw * 0.66;
  const x0 = (w - gw) / 2;
  const y0 = (h - gh) / 2 + h * 0.03;
  const cw = gw / cols;
  const ch = gh / rows;

  const days = ["L", "M", "X", "J", "V", "S", "D"];
  const hp = phase(t, 0.06, 0.2);
  for (let c = 0; c < cols; c++) {
    label(ctx, days[c], x0 + c * cw + cw / 2, y0 - 16, 12, 0.4, hp, "center");
  }
  engraveLine(
    ctx,
    [
      [x0, y0 - 7],
      [x0 + gw, y0 - 7],
    ],
    hp,
    0.7,
    0.3,
    201
  );

  const cells = cols * rows;
  const prog = clamp01((t - 0.14) / 0.66);
  for (let i = 0; i < cells; i++) {
    const local = clamp01(prog * cells * 1.12 - i);
    if (local <= 0) continue;
    const c = i % cols;
    const r = Math.floor(i / cols);
    const x = x0 + c * cw;
    const y = y0 + r * ch;
    const pad = 3;

    handRect(ctx, x + pad, y + pad, cw - pad * 2, ch - pad * 2, easeOut(local), 0.55, 0.24, i * 3, 2);
    label(ctx, String(i + 1), x + cw - pad - 6, y + pad + 9, 9.5, 0.3, easeOut(local), "right");

    if (c === 5 || c === 6) continue; // el mercado cierra
    const v = rnd(i * 13 + 4);
    if (v < 0.26) continue; // día sin operar
    const win = rnd(i * 7 + 2) > 0.36;
    const mag = 0.3 + rnd(i * 5 + 9) * 0.7;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x + pad + 1.5, y + pad + 1.5, cw - pad * 2 - 3, ch - pad * 2 - 3);
    ctx.clip();
    const sp = 7.5 - mag * 4.2; // más apretado = día más grande
    hatch(ctx, x, y, cw, ch, -Math.PI / 4, sp, 0.5, 0.4, easeOut(local), i);
    /* Los días en pérdida llevan la segunda pasada cruzada: en grabado,
       el negro más profundo se hace cruzando la trama. */
    if (!win) {
      hatch(ctx, x, y, cw, ch, Math.PI / 4, sp, 0.5, 0.4, easeOut(local), i + 99);
      graphite(ctx, x, y, cw, ch, 26, 0.3, easeOut(local), i + 7);
    }
    ctx.restore();
  }

  /* Barra de totales bajo la rejilla: el resultado de cada columna. */
  const bp = phase(t, 0.74, 0.24);
  const by = y0 + gh + 18;
  for (let c = 0; c < cols; c++) {
    const val = c > 4 ? 0 : 0.25 + rnd(c * 17 + 3) * 0.75;
    const bh = val * 26;
    if (bh < 1) continue;
    const bx = x0 + c * cw + cw * 0.3;
    const bwid = cw * 0.4;
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx, by, bwid, bh * bp);
    ctx.clip();
    hatch(ctx, bx, by, bwid, bh, Math.PI / 2, 3.2, 0.45, 0.36, 1, c * 11);
    ctx.restore();
    handRect(ctx, bx, by, bwid, bh * bp, bp, 0.6, 0.3, c * 23, 1.5);
  }
  engraveLine(
    ctx,
    [
      [x0, by],
      [x0 + gw, by],
    ],
    bp,
    0.8,
    0.34,
    211
  );
}

/* =====================================================================
   LÁMINA III — La distribución de R
   ===================================================================== */
const BARS = (() => {
  const n = 19;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) / 3.3;
    /* Campana asimétrica: más operaciones pequeñas en pérdida que en
       ganancia, pero las ganadoras llegan más lejos. Es la forma de una
       ventaja real, no una campana simétrica. */
    const g = Math.exp(-x * x * 0.6) * (x < 0 ? 1.08 : 0.88);
    out.push(Math.max(0.03, g + (rnd(i * 3) - 0.5) * 0.08));
  }
  return out;
})();

function plateDistribution(ctx: Ctx, w: number, h: number, t: number) {
  plateChrome(ctx, w, h, t);

  const x0 = w * 0.07;
  const x1 = w * 0.93;
  const y0 = h * 0.22;
  const y1 = h * 0.76;
  const n = BARS.length;
  const bw = (x1 - x0) / n;
  const max = Math.max(...BARS);

  const ap = phase(t, 0.02, 0.2);
  pencil(
    ctx,
    [
      [x0, y0 - 12],
      [x0, y1],
      [x1 + 10, y1],
    ],
    ap,
    1.1,
    0.42,
    31,
    2
  );

  const prog = clamp01((t - 0.14) / 0.62);
  for (let i = 0; i < n; i++) {
    const local = easeOut(clamp01(prog * n * 1.3 - i));
    if (local <= 0) continue;
    const bh = (BARS[i] / (max * 1.12)) * (y1 - y0) * local;
    const x = x0 + i * bw + bw * 0.15;
    const bwid = bw * 0.7;
    const y = y1 - bh;
    const loss = i < (n - 1) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, bwid, bh);
    ctx.clip();
    hatch(ctx, x, y, bwid, bh, Math.PI / 2, 3.2, 0.45, 0.38, 1, i * 4);
    if (loss) {
      hatch(ctx, x, y, bwid, bh, 0, 3.2, 0.45, 0.28, 1, i * 4 + 71);
      graphite(ctx, x, y, bwid, bh, 40, 0.26, 1, i + 3);
    }
    ctx.restore();

    handRect(ctx, x, y, bwid, bh, 1, 0.7, 0.44, i * 9, 1.5);
    label(ctx, `${i - (n - 1) / 2 > 0 ? "+" : ""}${(i - (n - 1) / 2) / 2}R`, x + bwid / 2, y1 + 13, 9, 0.26, phase(t, 0.66, 0.26), "center");
  }

  /* La línea del cero: la referencia que separa ganar de perder. */
  const zx = x0 + ((n - 1) / 2 + 0.5) * bw;
  ctx.save();
  ctx.setLineDash([5, 4]);
  engraveLine(
    ctx,
    [
      [zx, y0 - 10],
      [zx, y1 + 10],
    ],
    phase(t, 0.08, 0.24),
    1.1,
    0.46,
    17
  );
  ctx.restore();

  /* Curva envolvente: la forma teórica sobre el histograma real. Lo que
     un tratado dibuja encima de sus barras para decir "esto es lo que
     debería salir si la ventaja es real". */
  const env: Pt[] = [];
  for (let i = 0; i <= 120; i++) {
    const f = i / 120;
    const bi = f * (n - 1);
    const lo = Math.floor(bi);
    const hi = Math.min(n - 1, lo + 1);
    const k = bi - lo;
    const v = BARS[lo] * (1 - k) + BARS[hi] * k;
    env.push([x0 + bw * 0.5 + f * (x1 - x0 - bw), y1 - (v / (max * 1.12)) * (y1 - y0)]);
  }
  pencil(ctx, env, phase(t, 0.5, 0.4), 1.05, 0.4, 301, 2);

  label(ctx, "PÉRDIDA", zx - 16, y0 - 4, 11, 0.28, phase(t, 0.78, 0.2), "right");
  label(ctx, "GANANCIA", zx + 16, y0 - 4, 11, 0.28, phase(t, 0.82, 0.2));
}

/* =====================================================================
   LÁMINA IV — El cuadrante de riesgo
   ===================================================================== */
function plateGauge(ctx: Ctx, w: number, h: number, t: number) {
  plateChrome(ctx, w, h, t);

  const cx = w / 2;
  const cy = h * 0.68;
  const R = Math.min(w * 0.42, h * 0.46);
  const A0 = Math.PI * 1.04;
  const A1 = Math.PI * 1.96;

  const arcPts = (r: number, from = A0, to = A1): Pt[] => {
    const o: Pt[] = [];
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const a = from + (to - from) * (i / steps);
      o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return o;
  };

  const arcR = phase(t, 0.04, 0.32);
  pencil(ctx, arcPts(R), arcR, 1.3, 0.46, 41, 2);
  engraveLine(ctx, arcPts(R + 9), arcR, 0.55, 0.24, 43);
  engraveLine(ctx, arcPts(R - 26), arcR, 0.5, 0.2, 47);

  /* Graduación: marca larga cada cinco, con su cifra. */
  const tickR = phase(t, 0.16, 0.34);
  const ticks = 50;
  const shown = Math.ceil(ticks * tickR);
  ctx.save();
  ctx.globalAlpha *= 0.42;
  for (let i = 0; i <= shown && i <= ticks; i++) {
    const a = A0 + (A1 - A0) * (i / ticks);
    const long = i % 5 === 0;
    const r0 = R - (long ? 15 : 8);
    ctx.lineWidth = long ? 1.05 : 0.55;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * (R - 1), cy + Math.sin(a) * (R - 1));
    ctx.stroke();
  }
  ctx.restore();
  for (let i = 0; i <= 10; i++) {
    const a = A0 + (A1 - A0) * (i / 10);
    const r = R - 32;
    label(
      ctx,
      String(i * 10),
      cx + Math.cos(a) * r,
      cy + Math.sin(a) * r,
      9.5,
      0.3,
      phase(t, 0.3 + i * 0.012, 0.2),
      "center"
    );
  }

  /* Zona de peligro: el último tramo, rayado. El instrumento dice dónde
     está el límite ANTES de que lo cruces — que es literalmente lo que
     hace el guardián del producto. */
  const dangerR = phase(t, 0.34, 0.3);
  if (dangerR > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R - 2, A1 - (A1 - A0) * 0.24, A1);
    ctx.arc(cx, cy, R - 25, A1, A1 - (A1 - A0) * 0.24, true);
    ctx.closePath();
    ctx.clip();
    hatch(ctx, cx - R, cy - R, R * 2, R * 2, Math.PI / 4, 4.5, 0.5, 0.42, dangerR, 61);
    hatch(ctx, cx - R, cy - R, R * 2, R * 2, -Math.PI / 4, 7, 0.4, 0.24, dangerR, 63);
    graphite(ctx, cx - R, cy - R, R * 2, R * 2, 260, 0.3, dangerR, 67);
    ctx.restore();
    label(
      ctx,
      "LÍMITE",
      cx + Math.cos(A1 - (A1 - A0) * 0.12) * (R + 26),
      cy + Math.sin(A1 - (A1 - A0) * 0.12) * (R + 26),
      11,
      0.34,
      phase(t, 0.56, 0.22),
      "center"
    );
  }

  /* La aguja barre hasta su lectura y se queda ahí. */
  const needleR = phase(t, 0.4, 0.44);
  const a = A0 + (A1 - A0) * 0.62 * needleR;
  pencil(
    ctx,
    [
      [cx - Math.cos(a) * 16, cy - Math.sin(a) * 16],
      [cx + Math.cos(a) * (R - 30), cy + Math.sin(a) * (R - 30)],
    ],
    1,
    1.5,
    0.6 * needleR,
    53,
    2
  );
  const hub: Pt[] = [];
  for (let i = 0; i <= 24; i++) {
    const ang = (i / 24) * Math.PI * 2;
    hub.push([cx + Math.cos(ang) * 6, cy + Math.sin(ang) * 6]);
  }
  engraveLine(ctx, hub, needleR, 1.1, 0.5, 57);

  /* Pie del instrumento: la peana. */
  const fp = phase(t, 0.66, 0.26);
  engraveLine(
    ctx,
    [
      [cx - 34, cy + 20],
      [cx - 20, cy + 6],
      [cx + 20, cy + 6],
      [cx + 34, cy + 20],
    ],
    fp,
    0.9,
    0.32,
    59
  );
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - 34, cy + 20);
  ctx.lineTo(cx - 20, cy + 6);
  ctx.lineTo(cx + 20, cy + 6);
  ctx.lineTo(cx + 34, cy + 20);
  ctx.closePath();
  ctx.clip();
  hatch(ctx, cx - 34, cy, 68, 22, Math.PI / 4, 4, 0.4, 0.3, fp, 69);
  ctx.restore();
}

const PLATES = [plateEquity, plateCalendar, plateDistribution, plateGauge];

export function EngravedAtlas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let ink = "#1a1714";
    let raf = 0;
    let shown = -1;
    let target = 0;
    let last = 0;
    let visible = true;
    let introStart = 0;
    /* La primera lámina, en unidades de progreso global. */
    const span0 = 1 / PLATES.length;

    const readInk = () => {
      ink =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--ink")
          .trim() || "#1a1714";
    };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      shown = -1;
      measureAnchors();
    };

    /* ---- Anclaje a las pausas de lámina --------------------------------
       Las pausas (`PlateInterlude`, marcadas con `data-plate`) son las
       franjas donde el fondo se ve entero. Que una de ellas te pille en
       mitad de una transición —dos figuras a medias superpuestas— sería
       el peor momento posible, justo el que se ha reservado para
       lucirlo.

       Así que el progreso no se reparte a ciegas por el scroll: se ANCLA.
       Se mide dónde está el centro de cada pausa y se construye una
       curva de progreso que pasa obligatoriamente por esos puntos, con
       la lámina N al 97 % cuando la pausa N está centrada en pantalla.
       Entre anclas se interpola linealmente, así que el trazo sigue
       avanzando de forma continua mientras lees los capítulos.

       Se recalcula al redimensionar y cuando cambia la altura del
       documento — las secciones cargan de forma diferida y crecen, y una
       posición cacheada de más se traduce en láminas descuadradas. */
    let anchors: [number, number][] = [];

    const measureAnchors = () => {
      const nodes = [...document.querySelectorAll("[data-plate]")].sort(
        (a, b) => Number(a.getAttribute("data-plate")) - Number(b.getAttribute("data-plate"))
      );
      const span = 1 / PLATES.length;
      const list: [number, number][] = [[0, 0]];
      nodes.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        /* Scroll al que esta pausa queda centrada en la ventana. */
        const centred = r.top + scrollY + r.height / 2 - innerHeight / 2;
        list.push([Math.max(0, centred), Math.min(1, (i + 0.97) * span)]);
      });
      const max = document.documentElement.scrollHeight - innerHeight;
      if (max > 0) list.push([max, 1]);
      /* Estrictamente creciente en x: si dos anclas caen en el mismo
         punto (pausas muy juntas o layout aún sin asentar), la
         interpolación dividiría por cero. */
      anchors = list.filter((p, i) => i === 0 || p[0] > list[i - 1][0]);
    };

    /* Progreso del atlas — atado al scroll ABSOLUTO, no al relativo.
       ────────────────────────────────────────────────────────────────
       Lo natural sería `scrollY / (scrollHeight - innerHeight)`, y es lo
       que había. No funciona en este sitio: las secciones se revelan al
       entrar en pantalla y varias montan contenido diferido, así que la
       altura del documento CRECE mientras bajas. Con el denominador
       cambiando bajo los pies, el mismo píxel de scroll valía un
       progreso distinto de un instante a otro — las láminas se
       adelantaban, y al crecer la página retrocedían a la anterior. Se
       veía como un fondo que va y viene sin motivo.

       Midiendo en pantallas recorridas, el denominador es constante y el
       progreso solo puede avanzar cuando el visitante avanza. Cada
       lámina dura 0,9 pantallas: cuatro láminas en 3,6 pantallas, que es
       algo menos de lo que mide la portada, así que se ven las cuatro
       enteras. En una página más corta se verán las que quepan y la
       última se queda puesta, que es el comportamiento correcto — un
       atlas no obliga a llegar al final para tener sentido. */
    const scrollProgress = () => {
      /* Con anclas: interpolación lineal por tramos entre ellas. */
      if (anchors.length >= 2) {
        const y = scrollY;
        if (y <= anchors[0][0]) return anchors[0][1];
        for (let i = 1; i < anchors.length; i++) {
          const [x1, p1] = anchors[i];
          if (y <= x1) {
            const [x0, p0] = anchors[i - 1];
            return clamp01(p0 + ((y - x0) / (x1 - x0)) * (p1 - p0));
          }
        }
        return anchors[anchors.length - 1][1];
      }
      /* Sin pausas en la página (rutas que no son la home): reparto por
         pantallas recorridas. Es estable aunque el documento crezca,
         que es lo que rompía el reparto relativo al scrollHeight. */
      const perPlate = Math.max(320, innerHeight * 0.9);
      return clamp01(scrollY / (perPlate * PLATES.length));
    };

    const draw = (p: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;

      const n = PLATES.length;
      const span = 1 / n;
      for (let i = 0; i < n; i++) {
        const local = (p - i * span) / span;
        if (local < -0.2 || local > 1.2) continue;

        /* Cruce corto: con un solape largo, dos figuras técnicas
           conviven a media opacidad durante un buen tramo de scroll y
           eso no se lee como transición, se lee como fondo sucio. */
        const fadeIn = ease(clamp01((local + 0.2) / 0.2));
        const fadeOut = 1 - ease(clamp01((local - 1) / 0.2));
        const alpha = Math.min(fadeIn, fadeOut);
        if (alpha <= 0.004) continue;

        const lift = local > 1 ? (local - 1) * -46 : local < 0 ? -local * 30 : 0;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(0, lift);
        PLATES[i](ctx, w, h, clamp01(local));
        ctx.restore();
      }
    };

    let tick = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(now - last, 64);
      last = now;

      /* Las pausas se vuelven a medir 10 veces por segundo, SIEMPRE.
         La versión anterior solo remedía cuando cambiaba
         `scrollHeight`, y ese atajo estaba roto: las secciones usan
         `content-visibility`, así que su altura definitiva no se conoce
         hasta que entran en pantalla, pero el alto total del documento
         puede quedarse igual porque el navegador ya lo tenía estimado.
         Resultado: las anclas se quedaban con las posiciones de la
         primera medida y la lámina no coincidía con su pausa — al
         llegar a la tercera seguía dibujándose la primera.

         Medir cuatro rectángulos cada 100 ms cuesta una fracción de
         milisegundo y es la única forma de que la sincronía sea exacta
         en una página cuyas alturas cambian mientras se recorre. */
      if (++tick % 6 === 0) {
        measureAnchors();
        target = scrollProgress();
      }

      /* Grabado inicial: la lámina I se dibuja sola hasta media altura
         durante los primeros segundos. Sin esto, quien abre la página
         encuentra el fondo en blanco —el trazo solo existiría al hacer
         scroll— y no llega a enterarse de que el atlas está ahí.
         A partir de ese punto manda el scroll, y el `max` hace que
         desplazarse nunca dé marcha atrás al dibujo. */
      const introT = clamp01((now - introStart) / 3400);
      const goal = Math.max(target, easeOut(introT) * 0.5 * span0);

      const next = shown + (goal - shown) * (1 - Math.exp((-dt * 6) / 1000));
      /* Umbral de repintado. Estaba en 0,00025, que sobre un recorrido de
         cuatro láminas equivale a redibujar el atlas entero prácticamente
         en cada fotograma mientras dura la inercia del scroll — y el
         atlas es lo más caro que hay en la página.

         0,0012 es la diferencia de progreso por debajo de la cual el
         dibujo no cambia de forma perceptible (menos de medio píxel de
         avance del trazo), así que el fotograma se ahorra sin que se
         note ningún salto. */
      if (Math.abs(next - shown) < 0.0012) return;
      shown = next;
      draw(shown);
    };

    const onScroll = () => {
      target = scrollProgress();
      if (reduce) {
        shown = target;
        draw(shown);
      }
    };

    readInk();
    resize(); // mide también las anclas
    target = scrollProgress();

    if (reduce) {
      shown = Math.max(target, span0 * 0.5);
      draw(shown);
    } else {
      shown = 0;
      introStart = performance.now();
      last = introStart;
      draw(shown);
      raf = requestAnimationFrame(frame);
    }

    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", resize);

    const onVis = () => {
      visible = !document.hidden;
      last = performance.now();
    };
    document.addEventListener("visibilitychange", onVis);

    /* El tema se puede cambiar en caliente; la tinta debe seguirlo. */
    const obs = new MutationObserver(() => {
      readInk();
      draw(shown);
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-palette"],
    });

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      obs.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="tj-engraved-atlas" />;
}
