"use client";

import { useEffect, useRef, useState } from "react";

/**
 * BackgroundFX — "El Ojo del Mercado": iris de fibras de luz en WebGL.
 *
 * Reemplaza los filamentos canvas-2D por la escena B de la referencia
 * aprobada (hero "NOVA_AI"): un ojo central hecho de miles de fibras
 * radiales luminosas que ondulan alrededor de una pupila oscura, con
 * un anillo exterior de radios blancos y bokeh flotando en el fondo.
 *
 * Traducción cromática a la marca (la referencia es azul):
 *   núcleo ROJO incandescente (--pnl-neg) → ámbar → puntas VERDE
 *   esmeralda (--pnl-pos). Rojo dentro, verde fuera: pérdida en el
 *   centro del ojo, beneficio en la periferia — el lenguaje P&L del
 *   producto convertido en identidad visual.
 *
 * Implementación (WebGL 1, un solo pase, full-screen triangle):
 *  - Fibras: ruido de valor en dominio polar con costura envuelta
 *    (crossfade entre dos muestras desplazadas un periodo) → cientos
 *    de filamentos sin seam. Tres frecuencias: mechones (14/rev),
 *    fibra media (~90/rev) y fibra fina (~160/rev), avectadas
 *    radialmente y onduladas por fbm de baja frecuencia — el iris
 *    "respira" como una anémona, nunca se congela.
 *  - Pupila: disco casi negro con borde suave y ligeramente irregular
 *    (ninguna pupila real es un círculo perfecto), latido lento, brasa
 *    roja tenue en el centro y un catch-light corneal de dos manchas
 *    (dirección fija, como una fuente de luz de estudio — no sigue a
 *    la mirada) que la hace leer como húmeda/viva. Aro de raíces
 *    blanco-marfil incandescente justo en el borde (la firma de la
 *    referencia).
 *  - Anillo exterior: circunferencia fina + ~30 cerdas radiales con
 *    longitud/brillo por-radio (hash), rotando muy despacio.
 *  - Bokeh: 10 orbes suaves derivando en órbitas lentas cerca del
 *    iris, teñidos rojo/verde según su hash. Polvo de fondo: motas
 *    diminutas y tenues repartidas por TODA la pantalla (no solo cerca
 *    del ojo) para dar sensación de atmósfera, como en la referencia.
 *  - Acabado: tonemap exponencial, saturación +6 %, viñeta radial y
 *    dithering ±1/255 para eliminar banding en los degradados oscuros.
 *
 * Reactividad (todo con inercia crítica, sin saltos):
 *  - SIN ROTACIÓN: un iris real no gira sobre sí mismo — el giro
 *    continuo de una versión anterior quedó descartado por antinatural.
 *    Las fibras solo ondulan/respiran en el sitio (ruido de baja
 *    frecuencia), nunca barren en bloque.
 *  - SILUETA ALMENDRADA: los párpados quedan entreabiertos en reposo
 *    (apertura 0.84·R en el centro, estrechándose con curva cuadrática
 *    hacia los extremos) — la forma de ojo real la hacen los párpados,
 *    nunca deformando el iris, que es circular como en la vida.
 *  - PARPADEO: cada 4,5-9 s, cierre 110 ms + apertura 190 ms con
 *    easing, doble parpadeo ocasional, cerrando desde la posición de
 *    reposo almendrada — el gesto que de verdad vende "esto está
 *    vivo", más que cualquier giro.
 *  - SCROLL POR FIJACIONES: el ojo está ANCLADO (no se desliza — eso
 *    leía como parallax barato). Al detectar scroll hace UNA sacada
 *    balística (160 ms) y FIJA la mirada abajo/arriba mientras dura;
 *    al parar 500 ms, sacada de retorno al centro — el patrón
 *    sacada→fijación de un ojo leyendo. La pupila NO cambia de tamaño
 *    con el scroll (se retiró: leía como que "crecía"). La exposición
 *    baja apenas en el tramo medio (legibilidad) y recupera su máximo
 *    hacia el cierre.
 *  - PUNTERO: la PUPILA sigue al ratón — el muestreo del iris se
 *    desplaza hacia el cursor con caída radial (mucho en el centro,
 *    nada en el limbo), así la pupila negra "observa" a donde va el
 *    puntero sin oscurecer ni deformar el ojo (solo pointer:fine).
 *  - MICRO-SACADAS: cada 1,4-4 s, un flick rápido e involuntario a un
 *    punto cercano (perfil triangular, 260 ms) que se suma a la mirada
 *    de puntero/scroll — el detalle que distingue un ojo vivo de una
 *    animación en bucle.
 *  - INTRO: la pupila nace dilatada y contrae al enfocar (1.1 s) con
 *    fade de exposición, sincronizado con el IntroSequence del sitio.
 *
 * Rendimiento y robustez:
 *  - dpr ≤ 2 con ESCALADO ADAPTATIVO: si la media móvil de frame-time
 *    supera ~13 ms, la resolución interna baja en pasos de 0.85× (mín.
 *    0.55×) hasta recuperar 60 fps; sube de nuevo si hay holgura.
 *  - rAF pausado con visibilitychange; manejo de webglcontextlost/
 *    restored; cleanup completo al desmontar.
 *  - prefers-reduced-motion: un único frame estático bien compuesto.
 *  - Sin WebGL: fallback CSS (gradientes radial+cónico que aproximan
 *    pupila, iris rojo→verde y radios del anillo).
 *  - Tema claro: compuesto "tinta sobre papel" (over por presencia
 *    geométrica). MISMO TONO que el oscuro: ambas ramas parten del
 *    mismo richColor (saturación 1.6) — es una decisión de marca
 *    pedida expresamente, no un accidente.
 *
 * Capas DOM por encima del canvas: halo superior, grain fractal y
 * viñeta — la misma pila del HTML de referencia.
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  uRes;      // resolución del buffer (px)
uniform float uTime;     // segundos
uniform float uScroll;   // progreso de página 0..1 (suavizado)
uniform float uDilate;   // reservado (0): la dilatación por scroll se retiró
uniform vec2  uLook;     // mirada hacia el puntero, cada eje ~[-1,1]
uniform float uIntro;    // apertura inicial 0→1
uniform float uExposure; // exposición global (legibilidad por tramo)
uniform float uTheme;    // 0 = oscuro, 1 = claro
uniform float uEyeY;     // centro vertical del ojo (fracción, coords GL)
uniform float uBlink;    // párpados: 1 = abierto, 0 = cerrado

const float TAU = 6.28318530718;

/* ---- Paleta (espejo de los tokens CSS de la marca) ---- */
const vec3 BG_DARK    = vec3(0.043, 0.047, 0.051); /* --bg  #0b0c0d */
const vec3 BG_LIGHT   = vec3(0.953, 0.949, 0.925); /* --bg  claro #f3f2ec */
const vec3 RED_CORE   = vec3(0.937, 0.267, 0.267); /* --pnl-neg #EF4444 */
const vec3 RED_DEEP   = vec3(0.620, 0.098, 0.078); /* brasa profunda */
const vec3 EMBER      = vec3(1.000, 0.520, 0.200); /* ámbar de transición */
const vec3 GREEN_CORE = vec3(0.204, 0.827, 0.600); /* --pnl-pos #34D399 */
const vec3 GREEN_DEEP = vec3(0.031, 0.310, 0.208); /* esmeralda de fondo */
const vec3 RIM_WHITE  = vec3(1.000, 0.949, 0.878); /* marfil incandescente */
const vec3 RING_IVORY = vec3(0.914, 0.894, 0.847); /* --accent-hover familia */

/* ---- Ruido ---- */
float hash11(float n) { return fract(sin(n) * 43758.5453123); }
float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(17.3, 9.1);
    a *= 0.5;
  }
  return v;
}
/* Ruido polar sin costura: crossfade entre dos muestras desplazadas
   un periodo completo K en el eje angular. a01 ∈ [0,1). */
float anoise(float a01, float K, float rad, vec2 off) {
  float x = a01 * K;
  float n1 = vnoise(vec2(x, rad) + off);
  float n2 = vnoise(vec2(x - K, rad) + off);
  return mix(n1, n2, a01);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 res = uRes;
  float minDim = min(res.x, res.y);

  /* Radio del anillo exterior = unidad del sistema. El ojo está ANCLADO
     (no se desliza); la mirada la produce el seguimiento de más abajo. */
  float R = 0.415 * minDim;
  vec2 center = res * vec2(0.5, uEyeY);
  vec2 p0 = (frag - center) / R;
  float r0 = length(p0);

  /* ---- Seguimiento de mirada (la pupila observa al puntero) ----
     Desplazamos el MUESTREO del iris hacia uLook: mucho en el centro
     (donde vive la pupila), nada en el borde (limbo anclado) — la pupila
     negra "mira" a donde va el ratón. Es solo un desplazamiento de
     coordenadas: no oscurece ni deforma el ojo, el iris conserva su look
     plano y limpio (rojo→verde radial). uLook ya trae micro-sacadas y
     fijación de scroll sumadas. */
  float follow = smoothstep(1.15, 0.0, r0);
  vec2 gaze = uLook * 0.16;
  vec2 p = p0 - gaze * follow;
  float r = length(p);
  float ang = atan(p.y, p.x);

  /* Sin rotación del iris sobre su propio eje (un iris real no gira):
     solo mira (seguimiento de arriba) y respira (el wob de más abajo). */
  float a01 = fract(ang / TAU + 1.0);

  /* Pupila: latido + dilatación sutil por scroll + apertura inicial +
     reenfoque al parpadear (se comprime un pelo con el párpado). */
  float beat = 0.014 * sin(uTime * 0.55 + 0.6 * sin(uTime * 0.21));
  float rp = 0.26 * (1.0 + beat)
           * (1.0 + 0.55 * (1.0 - uIntro))
           * (1.0 + 0.10 * (1.0 - uBlink));

  /* Ondulación del iris: las fibras se anclan en la pupila y ondean
     más hacia las puntas. Flujo CONSTANTE — acelerarlo con el scroll
     era otro efecto pegado al input; el músculo del iris no va más
     rápido porque tú muevas la rueda. */
  float sway = smoothstep(rp, 1.0, r);
  float flowT = uTime * 0.055;
  float wob = (anoise(a01, 3.0, r * 1.8 - flowT, vec2(31.7, 7.7)) - 0.5)
            * 0.16 * sway;
  float a01w = fract(a01 + wob / TAU * 6.0 + 1.0);
  float rw = r + (anoise(a01, 5.0, r * 2.6 + flowT * 0.7, vec2(3.1, 91.3)) - 0.5) * 0.03 * sway;

  /* ---- Iris de fibras ---- */
  /* Radio de las puntas por ángulo: borde EMPLUMADO en mechones
     desiguales (dos octavas de variación) que respira — las fibras
     terminan disolviéndose en el fondo, sin ningún aro geométrico. */
  float tip = 0.97
            + (anoise(a01w, 7.0, 2.7, vec2(57.1, 13.9)) - 0.5) * 0.26
            + (anoise(a01w, 19.0, 5.1, vec2(9.3, 71.7)) - 0.5) * 0.12
            + 0.014 * sin(uTime * 0.33 + ang * 3.0);

  float enIn = smoothstep(rp * 0.96, rp * 1.10, rw);
  /* Apagado largo: el último tercio de cada fibra se desvanece. */
  float enOut = 1.0 - smoothstep(tip * 0.62, tip, rw);
  float irisBand = enIn * enOut;

  vec3 col = vec3(0.0);

  if (irisBand > 0.001) {
    /* Avección radial LENTA en frecuencia baja → hebras largas y sedosas. */
    float rr = rw * 4.5 - uTime * 0.10;

    /* Mechones (≈14/rev) modulan el brillo de las fibras finas. */
    float clump = anoise(a01w, 14.0, rw * 2.2 - uTime * 0.035, vec2(11.3, 47.9));
    clump = 0.26 + 1.05 * pow(clump, 1.35);

    /* Dos capas de fibra fina (≈110 y ≈190 por revolución). */
    float f1 = anoise(a01w, 110.0, rr, vec2(0.0, 5.0));
    float f2 = anoise(a01w, 190.0, rr * 1.9 + 7.0, vec2(41.0, 23.0));
    float fine = f1 * 0.58 + f2 * 0.42;

    /* Afilar: de campo de ruido a filamentos densos y crujientes. */
    float strand = pow(fine, 3.0) * 2.35 * clump;

    /* Collarette: el anillo de contracción de un iris real — la
       frontera irregular entre la zona pupilar y la ciliar (~1.55·rp)
       donde las fibras se apelmazan y brillan un punto más. El ancho
       varía con el mechón para que no lea como circunferencia. */
    float collar = exp(-pow((rw - rp * 1.55) / (0.05 + 0.02 * clump), 2.0));
    strand *= 1.0 + collar * 0.4;

    /* Envolvente radial: incandescente junto a la pupila, se apaga
       hacia las puntas (la firma de la referencia). */
    float radial = mix(1.85, 0.45, smoothstep(rp * 1.02, tip, rw));
    float irisL = strand * irisBand * radial;

    /* Rampa de color rojo→ámbar→verde (evita el pantano rojo+verde). */
    float tcol = smoothstep(rp * 0.9, tip * 0.98, rw);
    vec3 hot  = mix(vec3(0.88, 0.15, 0.12), EMBER, smoothstep(0.30, 0.54, tcol));
    vec3 cold = mix(GREEN_CORE * 1.06, GREEN_DEEP, smoothstep(0.68, 1.0, tcol));
    vec3 fiberCol = mix(hot, cold, smoothstep(0.44, 0.68, tcol));

    /* Raíces blanco-fuego: las fibras nacen incandescentes y toman
       color al alejarse (blanco → rojo → ámbar → verde). */
    float rootWhite = (1.0 - smoothstep(rp, rp + 0.20, rw)) * 0.62;
    fiberCol = mix(fiberCol, RIM_WHITE, rootWhite);

    /* Jitter de tono por fibra: profundidad orgánica. */
    float jit = anoise(a01w, 55.0, rw * 3.0, vec2(77.7, 19.1));
    fiberCol = mix(fiberCol, mix(RED_DEEP, GREEN_DEEP, tcol), jit * 0.38);

    col += fiberCol * irisL * 2.05;

    /* Aro de raíces incandescente pegado a la pupila. */
    float rim = exp(-pow((rw - rp * 1.07) / 0.05, 2.0));
    col += RIM_WHITE * rim * (0.38 + 1.05 * strand) * irisBand * 1.7;

    /* Chispas blancas en el tercio interior de las fibras. */
    float sparkle = pow(fine, 6.0) * (1.0 - smoothstep(rp, rp + 0.36, rw));
    col += RIM_WHITE * sparkle * irisBand * 1.5;
  }

  /* ---- Pupila ----
     Borde con leve irregularidad orgánica (ninguna pupila real es un
     círculo perfecto): un ruido de baja frecuencia por ángulo desplaza
     el radio de entrada/salida un ±3,5 %, apenas perceptible pero
     rompe la geometría "vectorial" de un círculo exacto. */
  float pupilWobble = (anoise(a01, 9.0, 3.0, vec2(21.0, 61.0)) - 0.5) * 0.035;
  float pupil = 1.0 - smoothstep(
    rp * (0.90 + pupilWobble), rp * (1.01 + pupilWobble), r
  );
  vec3 pupilCol = vec3(0.016, 0.012, 0.012)
                + RED_DEEP * 0.16 * exp(-pow(r / (rp * 0.42 + 1e-4), 2.0));
  col = mix(col, pupilCol, pupil);

  /* ---- Catch-light corneal ----
     El reflejo especular que hace leer una pupila como húmeda/viva en
     vez de plana. Dirección FIJA (no sigue a uLook): un catch-light de
     verdad es el reflejo de una fuente de luz externa fija en la
     habitación, no de la mirada — si siguiera al ojo perdería el efecto
     "foco de estudio" y leería como un brillo pegado en postproducción.
     Doble mancha (primaria arriba-izquierda + secundaria, pequeña,
     ligeramente desplazada — el patrón clásico de un retrato de
     estudio con key + fill light), multiplicada por el propio pupil
     para quedar confinada al disco y apagarse igual que el resto
     durante el parpadeo. */
  vec2 glintDir = vec2(-0.38, 0.58);
  vec2 glintPos1 = glintDir * rp * 0.5;
  float glint1 = exp(-pow(length(p - glintPos1) / (rp * 0.17), 2.0));
  vec2 glintPos2 = glintPos1 * 0.15 + vec2(rp * 0.16, -rp * 0.1);
  float glint2 = exp(-pow(length(p - glintPos2) / (rp * 0.075), 2.0));
  col += RIM_WHITE * (glint1 * 0.85 + glint2 * 0.55) * pupil;

  /* ---- Halo exterior emplumado ----
     Sustituye al antiguo anillo de cerdas (una circunferencia con
     rayas que leía como gráfico, no como ojo): un resplandor ancho y
     orgánico que sigue el borde emplumado de las fibras, modulado por
     los mismos mechones del iris — el ojo se funde con la oscuridad
     como en la referencia, sin geometría visible. */
  float tuft = anoise(a01w, 14.0, 3.3, vec2(11.3, 47.9));
  float halo = exp(-pow((r - tip * 0.90) / (0.20 + 0.10 * tuft), 2.0));
  vec3 haloCol = mix(GREEN_CORE, GREEN_DEEP, 0.45) * 0.85 + RING_IVORY * 0.10;
  col += haloCol * halo * (0.16 + 0.30 * tuft)
       * smoothstep(rp, rp * 1.6, r);

  /* ---- Párpados: apertura almendrada + parpadeo ----
     La silueta de ojo real no sale de deformar el iris (los iris son
     círculos): la hacen los PÁRPADOS. En reposo (uBlink = 1) quedan
     entreabiertos — apertura vertical de 0.84·R en el centro que se
     estrecha hacia los extremos con la curva cuadrática (0.52·x²) →
     la almendra clásica. El parpadeo cierra desde esa posición de
     reposo, no desde "todo abierto". Borde difuso ancho (0.20) para
     que el recorte lea como sombra de párpado, no como línea; suelo
     0.10 para que bajo el párpado quede un resto de brillo apagado
     (piel translúcida) en vez de negro cortado. Solo afecta a la zona
     del ojo — el bokeh y el polvo lejanos ni se recortan ni parpadean. */
  float lidCurve = 1.0 - 0.52 * p.x * p.x;
  float aperture = mix(0.03, 0.84, uBlink) * lidCurve;
  float lidMask = 1.0 - smoothstep(aperture - 0.20, aperture, abs(p.y));
  float eyeZone = 1.0 - smoothstep(1.25, 1.7, r);
  float blinkFactor = mix(1.0, mix(0.10, 1.0, lidMask), eyeZone);
  col *= blinkFactor;

  /* Sombra del párpado superior: oclusión suave sobre la franja alta
     del iris — un globo ocular real nunca recibe la misma luz arriba
     (bajo el párpado) que abajo. Solo el hemisferio superior; asienta
     el ojo en su cuenca en vez de flotar plano. */
  float lidShadow = smoothstep(aperture - 0.34, aperture, p.y)
                  * step(0.0, p.y) * eyeZone;
  col *= 1.0 - 0.22 * lidShadow;

  /* ---- Niebla ambiental y bokeh ---- */
  float haze = (1.0 - smoothstep(0.15, 1.55, r));
  float wisp = fbm(p * 1.1 + vec2(uTime * 0.012, -uTime * 0.009));
  vec3 hazeCol = mix(RED_DEEP, GREEN_DEEP, smoothstep(0.35, 1.15, r));
  col += hazeCol * haze * (0.03 + 0.11 * wisp);

  for (int i = 0; i < 10; i++) {
    float fi = float(i);
    float h1 = hash11(fi * 13.7 + 1.0);
    float h2 = hash11(fi * 29.3 + 5.0);
    vec2 bp = (vec2(h1, h2) * 2.0 - 1.0) * vec2(1.45, 1.15);
    bp += 0.10 * vec2(sin(uTime * 0.05 + fi * 1.9), cos(uTime * 0.041 + fi * 2.7));
    float d = length(p - bp);
    float sz = mix(0.010, 0.034, hash11(fi * 3.1 + 9.0));
    float tw = 0.5 + 0.5 * sin(uTime * 0.5 + fi * 2.3);
    vec3 bc = mix(GREEN_CORE, RED_CORE, step(0.62, h1)) * 0.55 + RIM_WHITE * 0.30;
    col += bc * exp(-(d * d) / (sz * sz)) * 0.5 * (0.35 + 0.65 * tw);
  }

  /* ---- Polvo de fondo ----
     Motas diminutas repartidas por TODA la pantalla (coordenadas de
     pantalla, no del ojo — a diferencia del bokeh, que orbita cerca
     del iris) para dar la sensación de atmósfera/profundidad de la
     referencia aprobada: puntos de luz dispersos, no solo el ojo
     flotando en un vacío plano. Rejilla en espacio de pantalla escalada
     por minDim (para que la densidad de motas no cambie con el aspect
     ratio), con solo ~1,3% de celdas activas (hash > umbral) y un
     parpadeo lento e independiente por mota. Nivel muy bajo (0.09) —
     es textura ambiental, nunca debe competir con el ojo. */
  vec2 duv = frag / minDim * 42.0;
  vec2 dcell = floor(duv);
  vec2 dfrac = fract(duv);
  /* mod() antes del hash: dcell crece sin límite con el ancho de
     pantalla, y el argumento grande que eso produce dentro de sin()
     (hash21) pierde precisión en varias GPUs — se ve como bandas
     verticales regulares en vez de parpadeo aleatorio (bug de
     portabilidad GLSL conocido). Envolver a un rango pequeño mantiene
     el argumento seguro sin cambiar el aspecto del polvo. */
  float dh = hash21(mod(dcell, 19.0));
  float dstar = step(0.987, dh);
  float dtw = 0.35 + 0.65 * sin(uTime * (0.5 + dh * 1.1) + dh * 41.0);
  float ddist = length(dfrac - 0.5);
  float dspark = dstar * exp(-ddist * ddist * 34.0) * dtw;
  vec3 dcol = mix(GREEN_CORE, RIM_WHITE, hash11(dh * 91.0 + 3.0));
  col += dcol * dspark * 0.09;

  /* ---- Composición final ---- */
  col *= uExposure * (0.35 + 0.65 * uIntro);

  /* Tonemap + saturación leve. */
  col = 1.0 - exp(-col * 1.30);
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(luma), col, 1.06);

  /* Fondo: profundidad central que respira hacia --bg en los bordes. */
  vec2 uv = frag / res;
  float vig = smoothstep(1.65, 0.35, length((uv - 0.5) * vec2(res.x / res.y, 1.0) * 1.35));
  vec3 base = BG_DARK * mix(1.0, 0.72, vig * 0.8);

  /* MISMO color en ambos temas: richColor (la saturación 1.6 que hacía
     tan vívido el modo claro) es ahora la fuente única — el oscuro
     dejaba de usarla y por eso su tono se veía distinto/apagado frente
     al claro. A petición expresa: el tono del claro, también en oscuro. */
  vec3 richColor = mix(vec3(luma), col, 1.6);

  vec3 dark = base + richColor;

  /* Tema claro: TINTA sobre papel, no luz añadida sobre blanco.
     Medido con readPixels: la primera versión (BG_LIGHT*(1-luma*k) +
     col*m) daba [255,241,233] en el centro de la pupila — blanco puro
     clippeado, prácticamente el mismo valor que el fondo [242,243,236].
     Sumar color sobre una base ~0.95 satura los tres canales casi de
     inmediato; el resultado siempre iba a leer como "blanco con un
     tinte", nunca como color de verdad, por mucho que subiera el
     multiplicador.
     La técnica correcta es un compuesto "over" (como tinta impresa):
     donde el ojo tiene presencia real se pinta el color casi entero;
     donde no la tiene, se ve el papel puro — nunca se SUMAN ambos.
       - eyePresence: accionado por GEOMETRÍA (pupil + irisBand +
         halo), no por luma. La primera versión usaba luma y el rojo
         del centro —naturalmente más brillante que el verde exterior—
         quedaba casi opaco mientras el verde se diluía hacia el papel:
         mismo tono en teoría, pero el ojo se leía rojo-dominante en
         claro y equilibrado en oscuro. irisBand cubre la MISMA banda
         para el tramo rojo y el verde (solo se apaga en el 38% final
         emplumado, igual que en oscuro), así que ambos colores reciben
         la misma cobertura de "tinta" — el tono ya no depende de qué
         tan brillante sea cada color.
       - richColor: mismo color que ya usa el tema oscuro (col), con
         un empujón de saturación adicional (1.6) MÁS allá del 1.06
         global de la línea de arriba — un canal puede clippear a tope
         (rojo a 255 con verde/azul bajos sigue leyendo como "rojo
         vivo"), muy distinto a los tres canales clippeando juntos
         (eso sí lee como blanco, el bug anterior).
     richColor se declara antes de la rama oscura: desde el pivote de
     "mismo tono en ambos temas" es la fuente ÚNICA de color de las
     dos ramas. */
  float eyePresence = clamp(pupil + irisBand * 1.15 + halo * 1.3, 0.0, 1.0);
  eyePresence = max(eyePresence, luma * 0.9) * blinkFactor;
  vec3 light = mix(BG_LIGHT, richColor, eyePresence);
  vec3 outCol = mix(dark, light, uTheme);

  /* Dithering: mata el banding de los degradados oscuros. mod() antes
     del hash por la misma razón que el polvo de fondo: frag sin acotar
     puede producir el mismo artefacto de bandas en vez de disimularlo. */
  float dith = (hash21(mod(frag + fract(uTime) * 61.7, 61.0)) - 0.5) / 255.0 * 3.0;
  outCol += dith;

  gl_FragColor = vec4(outCol, 1.0);
}
`;

/* Suavizado exponencial independiente del frame-rate. */
const damp = (cur: number, target: number, lambda: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp((-lambda * dt) / 1000));

export function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = matchMedia("(pointer: fine)").matches;

    const gl =
      (canvas.getContext("webgl", {
        alpha: false,
        depth: false,
        stencil: false,
        antialias: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
      }) as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) {
      setWebglFailed(true);
      return;
    }

    /* ---- Compilación ---- */
    const mk = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("BackgroundFX shader:", gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    let prog: WebGLProgram | null = null;
    let buf: WebGLBuffer | null = null;
    let uni: Record<string, WebGLUniformLocation | null> = {};

    const build = () => {
      const vs = mk(gl.VERTEX_SHADER, VERT);
      const fs = mk(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;
      const p = gl.createProgram();
      if (!p) return false;
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error("BackgroundFX link:", gl.getProgramInfoLog(p));
        return false;
      }
      prog = p;
      gl.useProgram(prog);
      buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      /* Full-screen triangle: menos overdraw de setup que un quad. */
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW
      );
      const loc = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      for (const name of [
        "uRes",
        "uTime",
        "uScroll",
        "uDilate",
        "uLook",
        "uIntro",
        "uExposure",
        "uTheme",
        "uEyeY",
        "uBlink",
      ]) {
        uni[name] = gl.getUniformLocation(prog, name);
      }
      return true;
    };

    if (!build()) {
      setWebglFailed(true);
      return;
    }

    /* ---- Estado de animación ---- */
    let raf: number | null = null;
    let running = true;
    let destroyed = false;
    let last = performance.now();
    let t0 = last;

    let scrollS = 0; // progreso suavizado
    let lastY = window.scrollY;
    let lookX = 0;
    let lookY = 0;
    let lookTX = 0;
    let lookTY = 0;
    let intro = reduce ? 1 : 0;
    let theme = document.documentElement.dataset.theme === "light" ? 1 : 0;

    /* Parpadeo: primer blink a los ~6 s (tras el intro); después
       espaciado (7–15 s) y con doble parpadeo muy poco frecuente — un
       ojo tranquilo que observa, no un tic nervioso. */
    let blinkStart = t0 - 9999;
    let nextBlink = t0 + 6000;
    const hash01 = (x: number) => {
      const s = Math.sin(x * 0.001) * 43758.5453;
      return s - Math.floor(s);
    };

    /* Mirada de scroll por FIJACIONES (sacada → fijación → retorno),
       como un ojo que lee — sustituye al seguimiento elástico continuo
       que daba bandazos pegados a la rueda. Solo mueve la MIRADA; la
       pupila no cambia de tamaño con el scroll. */
    let gazeState = 0; // 0 = centro · 1 = leyendo hacia abajo · -1 = arriba
    let gazeCur = 0;
    let gazeFrom = 0;
    let gazeTo = 0;
    let gazeStart = t0 - 9999;
    let lastScrollActive = 0;

    /* Micro-sacadas: un ojo real nunca queda perfectamente quieto —
       cada 1,4–4 s hace un flick rápido e involuntario a un punto
       cercano y vuelve. Perfil triangular (sube en 90 ms, baja en
       170 ms) para que se sienta como un movimiento nervioso y rápido,
       no como una oscilación suave. Amplitud pequeña (0.08–0.22 del
       rango de `uLook`) — debe leerse como "vivo", nunca como tic o
       glitch. Se suma al look del puntero/scroll, nunca lo reemplaza. */
    let saccadeTX = 0;
    let saccadeTY = 0;
    let saccadeStart = t0 - 9999;
    let nextSaccade = t0 + 1200 + hash01(t0) * 1500;

    /* Escalado adaptativo de resolución. */
    let quality = 1;
    let emaFrame = 8;
    let qCooldown = 0;

    const dprCap = () => Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const s = dprCap() * quality;
      const bw = Math.max(2, Math.round(w * s));
      const bh = Math.max(2, Math.round(h * s));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        gl.viewport(0, 0, bw, bh);
      }
    };

    const scrollProgress = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      return Math.min(1, Math.max(0, window.scrollY / max));
    };

    const onPointer = (e: PointerEvent) => {
      lookTX = (e.clientX / window.innerWidth - 0.5) * 2;
      lookTY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onPointerLeave = () => {
      lookTX = 0;
      lookTY = 0;
    };

    const draw = (now: number, dt: number) => {
      const t = (now - t0) / 1000;

      /* Scroll: progreso suavizado (solo para la exposición por tramo). */
      const prog01 = scrollProgress();
      scrollS = damp(scrollS, prog01, 3.2, dt);
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;

      /* Mirada de scroll por FIJACIONES: al detectar desplazamiento
         sostenido, UNA sacada balística (160 ms, easeOutQuart) hacia
         abajo/arriba y la mirada queda FIJADA ahí mientras dure el
         scroll; a los 500 ms de parar, sacada de retorno al centro.
         Es el patrón sacada→fijación de un ojo leyendo — nada de
         deslizamiento elástico pegado a la velocidad de la rueda.
         (La pupila NO se dilata con el scroll — el dueño lo pidió
         retirar: leía como que la pupila "crecía" al hacer scroll.) */
      const scrolling = Math.abs(dy) > 2;
      if (scrolling) lastScrollActive = now;
      if (!reduce) {
        const dir = dy > 0 ? 1 : -1;
        if (scrolling && gazeState !== dir) {
          gazeState = dir;
          gazeFrom = gazeCur;
          gazeTo = dir > 0 ? -0.3 : 0.24;
          gazeStart = now;
        } else if (
          !scrolling &&
          gazeState !== 0 &&
          now - lastScrollActive > 500
        ) {
          gazeState = 0;
          gazeFrom = gazeCur;
          gazeTo = 0;
          gazeStart = now;
        }
        const gk = Math.min(1, (now - gazeStart) / 160);
        gazeCur = gazeFrom + (gazeTo - gazeFrom) * (1 - Math.pow(1 - gk, 4));
      }

      /* Mirada con inercia. */
      lookX = damp(lookX, lookTX, 4.5, dt);
      lookY = damp(lookY, lookTY, 4.5, dt);

      /* Micro-sacadas: dispara un flick nuevo cuando toca, luego anima
         un perfil triangular (subida rápida, bajada algo más suave)
         durante 260 ms; el resto del tiempo queda en reposo (0,0). */
      let saccadeX = 0;
      let saccadeY = 0;
      if (!reduce) {
        if (now >= nextSaccade) {
          const h = hash01(now);
          const ang = h * Math.PI * 2;
          const mag = 0.08 + hash01(now * 1.7) * 0.14;
          saccadeTX = Math.cos(ang) * mag;
          saccadeTY = Math.sin(ang) * mag;
          saccadeStart = now;
          nextSaccade = now + 1400 + h * 2600;
        }
        const st = now - saccadeStart;
        if (st < 260) {
          const k = st / 260;
          const shape = k < 0.35 ? k / 0.35 : 1 - (k - 0.35) / 0.65;
          saccadeX = saccadeTX * shape;
          saccadeY = saccadeTY * shape;
        }
      }

      /* Apertura inicial — anclada a tiempo de reloj (no a dt acumulado)
         para que dure 1,1 s reales aunque el frame-rate caiga. */
      if (intro < 1) intro = Math.min(1, (now - t0) / 1100);
      const introE = 1 - Math.pow(1 - intro, 3); // easeOutCubic

      /* Exposición por tramo: presencia SIEMPRE — protagonista arriba,
         apenas medio paso atrás sobre el contenido, pleno de nuevo
         hacia el cierre (antes caía un 44 % y el ojo desaparecía). */
      const mid = smoothstep01((scrollS - 0.06) / 0.24);
      const end = smoothstep01((scrollS - 0.78) / 0.2);
      const exposure = (1.0 - 0.24 * mid + 0.24 * end) * 1.14;

      /* Parpadeo: cierre 130 ms (acelerando) + apertura 240 ms (suave) —
         un pelín más lento y líquido que antes. Doble parpadeo raro
         (~1 de cada 12) y separación larga (7–15 s): el ojo observa con
         calma, no parpadea de seguido. */
      let open = 1;
      if (!reduce) {
        if (now >= nextBlink) {
          blinkStart = now;
          const h = hash01(now);
          nextBlink = now + (h < 0.08 ? 420 : 7000 + h * 8000);
        }
        const bt = now - blinkStart;
        if (bt < 130) {
          const k = bt / 130;
          open = 1 - k * k;
        } else if (bt < 370) {
          const k = (bt - 130) / 240;
          open = 1 - Math.pow(1 - k, 3); /* easeOutCubic 0 → 1 */
        }
      }

      gl.uniform2f(uni.uRes, canvas.width, canvas.height);
      gl.uniform1f(uni.uTime, reduce ? 13.7 : t);
      gl.uniform1f(uni.uScroll, scrollS);
      gl.uniform1f(uni.uDilate, 0.0);
      gl.uniform2f(
        uni.uLook,
        (finePointer ? lookX : 0) + saccadeX,
        (finePointer ? lookY : 0) + gazeCur + saccadeY
      );
      gl.uniform1f(uni.uBlink, reduce ? 1 : open);
      gl.uniform1f(uni.uIntro, introE);
      gl.uniform1f(uni.uExposure, exposure);
      gl.uniform1f(uni.uTheme, theme);
      /* Centro FIJO (46 % desde arriba): el ojo es un observador
         anclado — no se desliza con el scroll (aquello leía como
         parallax barato); te sigue solo con la MIRADA. gl_FragCoord
         tiene el eje Y invertido → 1 - yVisual. */
      gl.uniform1f(uni.uEyeY, 1 - 0.46);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const smoothstep01 = (x: number) => {
      const c = Math.min(1, Math.max(0, x));
      return c * c * (3 - 2 * c);
    };

    const loop = (now: number) => {
      if (!running || destroyed) return;
      const dt = Math.min(64, now - last);
      last = now;

      /* Calidad adaptativa: EMA del frame-time. */
      emaFrame = emaFrame * 0.94 + dt * 0.06;
      qCooldown -= dt;
      if (qCooldown <= 0) {
        if (emaFrame > 13.2 && quality > 0.55) {
          quality = Math.max(0.55, quality * 0.85);
          qCooldown = 900;
          resize();
        } else if (emaFrame < 7.5 && quality < 1) {
          quality = Math.min(1, quality / 0.85);
          qCooldown = 1600;
          resize();
        }
      }

      draw(now, dt);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (raf === null && !reduce && !destroyed) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) start();
      else stop();
    };

    const onResize = () => {
      resize();
      if (reduce) draw(performance.now(), 16);
    };

    /* Cambios de tema en runtime (data-theme en <html>). */
    const mo = new MutationObserver(() => {
      const next = document.documentElement.dataset.theme === "light" ? 1 : 0;
      if (next !== theme) {
        theme = next;
        if (reduce) draw(performance.now(), 16);
      }
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const onLost = (e: Event) => {
      e.preventDefault();
      stop();
    };
    const onRestored = () => {
      uni = {};
      if (build()) {
        resize();
        start();
      } else {
        setWebglFailed(true);
      }
    };

    canvas.addEventListener("webglcontextlost", onLost, false);
    canvas.addEventListener("webglcontextrestored", onRestored, false);
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    if (finePointer) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("mouseleave", onPointerLeave);
    }

    resize();
    if (reduce) {
      draw(performance.now(), 16);
    } else {
      start();
    }

    return () => {
      destroyed = true;
      stop();
      mo.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (finePointer) {
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("mouseleave", onPointerLeave);
      }
      const ext = gl.getExtension("WEBGL_lose_context");
      if (buf) gl.deleteBuffer(buf);
      if (prog) gl.deleteProgram(prog);
      ext?.loseContext();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Ojo WebGL (o fallback CSS si no hay WebGL) */}
      {webglFailed ? (
        <div className="absolute inset-0" style={{ background: "var(--bg)" }}>
          {/* Aproximación estática: halo suave + iris rojo→verde + pupila
              (sin el antiguo aro de radios — leía como gráfico, no ojo). */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "min(78vmin, 1040px)",
              height: "min(78vmin, 1040px)",
              background:
                "radial-gradient(circle, transparent 38%, rgb(52 211 153 / 0.12) 52%, rgb(52 211 153 / 0.04) 62%, transparent 72%)",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "min(54vmin, 720px)",
              height: "min(54vmin, 720px)",
              background:
                "repeating-conic-gradient(from 2deg, rgb(52 211 153 / 0.55) 0deg 0.5deg, transparent 0.5deg 2.1deg), radial-gradient(circle, rgb(255 244 224 / 0.9) 13.5%, rgb(239 68 68 / 0.85) 17%, rgb(200 90 40 / 0.5) 26%, rgb(52 211 153 / 0.38) 44%, rgb(10 40 28 / 0.25) 58%, transparent 62%)",
              WebkitMaskImage:
                "radial-gradient(circle, #000 12%, #000 60%, transparent 64%)",
              maskImage:
                "radial-gradient(circle, #000 12%, #000 60%, transparent 64%)",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "min(15vmin, 200px)",
              height: "min(15vmin, 200px)",
              background:
                "radial-gradient(circle, #060505 62%, rgb(90 15 10 / 0.6) 78%, transparent 100%)",
              boxShadow: "0 0 60px 10px rgb(255 240 220 / 0.16)",
            }}
          />
        </div>
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      )}
      {/* Halo superior de tinta */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 85% at 50% -8%, color-mix(in srgb, var(--ink) 4%, transparent), transparent 52%)",
        }}
      />
      {/* Grano — mismo fractalNoise que el resto del sitio */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
          backgroundSize: "120px 120px",
          opacity: 0.045,
          mixBlendMode: "overlay",
        }}
      />
      {/* Viñeta inferior */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(135% 125% at 50% 42%, transparent 72%, color-mix(in srgb, var(--bg) 82%, #000) 100%)",
          opacity: 0.34,
        }}
      />
    </div>
  );
}
