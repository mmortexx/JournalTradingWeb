import { GLOSSARY, type GlossaryCategory, type GlossaryTerm } from "@/lib/trading/glossary";

/**
 * El glosario, convertido en secciones del sitio.
 *
 * ── Por qué existe este archivo ───────────────────────────────────────
 * Los 51 términos llevaban tiempo escritos, en los dos idiomas y con
 * definiciones de calidad, y solo se veían dentro de una ventana emergente
 * que se abre desde un enlace del pie. Cero direcciones propias, cero
 * posibilidad de que alguien llegue buscando «qué es el drawdown». Era el
 * activo más desaprovechado del proyecto.
 *
 * Aquí no se escribe contenido nuevo: se le da dirección al que ya había.
 *
 * ── Sobre el término en inglés ────────────────────────────────────────
 * El nombre del término NO se traduce, y la dirección tampoco. Es la
 * decisión que ya tomó el glosario original y es la correcta: nadie busca
 * «pérdida de parada», se busca «stop loss» aunque se escriba el resto en
 * español. Lo que cambia con el idioma es la definición.
 */

export type TerminoGlosario = GlossaryTerm & { slug: string };

/** «Risk-reward ratio» → «risk-reward-ratio». */
export function slugTermino(term: string): string {
  return term
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Los 51 términos con su dirección ya calculada. */
export const TERMINOS: TerminoGlosario[] = GLOSSARY.map((t) => ({
  ...t,
  slug: slugTermino(t.term),
}));

export function terminoPorSlug(slug: string): TerminoGlosario | undefined {
  return TERMINOS.find((t) => t.slug === slug);
}

/** Nombre visible de cada familia, en los dos idiomas. */
export const CATEGORIAS: Record<
  GlossaryCategory,
  { es: string; en: string; descEs: string; descEn: string }
> = {
  basics: {
    es: "Fundamentos",
    en: "Basics",
    descEs: "El vocabulario mínimo para leer cualquier análisis sin perderse.",
    descEn: "The minimum vocabulary to read any analysis without getting lost.",
  },
  risk: {
    es: "Riesgo",
    en: "Risk",
    descEs: "Lo que decide si una cuenta sobrevive a una mala racha.",
    descEn: "What decides whether an account survives a bad run.",
  },
  psychology: {
    es: "Psicología",
    en: "Psychology",
    descEs: "Los errores que no salen en el gráfico y se pagan igual.",
    descEn: "The mistakes that never show on the chart and cost the same.",
  },
  metrics: {
    es: "Métricas",
    en: "Metrics",
    descEs: "Los números que distinguen una ventaja real de una buena racha.",
    descEn: "The numbers that tell a real edge from a good run.",
  },
  execution: {
    es: "Ejecución",
    en: "Execution",
    descEs: "Cómo se entra y se sale de verdad, con sus costes.",
    descEn: "How you actually get in and out, and what it costs.",
  },
};

/** Orden de presentación: de lo general a lo específico. */
export const ORDEN_CATEGORIAS: GlossaryCategory[] = [
  "basics",
  "risk",
  "metrics",
  "execution",
  "psychology",
];

export function terminosPorCategoria(cat: GlossaryCategory): TerminoGlosario[] {
  return TERMINOS.filter((t) => t.category === cat);
}

/**
 * Términos vecinos, para que ninguna página sea un callejón sin salida.
 *
 * Son los de su misma familia, que es la relación que de verdad existe en
 * los datos. No invento parentescos que nadie ha declarado: si un término
 * es de riesgo, sus vecinos son los de riesgo.
 */
export function relacionados(slug: string, cuantos = 4): TerminoGlosario[] {
  const t = terminoPorSlug(slug);
  if (!t) return [];
  const mismos = terminosPorCategoria(t.category).filter((x) => x.slug !== slug);
  const i = mismos.findIndex((x) => x.slug > slug);
  const desde = i < 0 ? 0 : i;
  /* Se empieza por el siguiente alfabético y se da la vuelta al llegar al
     final: así cada término enseña vecinos distintos y no salen siempre
     los cuatro primeros de la familia en las trece páginas. */
  return [...mismos.slice(desde), ...mismos.slice(0, desde)].slice(0, cuantos);
}

/** Anterior y siguiente en el recorrido completo, para poder hojearlo. */
export function vecinos(slug: string): {
  anterior?: TerminoGlosario;
  siguiente?: TerminoGlosario;
} {
  const i = TERMINOS.findIndex((t) => t.slug === slug);
  if (i < 0) return {};
  return {
    anterior: i > 0 ? TERMINOS[i - 1] : undefined,
    siguiente: i < TERMINOS.length - 1 ? TERMINOS[i + 1] : undefined,
  };
}

/**
 * Dónde continúa cada familia dentro del producto.
 *
 * Un glosario que solo define palabras es una enciclopedia. Este además
 * lleva a la parte del programa que mide ese concepto, que es lo que hace
 * que la visita sirva para algo.
 */
export const SEGUIR_LEYENDO: Record<
  GlossaryCategory,
  { href: string; es: string; en: string }
> = {
  basics: {
    href: "/features",
    es: "Todo lo que el journal registra de cada operación",
    en: "Everything the journal records about each trade",
  },
  risk: {
    href: "/features/disciplina",
    es: "El guardián que te frena antes de romper tu propio límite",
    en: "The guardian that stops you before you break your own limit",
  },
  metrics: {
    href: "/features/metricas",
    es: "Las métricas que separan una ventaja real de una racha",
    en: "The metrics that tell a real edge from a run",
  },
  execution: {
    href: "/features/metricas",
    es: "Rendimiento por hora, por día y por setup",
    en: "Performance by hour, by day and by setup",
  },
  psychology: {
    href: "/features/disciplina",
    es: "Cuánto cuesta en dinero saltarse el plan",
    en: "What breaking the plan costs in money",
  },
};

/**
 * Términos que además tienen una herramienta que los calcula.
 *
 * Sólo los que existen de verdad — se comprueban contra las direcciones
 * de `/herramientas`. Un enlace de más aquí sería un 404 en el glosario.
 */
export const HERRAMIENTA_DE: Record<string, string> = {
  /* Riesgo y dimensionamiento */
  "position-sizing": "/herramientas/calculadora-de-riesgo",
  "stop-loss": "/herramientas/calculadora-de-riesgo",
  "risk-reward-ratio": "/herramientas/calculadora-de-riesgo",
  "kelly-criterion": "/herramientas/calculadora-de-riesgo",

  /* Varianza y supervivencia. `risk-of-ruin` apuntaba a una herramienta
     propia que NO existe: no hay tal componente, y el enlace habría sido
     un 404 servido desde el glosario. El Monte Carlo es donde ese
     concepto se ve de verdad, porque el riesgo de ruina sale justamente
     de simular muchos caminos. */
  "risk-of-ruin": "/herramientas/monte-carlo",
  "monte-carlo": "/herramientas/monte-carlo",
  "r-multiple": "/herramientas/monte-carlo",
  drawdown: "/herramientas/monte-carlo",
  "max-drawdown": "/herramientas/monte-carlo",

  /* ¿Ventaja o azar? */
  expectancy: "/herramientas/significancia-estadistica",
  "win-rate": "/herramientas/significancia-estadistica",
  edge: "/herramientas/significancia-estadistica",
  payoff: "/herramientas/significancia-estadistica",
  backtesting: "/herramientas/significancia-estadistica",
  "curve-fitting": "/herramientas/significancia-estadistica",

  /* Interés compuesto */
  cagr: "/herramientas/proyector-de-capital",

  /* Horarios */
  "london-session": "/herramientas/reloj-de-sesiones",
  /* El término se llama «NY session», no «New York session». Escrito a
     ojo daba una clave que no casaba con ningún término y el enlace
     simplemente no habría aparecido — un fallo silencioso, de los que no
     rompen nada y solo restan. */
  "ny-session": "/herramientas/reloj-de-sesiones",
  "asia-session": "/herramientas/reloj-de-sesiones",
  "kill-zone": "/herramientas/reloj-de-sesiones",

  /* Conducta */
  discipline: "/test",
  tilt: "/test",
  "revenge-trading": "/test",
  fomo: "/test",
};
