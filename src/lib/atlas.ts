/**
 * El guion del atlas: qué figura graba cada sección y qué dice su pie.
 *
 * ── Por qué vive aquí y no en cada página ─────────────────────────────
 * Dos piezas necesitan la misma información y tienen que coincidir o el
 * fondo miente: `EngravedAtlas`, que dibuja, y `PlateInterlude`, que
 * escribe el pie de figura. Cuando cada una llevaba sus datos, bastaba
 * reordenar las láminas de una ruta para que el pie describiera una
 * figura distinta de la que se estaba grabando, y nada lo delataba.
 *
 * Aquí se declara una sola vez: el orden de este array ES el orden del
 * grabado y el orden de las pausas. `PlateInterlude` sólo recibe su
 * índice; el resto lo deduce de la ruta.
 */

export type PlateId =
  | "equity"
  | "calendar"
  | "distribution"
  | "gauge"
  | "heatmap"
  | "rolling"
  | "rules"
  | "streak"
  | "vault"
  | "ledger"
  | "tenure"
  | "sessions"
  | "significance"
  | "workspace";

export type PlateMeta = {
  titleEs: string;
  titleEn: string;
  noteEs: string;
  noteEn: string;
};

/**
 * El pie de cada figura. No repite lo que ya dice la página: explica qué
 * se está viendo y por qué esa figura importa. Un pie que dijera "curva
 * de resultados" sobraría — eso ya se ve.
 */
export const PLATE_META: Record<PlateId, PlateMeta> = {
  equity: {
    titleEs: "La curva que de verdad importa",
    titleEn: "The curve that actually matters",
    noteEs:
      "No el beneficio: la distancia entre tu capital y su techo histórico. Esa franja rayada es el drawdown, y es la cifra que decide si una cuenta sigue viva.",
    noteEn:
      "Not profit: the gap between your capital and its historic high. That hatched band is drawdown, and it is the number that decides whether an account survives.",
  },
  calendar: {
    titleEs: "Un mes, día a día",
    titleEn: "A month, day by day",
    noteEs:
      "Cada celda es una sesión. Cuanto más apretada la trama, mayor el resultado; las jornadas en pérdida van cruzadas. Un mes entero se lee de un vistazo, sin abrir un informe.",
    noteEn:
      "Each cell is a session. The tighter the hatching, the bigger the result; losing days are cross-hatched. A whole month reads at a glance, with no report to open.",
  },
  distribution: {
    titleEs: "¿Ventaja real o buena racha?",
    titleEn: "Real edge, or a good run?",
    noteEs:
      "La distribución de tus operaciones en múltiplos de riesgo. Si la cola derecha no pesa más que la izquierda, no hay ventaja: hay suerte, y la suerte revierte.",
    noteEn:
      "Your trades distributed in risk multiples. If the right tail does not outweigh the left, there is no edge — there is luck, and luck reverts.",
  },
  gauge: {
    titleEs: "Cuánto queda antes del límite",
    titleEn: "How much is left before the limit",
    noteEs:
      "El guardián mide el riesgo abierto contra tu tope diario y te frena antes de cruzarlo. La zona rayada del cuadrante es el tramo donde una cuenta de fondeo se pierde.",
    noteEn:
      "The guardian measures open risk against your daily cap and stops you before you cross it. The hatched arc is where a funded account gets lost.",
  },
  heatmap: {
    titleEs: "No cuánto ganas: cuándo",
    titleEn: "Not how much you make: when",
    noteEs:
      "Los días en horizontal, las horas de mercado en vertical. Cuanto más apretada la trama, más deja esa casilla. Casi nadie gana igual a las diez que a las tres, y el promedio de la sesión esconde justo eso.",
    noteEn:
      "Days across, market hours down. The tighter the hatching, the more that cell returns. Almost nobody performs the same at ten as at three, and a session average hides exactly that.",
  },
  rolling: {
    titleEs: "El margen de error, dibujado",
    titleEn: "The margin of error, drawn",
    noteEs:
      "El ratio medido sobre ventana móvil, con su banda de incertidumbre alrededor. La banda se estrecha según se acumulan operaciones: con veinte detrás, un número no es un hecho, es casi ruido.",
    noteEn:
      "The ratio measured over a rolling window, with its uncertainty band around it. The band narrows as trades accumulate: with twenty behind it, a number is not a fact — it is nearly noise.",
  },
  rules: {
    titleEs: "La regla que hoy no se cumple",
    titleEn: "The rule that fails today",
    noteEs:
      "Las condiciones que tú mismo te pusiste, una por renglón, con su marca al margen. La que va cruzada es la que frena la operación — un guardián que nunca dice que no no sirve de nada.",
    noteEn:
      "The conditions you set yourself, one per line, each with its mark. The crossed one is what blocks the trade — a guardian that never says no is worth nothing.",
  },
  streak: {
    titleEs: "Las pérdidas llegan seguidas",
    titleEn: "Losses arrive in a row",
    noteEs:
      "Sesiones consecutivas: arriba las que suman, abajo las que restan. No se reparten de forma ordenada, se agrupan — y el tope diario que cruza el dibujo existe para el día en que eso ocurre.",
    noteEn:
      "Consecutive sessions: gains above, losses below. They do not arrive evenly spaced, they cluster — and the daily cap crossing the plate exists for the day that happens.",
  },
  vault: {
    titleEs: "Un mecanismo que no se abre desde fuera",
    titleEn: "A mechanism that does not open from outside",
    noteEs:
      "Anillos, guardas y ojo de llave: el grabado con el que un tratado ilustra algo cerrado. Tus operaciones viven en tu disco, cifradas, sin pasar por un servidor ajeno.",
    noteEn:
      "Rings, wards and a keyhole: how a treatise engraves something sealed. Your trades live on your own disk, encrypted, without ever crossing someone else's server.",
  },
  ledger: {
    titleEs: "Antes de la métrica, el asiento",
    titleEn: "Before the metric, the entry",
    noteEs:
      "El libro mayor abierto, con sus columnas y sus renglones. Ninguna estadística existe hasta que alguien anota la operación: de ahí salen el nombre de esto y su logotipo.",
    noteEn:
      "The ledger, open, with its columns and its ruled lines. No statistic exists until someone writes the trade down: that is where this product's name and its mark come from.",
  },
  tenure: {
    titleEs: "Lo que separa alquilar de comprar",
    titleEn: "What separates renting from owning",
    noteEs:
      "Dos trazos sobre el mismo eje de años: la escalera de una suscripción, que sube un peldaño cada vez que vence, y la horizontal de un pago que se hace una sola vez. Lo que argumenta no es ninguna de las dos líneas, sino el hueco tramado entre ellas — crece solo, sin que nadie añada nada.",
    noteEn:
      "Two strokes on the same axis of years: the staircase of a subscription, climbing a step each time it renews, and the flat line of a payment made once. Neither line is the argument — the hatched gap between them is, and it widens on its own, with nobody adding anything.",
  },
  sessions: {
    titleEs: "El día partido en husos",
    titleEn: "The day divided into sessions",
    noteEs:
      "Asia, Londres y Nueva York sobre una misma banda de veinticuatro horas. Lo que importa no es cuándo abre cada plaza, sino dónde se pisan: en esas franjas cruzadas hay dos mercados despiertos a la vez, y es cuando el precio se mueve de verdad.",
    noteEn:
      "Asia, London and New York on a single twenty-four-hour band. What matters is not when each opens, but where they overlap: in those cross-hatched strips two markets are awake at once, and that is when price really moves.",
  },
  significance: {
    titleEs: "Dónde acaba la suerte",
    titleEn: "Where luck runs out",
    noteEs:
      "La campana es lo que una racha cualquiera produce sola, sin ventaja ninguna. Sólo la cola tramada, más allá del umbral, dice algo. Fíjese en la desproporción: casi cualquier buen mes cabe todavía bajo la joroba.",
    noteEn:
      "The bell is what any run produces on its own, with no edge at all. Only the hatched tail, beyond the threshold, says anything. Note the disproportion: almost any good month still fits under the hump.",
  },
  workspace: {
    titleEs: "El alzado del instrumento",
    titleEn: "The instrument, in elevation",
    noteEs:
      "Marco, barra, columna de navegación y la mancha repartida en paneles. No es una captura —un grabado no reproduce una pantalla—, es el plano de cómo está ordenado lo que aquí al lado se puede tocar.",
    noteEn:
      "Frame, title bar, navigation column and the working area split into panels. Not a screenshot — an engraving does not reproduce a screen — but the plan of how the thing you can try right here is laid out.",
  },
};

/**
 * El guion de cada sección. El orden manda: es el del grabado y el de las
 * pausas.
 *
 * El número de láminas no es decorativo — sale de lo larga que sea la
 * página. Poner cuatro en una ruta corta obligaría a comprimir las pausas
 * hasta que dejaran de cumplir su función, que es precisamente dar aire.
 */
export const ATLAS_ROUTES: Record<string, PlateId[]> = {
  "/": ["equity", "calendar", "distribution", "gauge"],
  "/features": ["ledger", "equity", "heatmap", "rules"],
  "/features/metricas": ["rolling", "distribution", "heatmap"],
  "/features/disciplina": ["rules", "gauge", "streak"],
  "/features/seguridad": ["vault", "ledger"],
  /* `tenure` es propia de esta ruta y va PRIMERA a propósito: la lámina
     que abre una sección es la que le pone tema. Antes abría el libro
     mayor, que es de seguridad, y la página de precios empezaba hablando
     de otra cosa. La curva de capital se queda de segunda porque lo que
     se compra aquí sirve para eso. */
  "/pricing": ["tenure", "equity"],
  /* Una sola lámina, y ahora es la que toca: la página enseña la
     aplicación funcionando y el fondo la dibuja en alzado. Antes llevaba
     el mapa de calor, prestado de métricas. */
  "/demo": ["workspace"],
  /* `significance` abre y la distribución la sigue, en ese orden porque
     el orden es un argumento: primero dónde acaba la suerte, después
     cómo se reparten tus operaciones. Antes abría la distribución sola,
     prestada de la portada y de métricas. */
  "/faq": ["significance", "distribution"],
  /* El reloj de sesiones es propio de esta página —el mismo que se puede
     tocar más abajo— y va primero. La media móvil se queda de segunda; el
     libro mayor sale, que ya titula en seguridad y en características. */
  "/about": ["sessions", "rolling"],
};

const ROMAN = ["I", "II", "III", "IV", "V"];

/**
 * Normaliza la ruta antes de buscar. En producción el sitio cuelga de un
 * subdirectorio y el router puede entregar la ruta con ese prefijo y con
 * barra final; sin esto ninguna clave casaría fuera de local y todas las
 * secciones caerían en el juego de la portada.
 */
export function normalizeRoute(pathname: string): string {
  let p = (pathname || "/").replace(/\/+$/, "");
  const cut = p.indexOf("/features");
  if (cut > 0) p = p.slice(cut);
  else if (p && !ATLAS_ROUTES[p]) {
    const last = "/" + p.split("/").filter(Boolean).pop();
    if (ATLAS_ROUTES[last]) p = last;
  }
  return ATLAS_ROUTES[p || "/"] ? p || "/" : "/";
}

/** Ids de lámina de una ruta, en orden de grabado. */
export function platesForRoute(pathname: string): PlateId[] {
  return ATLAS_ROUTES[normalizeRoute(pathname)];
}

/** Pie de figura de la lámina `index` de esta ruta. `null` si no existe. */
export function plateAt(
  pathname: string,
  index: number
): (PlateMeta & { roman: string; id: PlateId }) | null {
  const ids = platesForRoute(pathname);
  const id = ids[index];
  if (!id) return null;
  return { ...PLATE_META[id], roman: ROMAN[index] ?? String(index + 1), id };
}
