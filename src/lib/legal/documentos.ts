import { TITULAR, LEGAL_ACTUALIZADO } from "@/lib/legal/titular";

/**
 * El texto de las cuatro páginas legales, en los dos idiomas.
 *
 * ── POR QUÉ ESTÁ ESCRITO ASÍ ──────────────────────────────────────────
 * No es una plantilla. Cada afirmación describe algo que este sitio hace
 * de verdad y que se ha comprobado en el código:
 *
 *  · El formulario de contacto envía a Web3Forms (`src/lib/forms.ts:19`).
 *  · La lista de espera envía a un script de Google Apps Script
 *    (`src/lib/forms.ts:46`, `docs/waitlist-apps-script.js`).
 *  · No hay analítica, ni píxeles, ni publicidad: no existe ninguna otra
 *    llamada a un tercero en todo el proyecto.
 *  · Las tipografías se sirven desde el propio dominio (`next/font`), así
 *    que ni siquiera hay una petición a Google Fonts que registre una IP.
 *  · Lo único que queda en el navegador son siete claves de almacenamiento
 *    local, listadas una a una más abajo. NINGUNA es una cookie.
 *
 * Una plantilla genérica habría hablado de cookies analíticas y de
 * publicidad comportamental que aquí no existen. Habría sido más largo y
 * menos cierto, y además habría desperdiciado el mejor argumento de este
 * producto, que es justamente que no recoge nada.
 *
 * ── LO QUE ESTO NO ES ─────────────────────────────────────────────────
 * Un borrador redactado por quien construye el sitio, no por un abogado.
 * Sirve para publicar una web informativa con lista de espera. Antes de
 * cobrar un solo euro hay que pasarlo por un profesional, sobre todo los
 * términos de venta y la licencia del programa.
 */

export type Bloque =
  | { tipo: "parrafo"; es: string; en: string }
  | { tipo: "lista"; es: string[]; en: string[] }
  | {
      tipo: "tabla";
      cabecerasEs: string[];
      cabecerasEn: string[];
      filas: { es: string[]; en: string[] }[];
    };

export type Seccion = {
  /** Ancla estable de la sección. En inglés a propósito: no cambia al traducir. */
  id: string;
  tituloEs: string;
  tituloEn: string;
  bloques: Bloque[];
};

export type DocumentoLegal = {
  slug: string;
  tituloEs: string;
  tituloEn: string;
  /** Frase de cabecera. Lo que el visitante necesita saber en una línea. */
  entradaEs: string;
  entradaEn: string;
  descripcionEs: string;
  descripcionEn: string;
  secciones: Seccion[];
};

const CONTACTO_ES =
  "Puedes ejercerlos escribiendo al buzón de soporte que aparece en la página de contacto. Te responderemos en el plazo que marca la ley.";
const CONTACTO_EN =
  "You can exercise them by writing to the support mailbox shown on the contact page. We will reply within the period the law allows.";

/* ════════════════════════════════════════════════════════════════════
   PRIVACIDAD
   ════════════════════════════════════════════════════════════════════ */

const privacidad: DocumentoLegal = {
  slug: "privacidad",
  tituloEs: "Política de privacidad",
  tituloEn: "Privacy policy",
  entradaEs:
    "Esta web recoge dos cosas, y solo si tú las escribes: tu correo si te apuntas a la lista de espera, y lo que pongas en el formulario de contacto. No hay analítica, ni cookies de terceros, ni publicidad.",
  entradaEn:
    "This site collects two things, and only if you type them: your email if you join the waiting list, and whatever you write in the contact form. There is no analytics, no third-party cookies and no advertising.",
  descripcionEs:
    "Qué datos recoge la web de CountPips, quién los trata y cómo pedir que se borren. Sin analítica ni rastreo.",
  descripcionEn:
    "What data the CountPips site collects, who processes it and how to have it deleted. No analytics, no tracking.",
  secciones: [
    {
      id: "responsable",
      tituloEs: "Quién trata tus datos",
      tituloEn: "Who processes your data",
      bloques: [
        {
          tipo: "parrafo",
          es: `El responsable del tratamiento es el titular de ${TITULAR.nombreComercial}. Los datos identificativos completos figuran en el aviso legal.`,
          en: `The data controller is the owner of ${TITULAR.nombreComercial}. Full identifying details are set out in the legal notice.`,
        },
      ],
    },
    {
      id: "what",
      tituloEs: "Qué se recoge, y solo si tú lo escribes",
      tituloEn: "What is collected, and only if you type it",
      bloques: [
        {
          tipo: "parrafo",
          es: "En toda la web hay exactamente dos formularios. Fuera de ellos, no se recoge ningún dato personal.",
          en: "There are exactly two forms on this site. Outside them, no personal data is collected at all.",
        },
        {
          tipo: "tabla",
          cabecerasEs: ["Formulario", "Qué pide", "A dónde va"],
          cabecerasEn: ["Form", "What it asks", "Where it goes"],
          filas: [
            {
              es: [
                "Lista de espera",
                "Tu correo, el idioma en que navegas y desde qué página te apuntaste",
                "Una hoja de cálculo de Google, a través de un script propio",
              ],
              en: [
                "Waiting list",
                "Your email, the language you are browsing in and which page you signed up from",
                "A Google spreadsheet, through our own script",
              ],
            },
            {
              es: [
                "Contacto",
                "Tu nombre, tu correo y tu mensaje",
                "Web3Forms, que lo reenvía al buzón de soporte",
              ],
              en: [
                "Contact",
                "Your name, your email and your message",
                "Web3Forms, which forwards it to the support mailbox",
              ],
            },
          ],
        },
        {
          tipo: "parrafo",
          es: "El campo oculto que ambos formularios incluyen no recoge nada tuyo: está ahí para que los programas automáticos lo rellenen y así poder descartarlos. Una persona nunca lo ve.",
          en: "The hidden field both forms include collects nothing about you: it is there for automated programs to fill in so they can be discarded. A human never sees it.",
        },
      ],
    },
    {
      id: "not-collected",
      tituloEs: "Qué NO se recoge",
      tituloEn: "What is NOT collected",
      bloques: [
        {
          tipo: "parrafo",
          es: "Merece una sección propia porque es la parte que casi ninguna web puede escribir:",
          en: "This deserves its own section because it is the part almost no website can write:",
        },
        {
          tipo: "lista",
          es: [
            "No hay analítica. Ni Google Analytics, ni ninguna otra: no se sabe cuánta gente entra, ni desde dónde, ni qué mira.",
            "No hay píxeles de seguimiento ni publicidad, de nadie.",
            "No se elabora ningún perfil tuyo, ni se toman decisiones automatizadas sobre ti.",
            "No se comparte, vende ni cede tu correo a terceros con fines comerciales.",
            "Las tipografías se sirven desde este mismo dominio, así que ni siquiera se produce una petición a un servidor de fuentes que pudiera registrar tu dirección IP.",
          ],
          en: [
            "There is no analytics. Not Google Analytics, not any other: we do not know how many people visit, from where, or what they look at.",
            "There are no tracking pixels and no advertising, from anyone.",
            "No profile of you is built, and no automated decisions are made about you.",
            "Your email is never shared, sold or transferred to third parties for commercial purposes.",
            "Fonts are served from this same domain, so not even a request to a font server that could log your IP address takes place.",
          ],
        },
      ],
    },
    {
      id: "purpose",
      tituloEs: "Para qué se usan y con qué base legal",
      tituloEn: "What they are used for, and on what legal basis",
      bloques: [
        {
          tipo: "lista",
          es: [
            "Lista de espera: avisarte cuando el programa esté disponible. La base es tu consentimiento, que das al escribir tu correo y enviarlo.",
            "Contacto: responder a lo que preguntas. La base es tu consentimiento y el interés en atender tu solicitud.",
          ],
          en: [
            "Waiting list: to tell you when the software is available. The basis is your consent, given when you type your email and submit it.",
            "Contact: to answer what you ask. The basis is your consent and the interest in handling your request.",
          ],
        },
        {
          tipo: "parrafo",
          es: "Tu correo no se usa para enviarte publicidad de otros productos ni boletines que no hayas pedido.",
          en: "Your email is not used to send you advertising for other products, nor newsletters you did not ask for.",
        },
      ],
    },
    {
      id: "processors",
      tituloEs: "Quién más los ve",
      tituloEn: "Who else sees them",
      bloques: [
        {
          tipo: "parrafo",
          es: "Dos proveedores tratan datos por encargo, porque la web es estática y no tiene servidor propio donde recibirlos:",
          en: "Two providers process data on our behalf, because the site is static and has no server of its own to receive it:",
        },
        {
          tipo: "lista",
          es: [
            "Web3Forms — recibe el formulario de contacto y lo reenvía al buzón de soporte.",
            "Google — aloja la hoja de cálculo de la lista de espera y ejecuta el script que la escribe.",
          ],
          en: [
            "Web3Forms — receives the contact form and forwards it to the support mailbox.",
            "Google — hosts the waiting-list spreadsheet and runs the script that writes to it.",
          ],
        },
        {
          tipo: "parrafo",
          es: "Ambos pueden tratar la información en servidores situados fuera del Espacio Económico Europeo, amparándose en los mecanismos de transferencia que prevé la normativa. El sitio se aloja en Cloudflare y en GitHub, que como cualquier alojamiento procesan las peticiones necesarias para servir las páginas.",
          en: "Both may process the information on servers located outside the European Economic Area, relying on the transfer mechanisms the regulation provides. The site is hosted on Cloudflare and GitHub which, like any host, process the requests needed to serve the pages.",
        },
      ],
    },
    {
      id: "retention",
      tituloEs: "Cuánto se conservan",
      tituloEn: "How long they are kept",
      bloques: [
        {
          tipo: "lista",
          es: [
            "Lista de espera: hasta el lanzamiento del programa o hasta que pidas la baja, lo que ocurra antes.",
            "Contacto: el tiempo necesario para resolver tu consulta y el plazo en que pudieran derivarse responsabilidades.",
          ],
          en: [
            "Waiting list: until the software launches or until you ask to be removed, whichever comes first.",
            "Contact: as long as needed to resolve your query, plus any period in which liability could arise.",
          ],
        },
      ],
    },
    {
      id: "rights",
      tituloEs: "Tus derechos",
      tituloEn: "Your rights",
      bloques: [
        {
          tipo: "parrafo",
          es: "Puedes pedir acceso a tus datos, que se corrijan, que se borren, que se limite su uso, oponerte al tratamiento y llevártelos a otro sitio. También puedes retirar tu consentimiento en cualquier momento, sin que eso afecte a lo hecho antes.",
          en: "You can request access to your data, have it corrected or deleted, restrict its use, object to processing and take it elsewhere. You may also withdraw your consent at any time, without affecting what was done before.",
        },
        { tipo: "parrafo", es: CONTACTO_ES, en: CONTACTO_EN },
        {
          tipo: "parrafo",
          es: "Si crees que no se han atendido bien, puedes reclamar ante la Agencia Española de Protección de Datos.",
          en: "If you believe your request was not handled properly, you can lodge a complaint with the Spanish Data Protection Agency.",
        },
      ],
    },
    {
      id: "minors",
      tituloEs: "Menores",
      tituloEn: "Minors",
      bloques: [
        {
          tipo: "parrafo",
          es: "Ni la web ni el programa están dirigidos a menores de edad, y no se recogen sus datos a sabiendas.",
          en: "Neither the site nor the software is aimed at minors, and their data is not knowingly collected.",
        },
      ],
    },
    {
      id: "app",
      tituloEs: "El programa es otra cosa, y es el punto importante",
      tituloEn: "The software is a different matter, and this is the important part",
      bloques: [
        {
          tipo: "parrafo",
          es: `Todo lo anterior habla de la WEB. ${TITULAR.nombreComercial}, el programa, funciona en tu ordenador y guarda tus operaciones en un archivo local de tu propio disco. Tus datos de trading no se envían a ningún servidor, ni al nuestro ni al de nadie: no existe una cuenta en la nube donde pudieran estar.`,
          en: `Everything above is about the WEBSITE. ${TITULAR.nombreComercial}, the software, runs on your computer and stores your trades in a local file on your own disk. Your trading data is not sent to any server, ours or anyone else's: there is no cloud account where it could live.`,
        },
      ],
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════
   COOKIES
   ════════════════════════════════════════════════════════════════════ */

const cookies: DocumentoLegal = {
  slug: "cookies",
  tituloEs: "Política de cookies",
  tituloEn: "Cookie policy",
  entradaEs:
    "Esta web no usa cookies. Lo que hace es recordar algunas preferencias tuyas en el propio navegador, y aquí está la lista completa de lo que guarda.",
  entradaEn:
    "This site does not use cookies. What it does is remember a few of your preferences in the browser itself, and here is the full list of what it stores.",
  descripcionEs:
    "La web de CountPips no usa cookies. Lista completa de lo que guarda en tu navegador y cómo borrarlo.",
  descripcionEn:
    "The CountPips site uses no cookies. Full list of what it stores in your browser and how to delete it.",
  secciones: [
    {
      id: "no-cookies",
      tituloEs: "No hay cookies",
      tituloEn: "There are no cookies",
      bloques: [
        {
          tipo: "parrafo",
          es: "Una cookie es un dato que tu navegador envía de vuelta al servidor en cada petición, y por eso sirve para seguirte. Esta web no crea ninguna. Lo que usa es almacenamiento local: información que se queda en tu navegador y que NUNCA sale de él, porque nadie la pide.",
          en: "A cookie is a piece of data your browser sends back to the server on every request, which is what makes it useful for following you around. This site creates none. What it uses is local storage: information that stays in your browser and NEVER leaves it, because nobody asks for it.",
        },
        {
          tipo: "parrafo",
          es: "La diferencia importa: nada de lo que hay en esa lista viaja por la red, así que no puede usarse para reconocerte en otra web ni para construir un perfil.",
          en: "The difference matters: nothing on that list travels over the network, so it cannot be used to recognise you on another site or to build a profile.",
        },
      ],
    },
    {
      id: "stored",
      tituloEs: "Todo lo que se guarda, sin excepción",
      tituloEn: "Everything that is stored, without exception",
      bloques: [
        {
          tipo: "tabla",
          cabecerasEs: ["Qué guarda", "Para qué", "Cuánto dura"],
          cabecerasEn: ["What it stores", "What for", "How long"],
          filas: [
            {
              es: ["Tu elección en este aviso", "No volver a preguntarte", "Hasta que borres los datos del navegador"],
              en: ["Your choice in this notice", "So we do not ask you again", "Until you clear your browser data"],
            },
            {
              es: ["Tema claro u oscuro", "Abrir la web como la dejaste", "Hasta que borres los datos del navegador"],
              en: ["Light or dark theme", "To open the site as you left it", "Until you clear your browser data"],
            },
            {
              es: ["Estilo visual", "Lo mismo, para la paleta", "Hasta que borres los datos del navegador"],
              en: ["Visual style", "The same, for the palette", "Until you clear your browser data"],
            },
            {
              es: ["Tus respuestas del test de disciplina", "No perder quince preguntas si recargas", "Hasta que borres los datos del navegador"],
              en: ["Your discipline test answers", "So you do not lose fifteen questions on reload", "Until you clear your browser data"],
            },
            {
              es: ["Las operaciones que crees en la demo", "Que la demo se comporte como un programa de verdad", "Hasta que borres los datos del navegador"],
              en: ["Trades you create in the demo", "So the demo behaves like real software", "Until you clear your browser data"],
            },
            {
              es: ["Los términos que consultas en el glosario", "Ofrecerte los últimos al volver a abrirlo", "Hasta que borres los datos del navegador"],
              en: ["Glossary terms you look up", "To offer you the latest ones when you reopen it", "Until you clear your browser data"],
            },
            {
              es: ["Si ya viste la animación de entrada", "No repetírtela en la misma visita", "Hasta que cierres la pestaña"],
              en: ["Whether you have seen the intro animation", "So it is not repeated in the same visit", "Until you close the tab"],
            },
          ],
        },
        {
          tipo: "parrafo",
          es: "Ninguna de las siete sirve para rastrear, medir audiencias ni mostrar publicidad. Todas son preferencias tuyas o comodidades de uso.",
          en: "None of the seven is used for tracking, audience measurement or advertising. All of them are your own preferences or usability conveniences.",
        },
      ],
    },
    {
      id: "why-banner",
      tituloEs: "Entonces, ¿por qué sale el aviso?",
      tituloEn: "So why does the notice appear?",
      bloques: [
        {
          tipo: "parrafo",
          es: "Porque preferimos preguntar aunque no haga falta. Si rechazas, la web funciona exactamente igual: no hay nada que desactivar, porque no se cargaba nada. Lo único que cambia es que recordamos tu respuesta para no volver a interrumpirte.",
          en: "Because we would rather ask even when it is not required. If you decline, the site works exactly the same: there is nothing to switch off, because nothing was loaded. The only change is that we remember your answer so we do not interrupt you again.",
        },
      ],
    },
    {
      id: "delete",
      tituloEs: "Cómo borrarlo",
      tituloEn: "How to delete it",
      bloques: [
        {
          tipo: "parrafo",
          es: "Desde los ajustes de tu navegador, borrando los datos de sitios web. También basta con navegar en una ventana privada: al cerrarla no queda nada.",
          en: "From your browser settings, by clearing site data. Browsing in a private window also works: nothing is left when you close it.",
        },
      ],
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════
   TÉRMINOS
   ════════════════════════════════════════════════════════════════════ */

const terminos: DocumentoLegal = {
  slug: "terminos",
  tituloEs: "Términos de uso",
  tituloEn: "Terms of use",
  entradaEs:
    "Condiciones de uso de esta web y de las herramientas que ofrece. El programa, cuando esté a la venta, tendrá además su propia licencia.",
  entradaEn:
    "Conditions for using this site and the tools it offers. The software, once on sale, will also have its own licence.",
  descripcionEs:
    "Condiciones de uso de la web de CountPips, sus calculadoras y su demo. Incluye el aviso de que nada de esto es asesoramiento financiero.",
  descripcionEn:
    "Conditions for using the CountPips site, its calculators and its demo. Includes notice that none of it is financial advice.",
  secciones: [
    {
      id: "scope",
      tituloEs: "Qué cubre esto",
      tituloEn: "What this covers",
      bloques: [
        {
          tipo: "parrafo",
          es: "Estas condiciones se aplican a la navegación por esta web y al uso de lo que ofrece: la demostración interactiva, las calculadoras, el test de disciplina y el glosario. Navegar por ella supone aceptarlas.",
          en: "These conditions apply to browsing this site and using what it offers: the interactive demo, the calculators, the discipline test and the glossary. Browsing it means accepting them.",
        },
      ],
    },
    {
      id: "no-advice",
      tituloEs: "Esto no es asesoramiento financiero",
      tituloEn: "This is not financial advice",
      bloques: [
        {
          tipo: "parrafo",
          es: "Es la cláusula más importante de esta página, así que va sin rodeos: nada de lo que hay en esta web es una recomendación de inversión, ni asesoramiento financiero, ni una invitación a operar.",
          en: "This is the most important clause on this page, so here it is without hedging: nothing on this site is an investment recommendation, financial advice, or an invitation to trade.",
        },
        {
          tipo: "lista",
          es: [
            "Las calculadoras son herramientas de cálculo. Devuelven lo que se deduce de los números que tú introduces, y nada más.",
            "El test de disciplina es una autoevaluación orientativa, no un diagnóstico.",
            "Los datos de operaciones que aparecen en la demostración y en los gráficos son de muestra, generados para ilustrar el programa. No corresponden a ninguna operativa real ni a ningún resultado obtenido por nadie.",
            "Ningún resultado pasado, real o de muestra, anticipa resultados futuros.",
          ],
          en: [
            "The calculators are calculation tools. They return what follows from the numbers you enter, and nothing more.",
            "The discipline test is an indicative self-assessment, not a diagnosis.",
            "The trade data shown in the demo and the charts is sample data, generated to illustrate the software. It does not correspond to any real trading or to any result obtained by anyone.",
            "No past result, real or sampled, anticipates future results.",
          ],
        },
        {
          tipo: "parrafo",
          es: "Operar en los mercados financieros conlleva riesgo de pérdida, que puede llegar a la totalidad del capital invertido. Las decisiones que tomes son tuyas y de tu exclusiva responsabilidad.",
          en: "Trading financial markets carries a risk of loss, which may extend to all the capital invested. The decisions you make are yours and your sole responsibility.",
        },
      ],
    },
    {
      id: "availability",
      tituloEs: "El producto todavía no está a la venta",
      tituloEn: "The product is not on sale yet",
      bloques: [
        {
          tipo: "parrafo",
          es: "Los precios y las características que se muestran son informativos y describen lo previsto para el lanzamiento. Pueden cambiar antes de que se abra la venta. Apuntarte a la lista de espera no es una compra, no genera ningún cargo y no te obliga a nada.",
          en: "The prices and features shown are informational and describe what is planned for launch. They may change before sales open. Joining the waiting list is not a purchase, creates no charge and commits you to nothing.",
        },
        {
          tipo: "parrafo",
          es: "Cuando se abra la venta, las condiciones de compra, licencia y devolución se publicarán en su propio documento y prevalecerán sobre lo dicho aquí.",
          en: "When sales open, the purchase, licence and refund conditions will be published in their own document and will prevail over anything stated here.",
        },
      ],
    },
    {
      id: "acceptable-use",
      tituloEs: "Uso razonable",
      tituloEn: "Reasonable use",
      bloques: [
        {
          tipo: "lista",
          es: [
            "No intentes alterar el funcionamiento de la web ni acceder a partes que no son públicas.",
            "No uses los formularios para enviar contenido ilícito, publicidad no solicitada o datos de terceros sin su permiso.",
            "No reproduzcas el contenido del sitio de forma masiva ni automatizada.",
          ],
          en: [
            "Do not attempt to interfere with how the site works or access parts that are not public.",
            "Do not use the forms to send unlawful content, unsolicited advertising or third-party data without their permission.",
            "Do not reproduce the site's content in bulk or by automated means.",
          ],
        },
      ],
    },
    {
      id: "ip",
      tituloEs: "Propiedad intelectual",
      tituloEn: "Intellectual property",
      bloques: [
        {
          tipo: "parrafo",
          es: `Los textos, el diseño, los gráficos, el logotipo y el nombre ${TITULAR.nombreComercial} pertenecen a su titular. Puedes citar y enlazar el contenido indicando la procedencia; no puedes reproducirlo íntegramente ni presentarlo como propio.`,
          en: `The texts, design, graphics, logo and the name ${TITULAR.nombreComercial} belong to their owner. You may quote and link to the content citing the source; you may not reproduce it in full or present it as your own.`,
        },
        {
          tipo: "parrafo",
          es: "Las marcas de terceros que aparecen en el sitio pertenecen a sus respectivos dueños y se citan únicamente para identificarlos.",
          en: "Third-party trademarks appearing on the site belong to their respective owners and are cited solely to identify them.",
        },
      ],
    },
    {
      id: "liability",
      tituloEs: "Responsabilidad",
      tituloEn: "Liability",
      bloques: [
        {
          tipo: "parrafo",
          es: "La web se ofrece tal cual. Se pone cuidado en que lo publicado sea correcto y esté al día, pero no se garantiza que esté libre de errores ni que funcione sin interrupciones. No se asume responsabilidad por las decisiones que tomes a partir de lo que leas o calcules aquí.",
          en: "The site is provided as is. Care is taken to keep what is published correct and current, but it is not warranted to be free of errors or to run without interruption. No responsibility is accepted for decisions you make based on what you read or calculate here.",
        },
        {
          tipo: "parrafo",
          es: "Los enlaces a sitios de terceros se ofrecen por comodidad; su contenido no está bajo nuestro control.",
          en: "Links to third-party sites are offered for convenience; their content is not under our control.",
        },
      ],
    },
    {
      id: "law",
      tituloEs: "Ley aplicable",
      tituloEn: "Governing law",
      bloques: [
        {
          tipo: "parrafo",
          es: `Estas condiciones se rigen por la legislación de ${TITULAR.jurisdiccion}. Si eres consumidor, conservas los derechos que te reconozca la normativa de tu lugar de residencia.`,
          en: `These conditions are governed by the laws of ${TITULAR.jurisdiccion}. If you are a consumer, you keep the rights granted to you by the rules of your place of residence.`,
        },
      ],
    },
  ],
};

/* ════════════════════════════════════════════════════════════════════
   AVISO LEGAL
   ════════════════════════════════════════════════════════════════════ */

const avisoLegal: DocumentoLegal = {
  slug: "aviso-legal",
  tituloEs: "Aviso legal",
  tituloEn: "Legal notice",
  entradaEs:
    "Quién está detrás de este sitio y en qué condiciones se ofrece.",
  entradaEn: "Who is behind this site and on what terms it is offered.",
  descripcionEs:
    "Identificación del responsable de la web de CountPips y condiciones generales de acceso.",
  descripcionEn:
    "Identification of the party responsible for the CountPips site and general conditions of access.",
  secciones: [
    {
      id: "owner",
      tituloEs: "Titular del sitio",
      tituloEn: "Site owner",
      bloques: [
        {
          tipo: "parrafo",
          es: `Este sitio presenta ${TITULAR.nombreComercial}, un programa de escritorio para llevar un diario de operaciones de trading.`,
          en: `This site presents ${TITULAR.nombreComercial}, a desktop application for keeping a trading journal.`,
        },
      ],
    },
    {
      id: "purpose",
      tituloEs: "Objeto",
      tituloEn: "Purpose",
      bloques: [
        {
          tipo: "parrafo",
          es: "La finalidad de esta web es dar a conocer el producto, permitir probarlo mediante una demostración y recoger las inscripciones de quien quiera que se le avise en el lanzamiento. Hoy no se realiza ninguna venta a través de ella.",
          en: "The purpose of this site is to introduce the product, let you try it through a demo, and collect sign-ups from anyone who wants to be told when it launches. No sales take place through it today.",
        },
      ],
    },
    {
      id: "access",
      tituloEs: "Condiciones de acceso",
      tituloEn: "Conditions of access",
      bloques: [
        {
          tipo: "parrafo",
          es: "El acceso es libre y gratuito. Algunas funciones —la lista de espera y el formulario de contacto— requieren que facilites datos, y en ese caso se aplica la política de privacidad.",
          en: "Access is free and open. Some features — the waiting list and the contact form — require you to provide data, in which case the privacy policy applies.",
        },
      ],
    },
    {
      id: "content",
      tituloEs: "Sobre el contenido",
      tituloEn: "About the content",
      bloques: [
        {
          tipo: "parrafo",
          es: "El contenido tiene carácter informativo y divulgativo. No constituye asesoramiento financiero ni recomendación de inversión; los términos de uso lo desarrollan.",
          en: "The content is informational and educational. It is not financial advice or an investment recommendation; the terms of use expand on this.",
        },
      ],
    },
    {
      id: "jurisdiction",
      tituloEs: "Legislación y jurisdicción",
      tituloEn: "Legislation and jurisdiction",
      bloques: [
        {
          tipo: "parrafo",
          es: `Se aplica la legislación de ${TITULAR.jurisdiccion}. Para cualquier controversia serán competentes los juzgados que correspondan conforme a la normativa vigente, respetando el fuero que la ley reconozca a los consumidores.`,
          en: `The laws of ${TITULAR.jurisdiccion} apply. Any dispute will be heard by the courts designated under the applicable rules, respecting the venue the law grants to consumers.`,
        },
      ],
    },
  ],
};

export const DOCUMENTOS_LEGALES: DocumentoLegal[] = [
  privacidad,
  cookies,
  terminos,
  avisoLegal,
];

export function documentoPorSlug(slug: string): DocumentoLegal | undefined {
  return DOCUMENTOS_LEGALES.find((d) => d.slug === slug);
}

export { LEGAL_ACTUALIZADO };
