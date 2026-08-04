/**
 * Las herramientas del sitio, con dirección propia.
 *
 * ── Por qué ──────────────────────────────────────────────────────────
 * Había seis calculadoras interactivas, todas funcionando y calculando de
 * verdad, metidas dentro de otras páginas: la de riesgo a media página de
 * métricas, el Monte Carlo al final de disciplina, la de ahorro dentro de
 * precios. Nadie puede enlazar «la calculadora de tamaño de posición de
 * CountPips» porque no existe tal dirección, y son justo el tipo de pieza
 * que la gente enlaza y comparte.
 *
 * Aquí no se escribe una calculadora nueva: se reutilizan exactamente los
 * mismos componentes, que siguen apareciendo donde ya aparecían.
 *
 * ── Sobre el orden ───────────────────────────────────────────────────
 * De más buscado a menos. La de tamaño de posición es, de largo, la
 * consulta más frecuente de quien empieza a gestionar riesgo.
 */

export type Herramienta = {
  slug: string;
  /** Componente que la dibuja. Se resuelve en la página con `dynamic`. */
  componente:
    | "RiskCalculator"
    | "RMultipleSimulator"
    | "EdgeSignificanceChecker"
    | "EquityProjector"
    | "SavingsCalculator"
    | "SessionClock";
  tituloEs: string;
  tituloEn: string;
  /** Titular de la cabecera. Corto: se anima carácter a carácter. */
  h1Es: string;
  h1En: string;
  /** Parte del titular que va resaltada. */
  resaltaEs: string;
  resaltaEn: string;
  subtituloEs: string;
  subtituloEn: string;
  /** Para el índice y para la ficha del buscador. */
  resumenEs: string;
  resumenEn: string;
  descripcionEs: string;
  descripcionEn: string;
};

export const HERRAMIENTAS: Herramienta[] = [
  {
    slug: "calculadora-de-riesgo",
    componente: "RiskCalculator",
    tituloEs: "Calculadora de tamaño de posición",
    tituloEn: "Position size calculator",
    h1Es: "Cuánto puedes arriesgar.",
    h1En: "How much you can risk.",
    resaltaEs: "arriesgar.",
    resaltaEn: "risk.",
    subtituloEs:
      "Dime tu capital, el porcentaje que arriesgas y la distancia a tu stop, y te digo el tamaño exacto de la posición. Sin registro y sin que nada de lo que escribas salga de tu navegador.",
    subtituloEn:
      "Tell me your capital, the percentage you risk and the distance to your stop, and I will tell you the exact position size. No sign-up, and nothing you type leaves your browser.",
    resumenEs: "El tamaño exacto de la posición a partir de tu riesgo y tu stop.",
    resumenEn: "The exact position size from your risk and your stop.",
    descripcionEs:
      "Calcula el tamaño de posición a partir de tu capital, el porcentaje de riesgo por operación y la distancia al stop. Gratis, sin registro y sin enviar datos.",
    descripcionEn:
      "Work out position size from your capital, your risk per trade and the distance to your stop. Free, no sign-up, no data sent.",
  },
  {
    slug: "significancia-estadistica",
    componente: "EdgeSignificanceChecker",
    tituloEs: "¿Tu ventaja es real o es suerte?",
    tituloEn: "Is your edge real, or luck?",
    h1Es: "¿Ventaja real o buena racha?",
    h1En: "Real edge, or a good run?",
    resaltaEs: "o buena racha?",
    resaltaEn: "or a good run?",
    subtituloEs:
      "Con veinte operaciones detrás, un buen resultado no significa nada: cabe de sobra dentro de lo que produce el azar. Mete tus números y mira si tu muestra ya dice algo o todavía no.",
    subtituloEn:
      "With twenty trades behind it, a good result means nothing: it fits comfortably inside what chance alone produces. Enter your numbers and see whether your sample says anything yet.",
    resumenEs: "Si tu muestra ya distingue una ventaja del azar, o aún no.",
    resumenEn: "Whether your sample can tell an edge from chance yet.",
    descripcionEs:
      "Comprueba si tus resultados de trading distinguen una ventaja real del azar, a partir del número de operaciones, el porcentaje de aciertos y el payoff.",
    descripcionEn:
      "Check whether your trading results tell a real edge from chance, using number of trades, win rate and payoff.",
  },
  {
    slug: "monte-carlo",
    componente: "RMultipleSimulator",
    tituloEs: "Simulador de Monte Carlo",
    tituloEn: "Monte Carlo simulator",
    h1Es: "Mil versiones de tu año.",
    h1En: "A thousand versions of your year.",
    resaltaEs: "de tu año.",
    resaltaEn: "of your year.",
    subtituloEs:
      "La misma ventaja, repetida muchas veces, da resultados muy distintos. Esto reordena tus operaciones al azar una y otra vez para enseñarte el abanico completo: no lo que salió, sino lo que podía haber salido.",
    subtituloEn:
      "The same edge, repeated many times, produces very different outcomes. This reshuffles your trades over and over to show you the whole fan: not what happened, but what could have.",
    resumenEs: "El abanico de caminos posibles con tu ventaja, y el peor de ellos.",
    resumenEn: "The fan of possible paths for your edge — and the worst of them.",
    descripcionEs:
      "Simula miles de reordenaciones de tus operaciones para ver el abanico de curvas posibles, la peor racha y el riesgo de arruinar la cuenta.",
    descripcionEn:
      "Simulate thousands of reorderings of your trades to see the fan of possible curves, the worst run and the risk of ruining the account.",
  },
  {
    slug: "proyector-de-capital",
    componente: "EquityProjector",
    tituloEs: "Proyector de capital",
    tituloEn: "Equity projector",
    h1Es: "A dónde lleva tu ventaja.",
    h1En: "Where your edge leads.",
    resaltaEs: "tu ventaja.",
    resaltaEn: "your edge.",
    subtituloEs:
      "Si mantienes tu esperanza matemática y tu ritmo de operaciones, esto es la curva que sale a varios años. Es aritmética, no una promesa: sirve para ver el efecto del interés compuesto, no para contar con él.",
    subtituloEn:
      "If you hold your expectancy and your trade frequency, this is the curve over several years. It is arithmetic, not a promise: it shows what compounding does, it does not guarantee it.",
    resumenEs: "La curva a varios años si mantienes tu esperanza y tu ritmo.",
    resumenEn: "The multi-year curve if you hold your expectancy and pace.",
    descripcionEs:
      "Proyecta tu curva de capital a varios años a partir de tu esperanza matemática por operación y de cuántas haces al mes.",
    descripcionEn:
      "Project your equity curve over several years from your expectancy per trade and how many trades you take per month.",
  },
  {
    slug: "reloj-de-sesiones",
    componente: "SessionClock",
    tituloEs: "Reloj de sesiones de mercado",
    tituloEn: "Market session clock",
    h1Es: "Qué mercado está abierto.",
    h1En: "Which market is open.",
    resaltaEs: "está abierto.",
    resaltaEn: "is open.",
    subtituloEs:
      "Asia, Londres y Nueva York en una misma banda de veinticuatro horas, en hora real. Lo que importa no es cuándo abre cada plaza, sino dónde se solapan: ahí hay dos mercados despiertos a la vez.",
    subtituloEn:
      "Asia, London and New York on a single twenty-four-hour band, in real time. What matters is not when each opens, but where they overlap: that is when two markets are awake at once.",
    resumenEs: "Asia, Londres y Nueva York en hora real, con sus solapes.",
    resumenEn: "Asia, London and New York in real time, with their overlaps.",
    descripcionEs:
      "Qué sesión de mercado está abierta ahora mismo y dónde se solapan Asia, Londres y Nueva York, que es cuando el precio más se mueve.",
    descripcionEn:
      "Which market session is open right now and where Asia, London and New York overlap, which is when price moves most.",
  },
  {
    slug: "ahorro-vs-suscripcion",
    componente: "SavingsCalculator",
    tituloEs: "Pago único frente a suscripción",
    tituloEn: "One-time payment vs subscription",
    h1Es: "Lo que cuesta alquilar.",
    h1En: "What renting costs.",
    resaltaEs: "alquilar.",
    resaltaEn: "renting.",
    subtituloEs:
      "Una suscripción de journal cuesta poco al mes y mucho a los cinco años. Pon la cuota que pagas o que te plantean y compárala con pagar una vez.",
    subtituloEn:
      "A journal subscription costs little per month and a lot over five years. Enter the fee you pay, or the one you are being offered, and compare it with paying once.",
    resumenEs: "Cuánto suma una cuota mensual frente a pagar una sola vez.",
    resumenEn: "What a monthly fee adds up to versus paying once.",
    descripcionEs:
      "Compara el coste total de un diario de trading por suscripción frente a uno de pago único, en el plazo que elijas.",
    descripcionEn:
      "Compare the total cost of a subscription trading journal against a one-time purchase, over the period you choose.",
  },
];

export function herramientaPorSlug(slug: string): Herramienta | undefined {
  return HERRAMIENTAS.find((h) => h.slug === slug);
}
