/**
 * ============================================================
 *  LISTA DE ESPERA — script para Google Sheets
 * ============================================================
 *
 * Este archivo NO forma parte de la web. Es el trozo que vive en tu
 * cuenta de Google y guarda cada inscripción como una fila de una hoja
 * de cálculo tuya.
 *
 * ------------------------------------------------------------
 *  CÓMO INSTALARLO (una sola vez, ~5 minutos)
 * ------------------------------------------------------------
 *
 *  1. Entra en https://sheets.google.com y crea una hoja nueva.
 *     Ponle el nombre que quieras, por ejemplo "Lista de espera".
 *
 *  2. En el menú de la hoja: Extensiones → Apps Script.
 *     Se abre un editor con un archivo `Código.gs` que trae dentro
 *     algo como `function myFunction() {}`.
 *
 *  3. BORRA todo lo que haya en ese editor y pega TODO el contenido
 *     de este archivo en su lugar. Guarda (el icono del disquete).
 *
 *  4. Arriba a la derecha: botón azul "Implementar" → "Nueva
 *     implementación".
 *       · Pulsa el engranaje junto a "Seleccionar tipo" y elige
 *         "Aplicación web".
 *       · "Ejecutar como":        Yo (tu correo)
 *       · "Quién tiene acceso":   Cualquier usuario
 *       · Pulsa "Implementar".
 *
 *  5. Google te pedirá permiso la primera vez. Acepta. Si aparece un
 *     aviso de "Google no ha verificado esta aplicación", pulsa
 *     "Configuración avanzada" → "Ir a (nombre del proyecto)". Es tu
 *     propio script; el aviso sale porque no está publicado en su
 *     tienda.
 *
 *  6. Al terminar te da una "URL de la aplicación web", que acaba en
 *     /exec. CÓPIALA y pásamela — o guárdala tú como secret
 *     WAITLIST_URL en GitHub. Eso es lo único que necesita la web.
 *
 *  Si algún día cambias este script, hay que volver a "Implementar" →
 *  "Gestionar implementaciones" → editar → "Nueva versión", o la web
 *  seguirá hablando con la versión antigua.
 *
 * ------------------------------------------------------------
 *  QUÉ HACE
 * ------------------------------------------------------------
 *
 *  · Añade una fila por inscripción: fecha, email, idioma y de qué
 *    página venía.
 *  · Si el email YA estaba, no lo duplica: devuelve el puesto que ya
 *    tenía.
 *  · Devuelve el puesto en la cola para poder enseñárselo a quien se
 *    apunta.
 *  · Descarta lo que llegue con el campo trampa relleno (bots).
 *
 *  Sobre CORS, que es lo que suele romper esto: la web envía el cuerpo
 *  como `text/plain` a propósito. Con `application/json` el navegador
 *  manda antes una petición OPTIONS de comprobación, y Apps Script no
 *  sabe responderla — la petición se bloquearía. Con `text/plain` el
 *  navegador la considera "simple", no hay comprobación previa, y la
 *  respuesta sí se puede leer. Poder leerla es imprescindible: sin eso
 *  la web no sabría si el alta se guardó y tendría que fingir que sí.
 */

/** Nombre de la pestaña donde se escriben las altas. Se crea sola. */
var HOJA = "Inscripciones";

/** Cabeceras de la tabla. Se escriben solas la primera vez. */
var CABECERAS = ["Fecha", "Email", "Idioma", "Origen"];

function doPost(e) {
  try {
    var datos = JSON.parse(e.postData.contents);

    // Campo trampa: invisible para personas, tentador para bots.
    // Si llega con contenido, respondemos "ok" sin guardar nada — así
    // el bot no aprende que ha sido detectado.
    if (datos.botcheck) {
      return responder({ ok: true, position: null });
    }

    var email = String(datos.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return responder({ ok: false, error: "email_invalido" });
    }

    var hoja = obtenerHoja();

    // ¿Ya estaba? Devolvemos su puesto en vez de crear un duplicado.
    var columnaEmail = hoja.getRange(2, 2, Math.max(hoja.getLastRow() - 1, 1), 1)
      .getValues();
    for (var i = 0; i < columnaEmail.length; i++) {
      if (String(columnaEmail[i][0]).trim().toLowerCase() === email) {
        return responder({ ok: true, position: i + 1, duplicate: true });
      }
    }

    hoja.appendRow([
      new Date(),
      email,
      String(datos.lang || "").slice(0, 8),
      String(datos.source || "").slice(0, 200),
    ]);

    // Fila 1 son las cabeceras, así que el puesto es la fila menos una.
    return responder({ ok: true, position: hoja.getLastRow() - 1 });
  } catch (err) {
    return responder({ ok: false, error: String(err) });
  }
}

/**
 * Responder a un GET sirve para comprobar de un vistazo, abriendo la URL
 * en el navegador, que la implementación está viva.
 */
function doGet() {
  return responder({ ok: true, alive: true });
}

function obtenerHoja() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(HOJA);
  if (!hoja) {
    hoja = libro.insertSheet(HOJA);
  }
  if (hoja.getLastRow() === 0) {
    hoja.appendRow(CABECERAS);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function responder(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
