#!/usr/bin/env python3
"""
Genera `public/og.png` — la tarjeta que se ve al compartir el enlace.

QUÉ ENSEÑA
Una captura real de la aplicación asomando desde la derecha, y sobre ella
un panel de cristal esmerilado con la marca y el titular. El cristal no es
un rectángulo translúcido pintado a mano: se toma lo que hay debajo, se
desenfoca de verdad y se tiñe — por eso la interfaz de la app se adivina
difuminada al otro lado del panel, igual que un `backdrop-filter` en el
navegador.

POR QUÉ ESTE SCRIPT Y NO UN SVG
Antes la tarjeta vivía en `public/og.svg` y se rasterizaba con sharp. Eso
fallaba por dos motivos, y los dos se veían en la miniatura publicada:

 1. TIPOGRAFÍA. El SVG pedía 'Segoe UI Variable'. El rasterizador no la
    tiene, así que caía a la Arial genérica del sistema — la tarjeta no
    salía en la tipografía de la marca (Instrument Sans) sino en la
    fuente por defecto, con el aspecto barato que eso implica.

 2. DESINCRONIZACIÓN. El PNG se generaba a mano y se olvidaba. El SVG se
    actualizó al rediseño y el PNG se quedó en la versión anterior: lo
    que veía la gente al compartir no era lo que decía el repositorio.

Un SVG tampoco puede desenfocar lo que tiene detrás, así que el cristal
sería un tinte plano. Aquí la tarjeta se compone pixel a pixel con las
fuentes reales de la marca y con el logotipo real de la app, y el PNG es
la ÚNICA fuente de verdad. Un solo comando lo regenera:

    python scripts/generate-og.py

Las fuentes se descargan de Google Fonts la primera vez y se cachean en
`scripts/.fonts/` (ignorado por git). Hace falta red solo esa primera vez.

COLORES: son los tokens reales de `src/app/globals.css` (tema oscuro,
paleta por defecto). El acento es champagne #C7A76B — el mismo del iris
del logotipo de la app. NO es verde: globals.css lo dice explícitamente.
"""

from __future__ import annotations

import sys
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT_DIR = Path(__file__).resolve().parent / ".fonts"
LOGO = ROOT / "public" / "logo.png"
# Captura de la vista Resumen. Es la que está en la paleta Oro —la que
# declara la app por defecto—, así que su acento coincide con el champagne
# de la tarjeta. Otras capturas de public/img están en Esmeralda y
# desentonarían (lo avisa el comentario largo de globals.css).
SHOT = ROOT / "public" / "img" / "app-resumen.webp"
OUT = ROOT / "public" / "og.png"

# Lienzo obligatorio de Open Graph. 1200×630 es la proporción 1.91:1 que
# piden Facebook, LinkedIn, X, Slack, Discord y WhatsApp; cualquier otra
# la recortan ellos por su cuenta y descuadran la composición.
W, H = 1200, 630
# Supermuestreo: se dibuja a 2× y se reduce con Lanczos. A 2× la captura
# de la app se coloca casi a su resolución nativa (1500 px de origen para
# 1680 px de destino), así que la interfaz llega nítida al PNG final. Con
# 3× habría que ampliarla un 64 % y el texto de la app saldría blando.
S = 2

# --- Tokens de src/app/globals.css (tema oscuro) --------------------------
BG_TOP = (21, 23, 26)  # #15171a — cerca de --surface
BG_BOT = (10, 11, 12)  # ~#0a0b0c — --bg
ACCENT = (199, 167, 107)  # #C7A76B — --accent-base (champagne)
ACCENT_HI = (214, 188, 133)  # #D6BC85 — --accent-hover
INK = (241, 242, 239)  # #f1f2ef — --ink
INK_2 = (167, 171, 172)  # #a7abac — --ink-2
INK_3 = (121, 125, 128)  # #797d80 — --ink-3

FONTS = {
    "regular": (
        "InstrumentSans-Regular.ttf",
        "https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoS"
        "xQ0GsQv8ToedPibnr-yp2JGEJOH9npSTF-Qf1.ttf",
    ),
    "medium": (
        "InstrumentSans-Medium.ttf",
        "https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoS"
        "xQ0GsQv8ToedPibnr-yp2JGEJOH9npST3-Qf1.ttf",
    ),
    "semibold": (
        "InstrumentSans-SemiBold.ttf",
        "https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoS"
        "xQ0GsQv8ToedPibnr-yp2JGEJOH9npSQb_gf1.ttf",
    ),
}


def font(weight: str, size_pt: float) -> ImageFont.FreeTypeFont:
    """Carga (descargando y cacheando si hace falta) una fuente de la marca."""
    name, url = FONTS[weight]
    path = FONT_DIR / name
    if not path.exists():
        FONT_DIR.mkdir(parents=True, exist_ok=True)
        print(f"  descargando {name}…")
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                path.write_bytes(r.read())
        except Exception as exc:  # noqa: BLE001 — el mensaje importa más que el tipo
            sys.exit(
                f"No se pudo descargar {name} ({exc}).\n"
                f"Descárgala a mano desde Google Fonts (Instrument Sans) y "
                f"déjala en {FONT_DIR}."
            )
    return ImageFont.truetype(str(path), int(round(size_pt * S)))


# --- Utilidades de dibujo -------------------------------------------------


def stamp(img: Image.Image, layer: Image.Image) -> None:
    """Pega una capa RGBA sobre el lienzo respetando su alfa.

    El lienzo es RGB a propósito: `ImageDraw.Draw(img, "RGBA")` solo
    activa la mezcla alfa cuando la imagen de destino es RGB. Sobre un
    lienzo RGBA, PIL SUSTITUYE el píxel (color y alfa) en vez de
    mezclarlo, y al convertir a RGB al final el alfa se descarta: un
    filete pedido al 9 % salía blanco puro. De ahí que todo el dibujo
    con transparencia pase por aquí o por `Draw(img, "RGBA")`.
    """
    img.paste(layer, (0, 0), layer)


def text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[float, float],
    s: str,
    f: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    tracking: float = 0.0,
    alpha: int = 255,
) -> float:
    """
    Escribe `s` con `tracking` (en unidades de diseño) letra a letra y
    devuelve la x final. Se dibuja carácter a carácter porque PIL no
    expone letter-spacing, y el titular de la web lleva -0.035em.
    `xy` es la esquina superior izquierda en unidades de diseño.
    """
    x, y = xy[0] * S, xy[1] * S
    step = tracking * S
    for ch in s:
        draw.text((x, y), ch, font=f, fill=(*fill, alpha))
        x += f.getlength(ch) + step
    return x / S


def text_width(s: str, f: ImageFont.FreeTypeFont, tracking: float = 0.0) -> float:
    """Ancho en unidades de diseño de `s` con el mismo tracking que `text`."""
    return (sum(f.getlength(c) for c in s) + tracking * S * len(s)) / S


def hairline(
    img: Image.Image, x0: float, y: float, x1: float, alpha: float
) -> None:
    """Filete de 1 px de diseño. Se dibuja como rectángulo para que al
    reducir a 1× conserve exactamente 1 px y no se difumine."""
    ImageDraw.Draw(img, "RGBA").rectangle(
        [x0 * S, y * S, x1 * S, y * S + S - 1], fill=(255, 255, 255, int(alpha * 255))
    )


def px(box: tuple[float, float, float, float]) -> list[float]:
    """Caja en unidades de diseño → píxeles del lienzo supermuestreado."""
    return [v * S for v in box]


def drop_shadow(
    img: Image.Image,
    box: tuple[float, float, float, float],
    radius: float,
    blur: float,
    alpha: int,
    dy: float,
) -> None:
    """Sombra proyectada. Es lo que despega del fondo a la ventana y al
    panel; sin ella dos superficies oscuras sobre fondo oscuro se funden
    en una mancha y la composición pierde toda la profundidad."""
    layer = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    x0, y0, x1, y1 = px(box)
    ImageDraw.Draw(layer).rounded_rectangle(
        [x0, y0 + dy * S, x1, y1 + dy * S], radius=radius * S, fill=(0, 0, 0, alpha)
    )
    stamp(img, layer.filter(ImageFilter.GaussianBlur(blur * S)))


def glass_edges(
    img: Image.Image,
    box: tuple[float, float, float, float],
    radius: float,
    border: float = 0.13,
    sheen: float = 0.10,
) -> None:
    """
    Los dos filos que hacen que una superficie se lea como cristal: el
    borde de 1 px a todo el contorno y el brillo interior que solo vive
    en el canto superior (donde la luz da de refilón). El brillo se
    apaga con una rampa vertical; si se dejara a todo el contorno
    parecería un marco, no un reflejo.
    """
    x0, y0, x1, y1 = px(box)

    edge = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    ImageDraw.Draw(edge).rounded_rectangle(
        [x0, y0, x1, y1], radius=radius * S, outline=(255, 255, 255, int(border * 255)),
        width=max(1, S // 2),
    )
    stamp(img, edge)

    hl = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    ImageDraw.Draw(hl).rounded_rectangle(
        [x0 + S, y0 + S, x1 - S, y1 - S], radius=radius * S,
        outline=(255, 255, 255, int(sheen * 255)), width=max(1, S // 2),
    )
    a = np.asarray(hl.getchannel("A"), dtype=np.float32)
    ramp = np.zeros((H * S, 1), dtype=np.float32)
    top, fade = y0, (y1 - y0) * 0.30
    ys = np.arange(H * S, dtype=np.float32)[:, None]
    ramp = np.clip(1.0 - (ys - top) / fade, 0.0, 1.0) ** 1.6
    hl.putalpha(Image.fromarray((a * ramp).astype(np.uint8)))
    stamp(img, hl)


def frost(
    img: Image.Image,
    box: tuple[float, float, float, float],
    radius: float,
    blur: float,
    tint: tuple[int, int, int],
    tint_a: float,
) -> None:
    """
    Cristal esmerilado de verdad: recorta lo que ya hay pintado debajo,
    lo desenfoca y lo tiñe. Como la ventana de la app queda parcialmente
    debajo del panel, su interfaz se adivina difuminada al otro lado —
    que es justo lo que distingue un cristal de un rectángulo gris.

    El desenfoque se hace sobre un recorte AMPLIADO y luego se recorta al
    tamaño real: si se desenfocara la caja justa, el filtro chuparía
    transparencia de fuera y los bordes saldrían lavados.
    """
    x0, y0, x1, y1 = (int(round(v)) for v in px(box))
    pad = int(blur * S * 2)
    ex0, ey0 = max(0, x0 - pad), max(0, y0 - pad)
    ex1, ey1 = min(W * S, x1 + pad), min(H * S, y1 + pad)

    region = img.crop((ex0, ey0, ex1, ey1)).filter(ImageFilter.GaussianBlur(blur * S))
    region = region.crop((x0 - ex0, y0 - ey0, x0 - ex0 + (x1 - x0), y0 - ey0 + (y1 - y0)))
    region = Image.blend(region, Image.new("RGB", region.size, tint), tint_a)

    mask = Image.new("L", (x1 - x0, y1 - y0), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, x1 - x0 - 1, y1 - y0 - 1], radius=radius * S, fill=255
    )
    img.paste(region, (x0, y0), mask)


def background() -> Image.Image:
    """Degradado vertical + halo champagne arriba a la derecha. Es el mismo
    gesto que `globals.css` usa en el fondo de la web (radial del acento
    a baja opacidad sobre grafito), no un adorno inventado."""
    h, w = H * S, W * S
    ys = np.linspace(0, 1, h)[:, None]
    base = np.zeros((h, w, 3), dtype=np.float32)
    for c in range(3):
        base[:, :, c] = BG_TOP[c] + (BG_BOT[c] - BG_TOP[c]) * ys

    gx, gy = np.meshgrid(np.linspace(0, 1, w), np.linspace(0, 1, h))
    r1 = np.sqrt(((gx - 0.80) * 1.0) ** 2 + ((gy - 0.00) * 1.7) ** 2)
    glow = np.clip(1 - r1 / 0.78, 0, 1) ** 2 * 0.16
    r2 = np.sqrt(((gx - 0.05) * 1.0) ** 2 + ((gy - 1.05) * 1.5) ** 2)
    glow2 = np.clip(1 - r2 / 0.70, 0, 1) ** 2 * 0.05
    for c in range(3):
        base[:, :, c] += (ACCENT[c] - base[:, :, c]) * glow
        base[:, :, c] += (ACCENT_HI[c] - base[:, :, c]) * glow2

    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))


# --- Piezas de la composición --------------------------------------------

# Ventana de la app: ocupa casi todo el lienzo y se sale por abajo y por
# la derecha. Sangrar en vez de encajarla entera es deliberado — una
# ventana completa y pequeña se lee como una miniatura de pega; una
# ventana enorme cortada se lee como que hay producto detrás.
#
# Empieza 40 px por encima del panel a propósito: esa franja deja ver su
# esquina redondeada, su filo y su barra de título. Sin ese canto asomando
# la captura no se lee como una ventana, sino como un fondo de pantalla.
WIN = (330.0, 88.0, 1332.0, 648.0)
WIN_R = 14.0
# Panel de cristal. Pisa 250 px de la ventana: es la superposición la que
# hace visible el efecto — a través del cristal se adivina la interfaz
# desenfocada. Un panel apoyado solo sobre el fondo sería un rectángulo
# gris con borde.
PANEL = (56.0, 128.0, 580.0, 538.0)
PANEL_R = 20.0


def app_window(img: Image.Image) -> None:
    if not SHOT.exists():
        sys.exit(f"Falta la captura {SHOT}.")

    x0, y0, x1, y1 = WIN
    w, h = int(round((x1 - x0) * S)), int(round((y1 - y0) * S))

    shot = Image.open(SHOT).convert("RGB")
    # Fuera la barra de estado inferior: pone "Compilación de desarrollo",
    # que no pinta nada en la tarjeta con la que se presenta el producto.
    shot = shot.crop((0, 0, shot.width, int(shot.height * 0.975)))
    shot = shot.resize((w, h), Image.LANCZOS)

    drop_shadow(img, WIN, WIN_R, blur=26, alpha=150, dy=18)

    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, w - 1, h - 1], radius=WIN_R * S, fill=255
    )
    img.paste(shot, (int(round(x0 * S)), int(round(y0 * S))), mask)

    # Penumbra sobre la captura: oscura del lado del panel y casi limpia
    # a la derecha. Cumple dos funciones a la vez — separa el panel del
    # fondo (si no, texto blanco sobre una interfaz llena de cifras) y
    # dirige la mirada hacia la parte de la app que sí se quiere leer.
    # Se suma una viñeta inferior para que el sangrado no corte en seco.
    gx, gy = np.meshgrid(np.linspace(0, 1, w), np.linspace(0, 1, h))
    # La penumbra de la izquierda se queda corta a propósito. Subirla
    # dejaba la zona de debajo del panel en negro plano, y entonces el
    # cristal no tenía NADA que transparentar: se leía como un rectángulo
    # opaco. Con este valor, a través del panel se adivinan las cifras en
    # verde del resumen y la curva — que es el efecto buscado.
    scrim = np.clip(1.0 - gx / 0.62, 0, 1) ** 1.5 * 0.34
    scrim += np.clip((gy - 0.72) / 0.28, 0, 1) ** 2 * 0.28
    scrim += 0.14  # velo general: la captura se sienta detrás del texto
    dark = Image.new("RGBA", (w, h), (8, 9, 10, 0))
    dark.putalpha(Image.fromarray((np.clip(scrim, 0, 1) * 255).astype(np.uint8)))
    tmp = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    tmp.paste(dark, (int(round(x0 * S)), int(round(y0 * S))), mask)
    stamp(img, tmp)

    glass_edges(img, WIN, WIN_R, border=0.16, sheen=0.18)


def panel(img: Image.Image) -> None:
    drop_shadow(img, PANEL, PANEL_R, blur=34, alpha=135, dy=18)
    # El tinte lleva el grafito CÁLIDO de la app (#12100e, no un gris
    # neutro) para que el cristal no vire a azul sobre el fondo. La
    # opacidad está calibrada: por debajo, las cifras de la app se
    # transparentan y el titular deja de leerse; por encima, el panel se
    # vuelve opaco y ya no parece cristal.
    frost(img, PANEL, PANEL_R, blur=20, tint=(18, 16, 14), tint_a=0.66)

    # Reflejo diagonal sobre la superficie. El filo superior por sí solo
    # dice "borde"; este barrido es el que dice "hay un vidrio delante".
    x0, y0, x1, y1 = (int(round(v)) for v in px(PANEL))
    w, h = x1 - x0, y1 - y0
    gx, gy = np.meshgrid(np.linspace(0, 1, w), np.linspace(0, 1, h))
    sheen = np.clip(1.0 - (gx * 0.55 + gy * 0.85), 0, 1) ** 2 * 0.075
    layer = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    layer.putalpha(Image.fromarray((sheen * 255).astype(np.uint8)))
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, w - 1, h - 1], radius=PANEL_R * S, fill=255
    )
    tmp = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    tmp.paste(layer, (x0, y0), mask)
    stamp(img, tmp)

    glass_edges(img, PANEL, PANEL_R, border=0.15, sheen=0.14)


def content(img: Image.Image) -> None:
    d = ImageDraw.Draw(img, "RGBA")
    X = PANEL[0] + 40  # 96 — margen interior del panel
    R = PANEL[2] - 40  # 540

    logo = Image.open(LOGO).convert("RGBA")
    size = int(46 * S)
    small = logo.resize((size, size), Image.LANCZOS)
    img.paste(small, (int(X * S), int(164 * S)), small)

    text(d, (X + 46 + 14, 176), "CountPips", font("semibold", 22), INK, tracking=-0.1)
    hairline(img, X, 240, R, 0.11)

    text(d, (X, 266), "LOCAL · PRIVADO · TUYO", font("semibold", 12.5), ACCENT, tracking=3.6)

    # Titular con el mismo tratamiento que el <h1> de la portada:
    # Instrument Sans 600, versalitas, tracking -0.035em, y la segunda
    # línea en acento igual que la web resalta la última palabra.
    f_h1 = font("semibold", 56)
    tr = -0.035 * 56
    text(d, (X, 298), "TU OPERATIVA,", f_h1, INK, tracking=tr)
    text(d, (X, 356), "MEDIDA.", f_h1, ACCENT, tracking=tr)

    f_lead = font("regular", 17)
    text(d, (X, 428), "Diario de trading nativo de Windows.", f_lead, INK_2, tracking=-0.05)
    text(d, (X, 452), "Tus datos, en tu máquina.", f_lead, INK_2, tracking=-0.05)

    hairline(img, X, 488, R, 0.09)
    text(d, (X, 502), "Pago único · Sin suscripciones", font("medium", 13), INK_3, tracking=0.3)


def build() -> Image.Image:
    img = background()
    app_window(img)
    panel(img)
    content(img)
    return img.resize((W, H), Image.LANCZOS)


if __name__ == "__main__":
    print("Generando la tarjeta de enlace…")
    card = build()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    card.save(OUT, "PNG", optimize=True)
    print(f"  {OUT.relative_to(ROOT)} — {card.size[0]}×{card.size[1]}, "
          f"{OUT.stat().st_size / 1024:.0f} KB")
