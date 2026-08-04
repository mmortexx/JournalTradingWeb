import { useId } from "react";

/**
 * BrandGlyph — el logotipo de CountPips: el cuaderno con las tres velas.
 *
 * Es EL MISMO dibujo que la aplicación de escritorio, no una versión para
 * web: sale de `02-diseno/logo/countpips-logo.svg` y de su variante
 * pequeña, los dos archivos de los que también salen el icono de la app,
 * el de la bandeja del sistema y la barra de título.
 *
 * ── Por qué cambió, y esto conviene leerlo ────────────────────────────
 * Aquí había un libro ABIERTO dibujado a línea, heredado de la marca
 * anterior. No es el logotipo del producto. Y no fue un descuido
 * cualquiera: el comentario que justificaba el cambio afirmaba que el
 * archivo de la aplicación era «el ojo de iris rojo y amarillo», y en
 * `WindowChrome` otro decía que era «el ojo de trazo champagne sobre
 * placa oscura». Ninguna de las dos cosas es cierta — basta abrir
 * `CountPips.App/Assets/app-logo.png` para ver un cuaderno de piel con
 * tres velas japonesas en la tapa. Se retiró el motivo correcto por
 * describir mal el archivo que se tenía al lado, y la web anduvo desde
 * entonces con un logotipo que su producto no usa en ninguna parte.
 *
 * El sitio es papel y tinta, y este glifo entra a todo color. Es
 * deliberado: una marca se reconoce o no se reconoce, y quien vea el
 * cuaderno en la barra tiene que reconocer el mismo icono que va a
 * tener en su escritorio. La placa de vidrio de alrededor —que ponen
 * la barra, el pie y la intro— sigue siendo el material de la web y
 * hace de encuadre.
 *
 * ── Dos versiones, como en la aplicación ──────────────────────────────
 * Por debajo de 32 px se dibuja la variante reducida: sin sombra
 * proyectada, sin filete de encuadernación, sin el rayado del canto de
 * las hojas, y con las velas más gruesas y separadas. No es pereza —
 * a 16 px esos detalles miden menos de un píxel y lo que producen no es
 * detalle, es suciedad. El canto de las hojas y el marcapáginas se
 * conservan y se ensanchan, porque son las dos señales que distinguen
 * un cuaderno de un rectángulo con cosas encima.
 *
 * ── Los identificadores llevan sufijo, y hace falta ───────────────────
 * Los degradados de un SVG se referencian por `id`, y ese `id` es
 * GLOBAL a la página. La barra y el pie dibujan este glifo a la vez: con
 * identificadores fijos, ambos apuntarían a la primera definición y al
 * desmontarse esa —cambiar de ruta, cerrar el menú— el otro se quedaría
 * sin relleno, negro o invisible. `useId` le da a cada instancia los
 * suyos.
 */

/** Paleta del logotipo. Fija a propósito: es la marca, no el tema. */
const PARADAS = {
  cover: [
    ["0", "#8B9299"],
    ["0.30", "#727980"],
    ["0.68", "#585E64"],
    ["1", "#3C4348"],
  ],
  coverSmall: [
    ["0", "#8B9299"],
    ["0.34", "#6E757C"],
    ["1", "#42484E"],
  ],
  spine: [
    ["0", "#2B333A"],
    ["0.38", "#4B545C"],
    ["0.74", "#69727B"],
    ["1", "#4A535A"],
  ],
  spineSmall: [
    ["0", "#2B333A"],
    ["0.5", "#515A62"],
    ["1", "#646D76"],
  ],
  pages: [
    ["0", "#A4A7A9"],
    ["0.26", "#F1F4F7"],
    ["0.62", "#D2D5D8"],
    ["1", "#919496"],
  ],
  pagesSmall: [
    ["0", "#ABAEB0"],
    ["0.34", "#F2F5F8"],
    ["1", "#8E9193"],
  ],
  gold: [
    ["0", "#E8ECF0"],
    ["0.42", "#C3CBD3"],
    ["1", "#7E8791"],
  ],
  goldSmall: [
    ["0", "#EBEFF3"],
    ["0.5", "#CBD3DA"],
    ["1", "#949DA6"],
  ],
  ribbon: [
    ["0", "#C0C8D0"],
    ["0.55", "#8D959E"],
    ["1", "#5A626B"],
  ],
  ribbonSmall: [
    ["0", "#C0C8D0"],
    ["1", "#5E666F"],
  ],
} as const;

/** A partir de este tamaño se dibuja el logotipo con todo su detalle. */
const UMBRAL_DETALLE = 32;

type Parada = readonly (readonly [string, string])[];

function Degradado({
  id,
  paradas,
  x1 = 0,
  y1 = 0,
  x2 = 1,
  y2 = 0,
}: {
  id: string;
  paradas: Parada;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}) {
  return (
    <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
      {paradas.map(([offset, color]) => (
        <stop key={offset} offset={offset} stopColor={color} />
      ))}
    </linearGradient>
  );
}

export function BrandGlyph({
  size = 17,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const detalle = size >= UMBRAL_DETALLE;
  const g = (n: string) => `cp-${uid}-${n}`;
  const u = (n: string) => `url(#${g(n)})`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <Degradado
          id={g("cover")}
          paradas={detalle ? PARADAS.cover : PARADAS.coverSmall}
          x1={0.05}
          y1={0}
          x2={0.95}
          y2={1}
        />
        <Degradado id={g("spine")} paradas={detalle ? PARADAS.spine : PARADAS.spineSmall} />
        <Degradado id={g("pages")} paradas={detalle ? PARADAS.pages : PARADAS.pagesSmall} />
        <Degradado
          id={g("gold")}
          paradas={detalle ? PARADAS.gold : PARADAS.goldSmall}
          x2={0.6}
          y2={1}
        />
        <Degradado
          id={g("ribbon")}
          paradas={detalle ? PARADAS.ribbon : PARADAS.ribbonSmall}
          y2={0.2}
        />
        {detalle && (
          <>
            {/* Abombado de la piel: un realce ancho y suave, no un brillo
                de plástico. */}
            <radialGradient id={g("bulge")} cx="0.34" cy="0.28" r="0.78">
              <stop offset="0" stopColor="#DDE0E4" stopOpacity="0.26" />
              <stop offset="0.55" stopColor="#DDE0E4" stopOpacity="0.06" />
              <stop offset="1" stopColor="#21272D" stopOpacity="0.20" />
            </radialGradient>
            <linearGradient id={g("pagesBottom")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E9ECEF" />
              <stop offset="1" stopColor="#919496" />
            </linearGradient>
            <filter id={g("sh")} x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="13" />
            </filter>
            <filter id={g("shs")} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </>
        )}
      </defs>

      {detalle ? (
        <>
          {/* Sombra proyectada */}
          <g filter={`url(#${g("sh")})`} opacity="0.28">
            <rect
              x="140"
              y="126"
              width="266"
              height="306"
              rx="18"
              fill="#151A1F"
              transform="translate(6,14)"
            />
          </g>

          {/* Bloque de hojas: asoma por la derecha y por abajo */}
          <rect x="362" y="110" width="42" height="300" rx="10" fill={u("pages")} />
          <rect x="148" y="384" width="252" height="30" rx="10" fill={u("pagesBottom")} />
          <g stroke="#929598" strokeOpacity="0.5" strokeWidth="2.6" strokeLinecap="round">
            <path d="M370 148 L398 148" />
            <path d="M370 184 L398 184" />
            <path d="M370 220 L398 220" />
            <path d="M370 256 L398 256" />
            <path d="M370 292 L398 292" />
            <path d="M370 328 L398 328" />
          </g>

          {/* Cinta marcapáginas, saliendo de entre las hojas */}
          <path d="M300 378 L348 378 L348 458 L324 438 L300 458 Z" fill={u("ribbon")} />
          <path d="M300 378 L311 378 L311 454 L300 458 Z" fill="#FFFFFF" opacity="0.22" />

          {/* Tapa */}
          <rect x="126" y="96" width="250" height="300" rx="18" fill={u("cover")} />
          <rect x="126" y="96" width="250" height="300" rx="18" fill={`url(#${g("bulge")})`} />
          {/* Lomo */}
          <path
            d="M126 114 Q126 96 144 96 L174 96 L174 396 L144 396 Q126 396 126 378 Z"
            fill={u("spine")}
          />
          <rect x="164" y="103" width="6" height="286" rx="3" fill="#DDE0E4" opacity="0.32" />
          {/* Filo superior iluminado y canto inferior en sombra */}
          <path
            d="M146 99 L370 99"
            stroke="#E3E6EA"
            strokeOpacity="0.38"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M150 393 L370 393"
            stroke="#21272D"
            strokeOpacity="0.38"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          {/* Filete de encuadernación */}
          <rect
            x="198"
            y="122"
            width="152"
            height="248"
            rx="9"
            fill="none"
            stroke="#DDE0E4"
            strokeOpacity="0.22"
            strokeWidth="2.6"
          />

          {/* Velas japonesas en relieve sobre la tapa */}
          <g filter={`url(#${g("shs")})`} fill="#21272D" opacity="0.55" transform="translate(4,6)">
            <rect x="210" y="262" width="38" height="72" rx="8" />
            <rect x="223" y="236" width="12" height="26" rx="6" />
            <rect x="223" y="334" width="12" height="24" rx="6" />
            <rect x="256" y="204" width="38" height="88" rx="8" />
            <rect x="269" y="176" width="12" height="28" rx="6" />
            <rect x="269" y="292" width="12" height="24" rx="6" />
            <rect x="302" y="150" width="38" height="78" rx="8" />
            <rect x="315" y="124" width="12" height="26" rx="6" />
            <rect x="315" y="228" width="12" height="24" rx="6" />
          </g>
          <g fill={u("gold")}>
            <rect x="210" y="262" width="38" height="72" rx="8" />
            <rect x="223" y="236" width="12" height="26" rx="6" />
            <rect x="223" y="334" width="12" height="24" rx="6" />
            <rect x="256" y="204" width="38" height="88" rx="8" />
            <rect x="269" y="176" width="12" height="28" rx="6" />
            <rect x="269" y="292" width="12" height="24" rx="6" />
            <rect x="302" y="150" width="38" height="78" rx="8" />
            <rect x="315" y="124" width="12" height="26" rx="6" />
            <rect x="315" y="228" width="12" height="24" rx="6" />
          </g>
        </>
      ) : (
        <>
          {/* Bloque de hojas */}
          <rect x="352" y="98" width="56" height="322" rx="12" fill={u("pages")} />
          <rect x="132" y="386" width="272" height="38" rx="12" fill={u("pages")} />

          {/* Marcapáginas */}
          <path d="M292 380 L346 380 L346 470 L319 446 L292 470 Z" fill={u("ribbon")} />

          {/* Tapa */}
          <rect x="104" y="84" width="264" height="318" rx="20" fill={u("cover")} />
          <path
            d="M104 104 Q104 84 124 84 L162 84 L162 402 L124 402 Q104 402 104 382 Z"
            fill={u("spine")}
          />
          <rect x="150" y="92" width="9" height="302" rx="4.5" fill="#DDE0E4" opacity="0.34" />

          {/* Velas: tres, gruesas y bien separadas */}
          <g fill={u("gold")}>
            <rect x="192" y="256" width="46" height="86" rx="10" />
            <rect x="208" y="228" width="14" height="28" rx="7" />
            <rect x="208" y="342" width="14" height="26" rx="7" />
            <rect x="252" y="196" width="46" height="102" rx="10" />
            <rect x="268" y="166" width="14" height="30" rx="7" />
            <rect x="268" y="298" width="14" height="26" rx="7" />
            <rect x="312" y="140" width="46" height="92" rx="10" />
            <rect x="328" y="112" width="14" height="28" rx="7" />
            <rect x="328" y="232" width="14" height="26" rx="7" />
          </g>
        </>
      )}
    </svg>
  );
}

/**
 * El mismo logotipo como cadena de marcado, para los pocos sitios que
 * construyen HTML a mano (la intro monta su nodo con `innerHTML`).
 *
 * `sufijo` cumple aquí el papel que `useId` cumple en el componente: si
 * esta cadena se inserta mientras hay otro glifo en la página, los
 * identificadores de los degradados chocan. Por defecto lleva uno propio
 * que no colisiona con los que genera React.
 */
export const BRAND_GLYPH_SVG = (size = 22, sufijo = "intro") => {
  const g = (n: string) => `cp-${sufijo}-${n}`;
  const grad = (
    id: string,
    paradas: Parada,
    coords = 'x1="0" y1="0" x2="1" y2="0"',
  ) =>
    `<linearGradient id="${g(id)}" ${coords}>` +
    paradas.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("") +
    `</linearGradient>`;

  /* Siempre las paradas de la variante reducida, porque el cuerpo de
     abajo es el reducido. Mezclar los degradados de una versión con la
     geometría de la otra es la clase de incoherencia que no se ve en
     pantalla y luego nadie sabe explicar. */
  const defs =
    grad("cover", PARADAS.coverSmall, 'x1="0.05" y1="0" x2="0.95" y2="1"') +
    grad("spine", PARADAS.spineSmall) +
    grad("pages", PARADAS.pagesSmall) +
    grad("gold", PARADAS.goldSmall, 'x1="0" y1="0" x2="0.6" y2="1"') +
    grad("ribbon", PARADAS.ribbonSmall, 'x1="0" y1="0" x2="1" y2="0.2"');

  /* La cadena se usa sólo en la intro, a 22-30 px, así que dibuja la
     variante reducida: es la que está pensada para ese tamaño. */
  const cuerpo =
    `<rect x="352" y="98" width="56" height="322" rx="12" fill="url(#${g("pages")})"/>` +
    `<rect x="132" y="386" width="272" height="38" rx="12" fill="url(#${g("pages")})"/>` +
    `<path d="M292 380 L346 380 L346 470 L319 446 L292 470 Z" fill="url(#${g("ribbon")})"/>` +
    `<rect x="104" y="84" width="264" height="318" rx="20" fill="url(#${g("cover")})"/>` +
    `<path d="M104 104 Q104 84 124 84 L162 84 L162 402 L124 402 Q104 402 104 382 Z" fill="url(#${g("spine")})"/>` +
    `<rect x="150" y="92" width="9" height="302" rx="4.5" fill="#DDE0E4" opacity="0.34"/>` +
    `<g fill="url(#${g("gold")})">` +
    `<rect x="192" y="256" width="46" height="86" rx="10"/><rect x="208" y="228" width="14" height="28" rx="7"/><rect x="208" y="342" width="14" height="26" rx="7"/>` +
    `<rect x="252" y="196" width="46" height="102" rx="10"/><rect x="268" y="166" width="14" height="30" rx="7"/><rect x="268" y="298" width="14" height="26" rx="7"/>` +
    `<rect x="312" y="140" width="46" height="92" rx="10"/><rect x="328" y="112" width="14" height="28" rx="7"/><rect x="328" y="232" width="14" height="26" rx="7"/>` +
    `</g>`;

  return (
    `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" ` +
    `aria-hidden="true" style="display:block">` +
    `<defs>${defs}</defs>${cuerpo}</svg>`
  );
};
