# Cómo se publica esta web

La web se publica en **dos sitios a la vez**, a propósito y de forma temporal:

| Dónde | Dirección | Para qué |
|---|---|---|
| **Cloudflare Pages** | `https://countpips.com` | El sitio de verdad |
| GitHub Pages | `https://mmortexx.github.io/JournalTradingWeb` | Copia antigua, mientras se comprueba la nueva |

Los dos se compilan del mismo código. La diferencia es **desde dónde cuelgan las
páginas**: Cloudflare las sirve en la raíz del dominio y GitHub desde un
subdirectorio. Por eso existe la variable `NEXT_PUBLIC_BASE_PATH`, que solo
declara el flujo de GitHub Actions. Sin ella el sitio se compila para la raíz,
que es lo que necesitan tanto Cloudflare como el desarrollo local.

**La dirección canónica es siempre `countpips.com`**, se publique donde se
publique. Es deliberado: para un buscador, el mismo contenido en dos
direcciones es contenido duplicado y reparte entre las dos lo que debería ir a
una. Con la canónica fija, la copia de GitHub sigue accesible para quien tenga
el enlace, pero le dice a Google cuál es la buena.

---

## Configurar Cloudflare Pages (una sola vez)

En el panel de Cloudflare → **Workers & Pages** → *Create* → *Pages* → conectar
con el repositorio de GitHub. Cuando pida la configuración de compilación:

| Campo | Valor |
|---|---|
| Framework preset | *None* |
| Build command | `bun run build` |
| Build output directory | `out` |
| Root directory | *(vacío)* |

**No** definas `NEXT_PUBLIC_BASE_PATH` aquí. Esa variable es exclusiva de
GitHub Pages; si la añades, Cloudflare compilará el sitio esperando un
subdirectorio que no existe y **todos los enlaces y recursos darán 404**.

Las que sí hay que añadir, en *Settings → Environment variables*, son las
mismas dos que ya usa GitHub Actions:

- `NEXT_PUBLIC_WEB3FORMS_KEY` — destino de los formularios de contacto.
- `NEXT_PUBLIC_WAITLIST_URL` — script que recoge las altas de la lista.

Si faltan, el sitio se publica igual pero los formularios avisan del fallo en
vez de fingir que han enviado.

## Apuntar el dominio

Con `countpips.com` ya comprado: Cloudflare Pages → el proyecto → *Custom
domains* → añadir `countpips.com`. Si el dominio está registrado fuera de
Cloudflare, hay que cambiar sus servidores de nombres a los que Cloudflare
indique; tarda unas horas en propagarse. El certificado HTTPS lo emite
Cloudflare solo, no hay que hacer nada.

## Cabeceras

`public/_headers` lleva las cabeceras de seguridad y de caché. Lo lee
Cloudflare; GitHub Pages lo ignora porque no permite configurarlas — así que
ese fichero no puede romper la publicación antigua. Es una de las cosas que se
ganan con este cambio.

---

## Cuando toque apagar GitHub Pages

Dos pasos, y ninguno toca la configuración del proyecto:

1. Borrar la línea `NEXT_PUBLIC_BASE_PATH: /JournalTradingWeb` de
   `.github/workflows/deploy.yml`.
2. Desactivar Pages en el repositorio (*Settings → Pages → Source: None*).

Aviso: GitHub Pages **no sabe hacer redirecciones reales**. Quien tenga
guardado un enlace antiguo se encontrará una página caída, no un salto al
dominio nuevo. Por eso conviene dejarla encendida hasta que el dominio lleve un
tiempo funcionando y esté indexado.

## Comprobar un cambio antes de publicarlo

```bash
bun run build      # compila para la raíz, igual que Cloudflare
npx serve out      # y se abre en http://localhost:3000
```

Para reproducir la compilación de GitHub Pages hay que definir la variable, y
en Windows conviene hacerlo desde PowerShell: Git Bash convierte
`/JournalTradingWeb` en una ruta de disco y el build falla con un error que
despista (`basePath has to start with a /`).

```powershell
$env:NEXT_PUBLIC_BASE_PATH = "/JournalTradingWeb"; bun run build
```
