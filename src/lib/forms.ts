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

/**
 * URL del script de Google que guarda las altas en la hoja de cálculo
 * (la que devuelve Apps Script al implementar; termina en /exec). El
 * script vive en docs/waitlist-apps-script.js, con sus instrucciones.
 *
 * Es pública por el mismo motivo que la clave de Web3Forms: viaja en el
 * cliente porque el navegador tiene que llamarla. Sólo permite añadir
 * filas, nunca leer la hoja.
 */
const WAITLIST_URL = (process.env.NEXT_PUBLIC_WAITLIST_URL ?? "").trim();

/** `false` mientras no se haya configurado la URL de la lista. */
export const waitlistConfigured = WAITLIST_URL.length > 0;

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
 * POST de JSON con timeout, compartido por los dos envíos.
 *
 * Devuelve `null` cuando la petición ni siquiera llegó a completarse (red
 * caída, CORS, timeout); en ese caso el llamante reporta "network". Si hubo
 * respuesta, entrega el status y el cuerpo ya parseado para que cada
 * servicio aplique su propio criterio de éxito.
 */
async function postJson(
  url: string,
  payload: unknown,
  /**
   * `text/plain` convierte la petición en "simple" para el navegador: no
   * hay comprobación previa (OPTIONS) y la respuesta se puede leer. Es
   * obligatorio para Google Apps Script, que no sabe responder a esa
   * comprobación. El cuerpo sigue siendo JSON en ambos casos.
   */
  contentType: "application/json" | "text/plain;charset=utf-8" = "application/json"
): Promise<{ status: number; ok: boolean; data: unknown } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": contentType, Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data };
  } catch {
    // AbortError, TypeError de red, CORS bloqueado por una extensión…
    return null;
  } finally {
    clearTimeout(timer);
  }
}

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

  const res = await postJson(ENDPOINT, {
    access_key: ACCESS_KEY,
    botcheck,
    // Remitente visible en el email; cae al nombre del sitio si el
    // formulario no pide nombre.
    from_name: rest.name?.trim() || "Trading Journal Web",
    ...rest,
  });

  if (!res) return { ok: false, reason: "network" };

  // Web3Forms devuelve 200 con `success: false` en algunos rechazos, así
  // que no basta con mirar el status HTTP.
  const data = res.data as { success?: boolean } | null;
  if (!res.ok || !data?.success) return { ok: false, reason: "rejected" };

  return { ok: true };
}

export type WaitlistResult =
  | { ok: true; priority: number | null; duplicate: boolean }
  | { ok: false; reason: SubmitFailure };

/**
 * Da de alta un email en la lista de espera y devuelve su puesto en la cola.
 *
 * `priority` es el número de fila en la hoja. Puede volver `null` si la
 * respuesta no lo trae: en ese caso el alta ES válida y la interfaz
 * simplemente no enseña el puesto, en vez de inventarse uno.
 *
 * `duplicate` indica que ese email ya estaba apuntado. No es un error —
 * el resultado deseado (estar en la lista) se cumple igual —, pero
 * permite darle un mensaje distinto a quien se apunta dos veces.
 *
 * Misma regla que `submitForm`: nunca `ok: true` si el alta no se registró.
 */
export async function joinWaitlist(
  email: string,
  opts: { lang?: string; botcheck?: string } = {}
): Promise<WaitlistResult> {
  if (!waitlistConfigured) {
    return { ok: false, reason: "unconfigured" };
  }

  const res = await postJson(
    WAITLIST_URL,
    {
      email: email.trim(),
      lang: opts.lang ?? "",
      botcheck: opts.botcheck ?? "",
      // Desde qué página se apuntó, para saber qué sección convierte.
      source: typeof window === "undefined" ? "" : window.location.pathname,
    },
    "text/plain;charset=utf-8"
  );

  if (!res) return { ok: false, reason: "network" };
  if (!res.ok) return { ok: false, reason: "rejected" };

  // El script responde `{ ok, position, duplicate }`. Un `ok: false` ahí
  // significa que llegó pero no guardó (email inválido, error de la hoja).
  const data = res.data as { ok?: boolean; position?: number; duplicate?: boolean } | null;
  if (!data?.ok) return { ok: false, reason: "rejected" };

  const priority =
    typeof data.position === "number" && Number.isFinite(data.position)
      ? data.position
      : null;

  return { ok: true, priority, duplicate: data.duplicate === true };
}
