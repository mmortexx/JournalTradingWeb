/**
 * Trading glossary — bilingual (ES / EN) definitions.
 *
 * FROZEN GLOSSARY PHILOSOPHY
 * ---------------------------
 * The `term` field is ALWAYS English. Even when the app UI is in Spanish,
 * trading terms stay in English: it is the lingua franca of the markets,
 * every prop firm / charting platform / community uses them, and
 * translating "stop loss" -> "pérdida de parada" only confuses the trader.
 *
 * The *definition* is the only field that changes with the active language.
 *
 * Categories:
 *  - basics      : vocabulary every trader must know
 *  - risk        : protecting capital
 *  - psychology  : the trader's mind
 *  - metrics     : the numbers that decide if you have an edge
 *  - execution   : how you actually get in and out
 */

export type GlossaryCategory =
  | "basics"
  | "risk"
  | "psychology"
  | "metrics"
  | "execution";

export interface GlossaryTerm {
  /** Always English — the frozen term name. */
  term: string;
  /** Spanish definition (1-2 sentences, precise and professional). */
  es: string;
  /** English definition (1-2 sentences, precise and professional). */
  en: string;
  category: GlossaryCategory;
}

export const GLOSSARY: GlossaryTerm[] = [
  // ────────────────────────────── BASICS ──────────────────────────────
  {
    term: "Long",
    es: "Posición comprada: ganas si el precio sube. Se abre comprando el activo con la expectativa de venderlo más caro.",
    en: "A bought position: you profit when price rises. Opened by buying the asset with the expectation of selling it higher.",
    category: "basics",
  },
  {
    term: "Short",
    es: "Posición vendida: ganas si el precio baja. Se abre vendiendo un activo prestado con la expectativa de recomprarlo más barato.",
    en: "A sold position: you profit when price falls. Opened by selling a borrowed asset with the expectation of buying it back cheaper.",
    category: "basics",
  },
  {
    term: "Setup",
    es: "Patrón o combinación de condiciones específicas y reproducibles que justifica entrar en una operación. Un buen setup tiene reglas claras de entrada, salida y gestión.",
    en: "A pattern or combination of specific, repeatable conditions that justifies entering a trade. A good setup has clear entry, exit and management rules.",
    category: "basics",
  },
  {
    term: "Breakout",
    es: "Movimiento de precio que rompe un nivel relevante de soporte o resistencia, suele interpretarse como el inicio de una nueva tendencia.",
    en: "A price movement that breaks a significant support or resistance level, often interpreted as the start of a new trend.",
    category: "basics",
  },
  {
    term: "Prop firm",
    es: "Empresa que aporta capital a traders que superan una evaluación. El trader opera con dinero de la firma y se reparte un porcentaje de los beneficios.",
    en: "A firm that provides capital to traders who pass an evaluation. The trader operates with the firm's money and shares a percentage of the profits.",
    category: "basics",
  },
  {
    term: "Track record",
    es: "Historial auditado de resultados reales de un trader a lo largo del tiempo. Es la única prueba objetiva de una ventaja estadística y la base para conseguir financiación.",
    en: "An audited history of a trader's real results over time. It is the only objective proof of a statistical edge and the basis for securing funding.",
    category: "basics",
  },
  {
    term: "Liquidity",
    es: "Facilidad con la que un activo puede comprarse o venderse sin mover significativamente su precio. Los mercados líquidos tienen spreads estrechos y permiten entrar y salir con tamaño sin deslizamiento relevante.",
    en: "The ease with which an asset can be bought or sold without significantly moving its price. Liquid markets have tight spreads and let you enter and exit with size without meaningful slippage.",
    category: "basics",
  },
  {
    term: "Volatility",
    es: "Magnitud de las variaciones de precio de un activo durante un periodo. Alta volatilidad implica rangos amplios y más riesgo por operación; baja volatilidad, movimientos más contenido y operaciones menores.",
    en: "The magnitude of an asset's price fluctuations over a period. High volatility means wide ranges and more risk per trade; low volatility means smaller moves and smaller trades.",
    category: "basics",
  },

  // ────────────────────────────── RISK ────────────────────────────────
  {
    term: "Stop loss",
    es: "Orden que cierra una posición automáticamente cuando el precio alcanza un nivel predeterminado, limitando la pérdida máxima por operación. Es la herramienta principal del control de riesgo.",
    en: "An order that automatically closes a position when price reaches a predetermined level, capping the maximum loss per trade. It is the primary risk-control tool.",
    category: "risk",
  },
  {
    term: "Drawdown",
    es: "Caída del capital desde un máximo histórico hasta el siguiente mínimo. Se mide en valor absoluto o porcentual, y es el indicador clave del riesgo real asumido.",
    en: "The decline in capital from a historical peak to the subsequent trough. Measured in absolute or percentage terms, it is the key indicator of real risk taken.",
    category: "risk",
  },
  {
    term: "Risk of ruin",
    es: "Probabilidad matemática de perder todo el capital de la cuenta asumiendo un tamaño de riesgo fijo por operación. Crece exponencialmente con el riesgo por trade.",
    en: "The mathematical probability of losing the entire account balance assuming a fixed risk size per trade. It grows exponentially with risk per trade.",
    category: "risk",
  },
  {
    term: "Position sizing",
    es: "Regla que determina cuántas unidades o cuánto capital arriesgar en cada operación. Es el motor del control de riesgo: con un sizing correcto nunca te arruinas.",
    en: "The rule that determines how many units or how much capital to risk on each trade. It is the engine of risk control: with correct sizing, you never go bust.",
    category: "risk",
  },
  {
    term: "Risk-reward ratio",
    es: "Relación entre el beneficio objetivo de una operación y la pérdida máxima aceptada (el riesgo). Un ratio 1:3 significa arriesgar 1 para ganar 3; permite ser rentable incluso con un win rate bajo.",
    en: "The relationship between a trade's target profit and the maximum accepted loss (the risk). A 1:3 ratio means risking 1 to make 3; it lets you stay profitable even with a low win rate.",
    category: "risk",
  },
  {
    term: "Kelly criterion",
    es: "Fórmula matemática que calcula la fracción óptima del capital a arriesgar por operación a partir del win rate y el payoff. En la práctica se usa una fracción (medio Kelly o cuarto de Kelly) para reducir la varianza.",
    en: "A mathematical formula that calculates the optimal fraction of capital to risk per trade based on win rate and payoff. In practice a fraction (half Kelly or quarter Kelly) is used to reduce variance.",
    category: "risk",
  },

  // ──────────────────────────── PSYCHOLOGY ────────────────────────────
  {
    term: "FOMO",
    es: "Miedo a perder una oportunidad (Fear Of Missing Out). Empuja a entrar tarde en operaciones que ya se han movido, normalmente justo antes de reversiones.",
    en: "Fear of missing out. It pushes you to enter late into trades that have already moved, usually right before reversals.",
    category: "psychology",
  },
  {
    term: "Revenge trading",
    es: "Operar de forma impulsiva y con tamaño excesivo para recuperar una pérdida reciente. Casi siempre amplifica la pérdida inicial y rompe el plan de riesgo.",
    en: "Trading impulsively and with excessive size to recover a recent loss. It almost always amplifies the initial loss and breaks the risk plan.",
    category: "psychology",
  },

  // ───────────────────────────── METRICS ──────────────────────────────
  {
    term: "Expectancy",
    es: "Beneficio o pérdida promedio esperado por operación, considerando win rate y payoff. Indica cuánto ganas (o pierdes) por cada dólar arriesgado a largo plazo.",
    en: "The average profit or loss expected per trade, factoring in win rate and payoff. It indicates how much you gain (or lose) per dollar risked over the long run.",
    category: "metrics",
  },
  {
    term: "Profit factor",
    es: "Cociente entre el beneficio bruto de las operaciones ganadoras y la pérdida bruta de las perdedoras. Un valor superior a 1.5 es sólido; por encima de 2 es excelente.",
    en: "The ratio of gross profit from winning trades to gross loss from losing trades. A value above 1.5 is solid; above 2 is excellent.",
    category: "metrics",
  },
  {
    term: "Sharpe ratio",
    es: "Mide el rendimiento ajustado al riesgo: el exceso de rentabilidad sobre el activo libre de riesgo dividido por la volatilidad de los retornos. Penaliza la variabilidad, no la dirección.",
    en: "Measures risk-adjusted return: the excess return over the risk-free asset divided by the volatility of returns. It penalizes variability, not direction.",
    category: "metrics",
  },
  {
    term: "Sortino ratio",
    es: "Variante del Sharpe que solo penaliza la volatilidad a la baja (pérdidas). Refleja mejor cómo un trader gestiona el riesgo real, ignorando las subidas positivas.",
    en: "A Sharpe variant that only penalizes downside volatility (losses). It better reflects how a trader manages real risk, ignoring positive upside.",
    category: "metrics",
  },
  {
    term: "Calmar ratio",
    es: "Cociente entre la rentabilidad anualizada y el drawdown máximo. Resume en un solo número la relación entre lo que ganas y lo que sufres en el peor momento.",
    en: "The ratio of annualized return to maximum drawdown. It summarizes in a single number the relationship between what you earn and what you suffer at the worst moment.",
    category: "metrics",
  },
  {
    term: "R-multiple",
    es: "Resultado de una operación expresado en múltiplos del riesgo inicial (R). +2R significa ganar el doble de lo arriesgado; -1R es perder justo el stop. Permite comparar operaciones de cualquier tamaño.",
    en: "A trade's result expressed as multiples of initial risk (R). +2R means winning twice what was risked; -1R is losing exactly the stop. It lets you compare trades of any size.",
    category: "metrics",
  },
  {
    term: "Win rate",
    es: "Porcentaje de operaciones ganadoras sobre el total. Es engañoso por sí solo: un 70 % de aciertos con payoff 0.5 pierde dinero; un 35 % con payoff 3 gana.",
    en: "The percentage of winning trades out of the total. Misleading on its own: a 70 % hit rate with a 0.5 payoff loses money; 35 % with a 3 payoff wins.",
    category: "metrics",
  },
  {
    term: "Payoff",
    es: "Cociente entre el beneficio medio de las operaciones ganadoras y la pérdida media de las perdedoras. Indica cuánto ganas cuando aciertas frente a cuánto pierdes cuando fallas.",
    en: "The ratio of the average profit on winning trades to the average loss on losing trades. It indicates how much you win when right versus how much you lose when wrong.",
    category: "metrics",
  },
  {
    term: "Monte Carlo",
    es: "Simulación que reordena aleatoriamente la secuencia histórica de tus operaciones miles de veces para estimar el rango probable de drawdowns y rentabilidades futuras. Revela la cola de riesgo.",
    en: "A simulation that randomly reorders the historical sequence of your trades thousands of times to estimate the probable range of future drawdowns and returns. It reveals the risk tail.",
    category: "metrics",
  },

  // ──────────────────────────── EXECUTION ─────────────────────────────
  {
    term: "Take profit",
    es: "Orden que cierra una posición automáticamente cuando se alcanza un objetivo de beneficio prefijado. Permite salir de la operación sin requerir tu atención constante.",
    en: "An order that automatically closes a position when a preset profit target is reached. It lets you exit the trade without requiring constant attention.",
    category: "execution",
  },
  {
    term: "MAE (Maximum Adverse Excursion)",
    es: "Máxima distancia en contra que recorrió el precio antes de cerrar la operación. Útil para auditar si tus stops son demasiado anchos o demasiado estrechos.",
    en: "The maximum adverse distance the price travelled before the trade closed. Useful for auditing whether your stops are too wide or too tight.",
    category: "execution",
  },
  {
    term: "MFE (Maximum Favorable Excursion)",
    es: "Máxima distancia a favor que recorrió el precio antes de cerrar la operación. Útil para auditar si tus objetivos son demasiado conservadores o demasiado ambiciosos.",
    en: "The maximum favorable distance the price travelled before the trade closed. Useful for auditing whether your targets are too conservative or too ambitious.",
    category: "execution",
  },
  {
    term: "Spread",
    es: "Diferencia entre el mejor precio de compra (bid) y el mejor precio de venta (ask) en el libro de órdenes. Es un coste implícito de cada operación: cuanto más estrecho, más barato entrar y salir.",
    en: "The difference between the best bid and the best ask in the order book. It is an implicit cost of every trade: the tighter it is, the cheaper it is to enter and exit.",
    category: "execution",
  },
  {
    term: "Slippage",
    es: "Diferencia entre el precio esperado de una orden y el precio al que realmente se ejecuta. Ocurre en mercados volátiles o ilíquidos y aumenta el coste real de operar más allá del spread.",
    en: "The difference between the expected price of an order and the price at which it actually fills. It occurs in volatile or illiquid markets and raises the real cost of trading beyond the spread.",
    category: "execution",
  },
];

/** Category metadata: id, ES/EN label, accent variant for the chip. */
export const GLOSSARY_CATEGORIES: {
  id: GlossaryCategory | "all";
  es: string;
  en: string;
}[] = [
  { id: "all", es: "Todas", en: "All" },
  { id: "basics", es: "Conceptos", en: "Basics" },
  { id: "risk", es: "Riesgo", en: "Risk" },
  { id: "psychology", es: "Psicología", en: "Psychology" },
  { id: "metrics", es: "Métricas", en: "Metrics" },
  { id: "execution", es: "Ejecución", en: "Execution" },
];
