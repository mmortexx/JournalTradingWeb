/**
 * Marca de clase de activo — cripto · divisas · acciones · futuros.
 *
 * Antes eran cuatro puntos de color de la paleta genérica de Tailwind
 * (`bg-amber-400`, `bg-emerald-400`, `bg-rose-400`, `bg-teal-400`). Dos
 * problemas, y el segundo es el grave:
 *
 *  1. La marca es acromática a propósito: el verde y el rojo son del P&L y
 *     de nada más. Cuatro colores decorativos rompen esa regla.
 *  2. Esmeralda y rosa son, a 6 px, los mismos tonos que ganancia y
 *     pérdida. El punto de «acciones» se leía como pérdida y el de
 *     «divisas» como ganancia, justo en una tabla de operaciones donde la
 *     mirada busca precisamente eso. Medido sobre papel claro: 1,53:1 y
 *     1,58:1 — por debajo del 3:1 que pide una señal gráfica.
 *
 * La clase pasa a codificarse por FORMA, en tinta terciaria: rombo, disco,
 * anillo y cuadrado. Se distinguen sin color —también con daltonismo, y en
 * una impresión en blanco y negro— y el color queda libre para el dato.
 */

const FORMA: Record<string, string> = {
  // rombo — un cuadrado girado; la diagonal lo hace el más ancho de los cuatro
  crypto: "rotate-45",
  // disco
  forex: "rounded-full",
  // anillo: mismo disco, vaciado
  stock: "rounded-full bg-transparent border-[1.5px] border-[rgb(var(--txt-tertiary))]",
  // cuadrado
  futures: "",
};

export function AssetMark({
  assetClass,
  title,
  className = "",
}: {
  assetClass?: string;
  title?: string;
  className?: string;
}) {
  const forma = FORMA[assetClass ?? "stock"] ?? FORMA.stock;
  return (
    // El envoltorio fija la caja a 10×10: el rombo sobresale de su propio
    // cuadro al girar, y sin caja fija desalinearía la columna respecto a
    // las otras tres formas.
    <span
      className={`inline-grid place-items-center w-[10px] h-[10px] shrink-0 ${className}`}
      aria-hidden="true"
      title={title}
    >
      <span
        className={`block w-[7px] h-[7px] bg-[rgb(var(--txt-tertiary))] ${forma}`}
      />
    </span>
  );
}
