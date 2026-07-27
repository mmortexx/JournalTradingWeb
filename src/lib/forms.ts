/**
 * forms.ts — envío real de formularios desde un sitio estático.
 *
 * El sitio se publica con `output: "export"` en GitHub Pages, así que no hay
 * servidor propio donde recibir un POST. Los envíos van a Web3Forms, que
 * reenvía cada formulario al buzón asociado a la access key.
 *
 * Sobre la access key: en Web3Forms es pública por diseño — identifica el
 * buzón de destino, no autoriza a leer nada. Aun así se lee de
 * `NEXT_PUBLIC_WEB3FORMS_KEY` (inlineada en build) en vez de estar escrita
 * en el código, para poder rotarla sin tocar componentes.
 *
 * Regla de oro de este módulo: nunca devolver `ok: true` si el mensaje no
 * salió de verdad. Si no hay key, si la red falla o si Web3Forms rechaza el
 * envío, el llamante recibe un fallo y debe decírselo al usuario. Antes los
 * dos formularios animaban un "✓ enviado" sin mandar nada.
 */

const ENDPOINT = "https://api.web3forms.com/submit";

/** Cortamos a los 15 s: más allá, el usuario ya ha asumido que no va. */
const TIMEOUT_MS = 15_000;

/**
 * Debe escribirse como acceso literal completo a `process.env.X` para que
 * Next lo sustituya por el valor en build. Destructurarlo rompe el inlining.
 */
const ACCESS_KEY = (process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "").trim();

/**
 * `false` cuando no se ha configurado la key (p. ej. en local sin
 * `.env.local`). Los formularios lo usan para avisar en desarrollo en vez de
 * fingir un envío correcto.
 */
export const formsConfigured = ACCESS_KEY.length > 0;

/** Buzón de respaldo que se le ofrece al usuario si el envío falla. */
export const SUPPORT_EMAIL = "soporte@tradingjournal.app";

export type SubmitFailure =
  /** No hay access key en el build: es un fallo de configuración, no del usuario. */
  | "unconfigured"
  /** Sin conexión, DNS caído, CORS, bloqueador de anuncios, timeout… */
  | "network"
  /** Web3Forms respondió, pero rechazó el envío (key inválida, cuota, spam). */
  | "rejected";

export type SubmitResult = { ok: true } | { ok: false; reason: SubmitFailure };

export type FormFields = {
  /** Asunto del email que llega al buzón. */
  subject: string;
  /** Email de quien escribe; Web3Forms lo pone como reply-to. */
  email: string;
  /** Nombre de quien escribe, si el formulario lo pide. */
  name?: string;
  /** Cuerpo del mensaje, si el formulario lo pide. */
  message?: string;
  /**
   * Honeypot. Web3Forms descarta el envío si llega con contenido; los
   * humanos no lo ven, los bots lo rellenan.
   */
  botcheck?: string;
};

/**
 * Envía un formulario y responde si salió o no.
 *
 * No lanza excepciones: cualquier fallo vuelve como `{ ok: false, reason }`
 * para que el componente decida qué copy enseñar en cada idioma.
 */
export async function submitForm(fields: FormFields): Promise<SubmitResult> {
  if (!formsConfigured) {
    return { ok: false, reason: "unconfigured" };
  }

  // El honeypot se envía siempre, aunque venga vacío: Web3Forms solo aplica
  // el filtro si el campo está presente en el payload.
  const { botcheck = "", ...rest } = fields;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        botcheck,
        // Remitente visible en el email; cae al nombre del sitio si el
        // formulario no pide nombre (el boletín, por ejemplo).
        from_name: rest.name?.trim() || "Trading Journal Web",
        ...rest,
      }),
      signal: controller.signal,
    });

    // Web3Forms devuelve 200 con `success: false` en algunos rechazos, así
    // que no basta con mirar el status HTTP.
    const data = (await res.json().catch(() => null)) as { success?: boolean } | null;

    if (!res.ok || !data?.success) {
      return { ok: false, reason: "rejected" };
    }

    return { ok: true };
  } catch {
    // AbortError, TypeError de red, CORS bloqueado por una extensión…
    return { ok: false, reason: "network" };
  } finally {
    clearTimeout(timer);
  }
}
