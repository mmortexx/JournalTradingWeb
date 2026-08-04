#!/usr/bin/env python3
"""
Genera los mapas de bits de la marca a partir de la MISMA geometría que
el logotipo vectorial (src/components/tj/BrandGlyph.tsx, variante
reducida — que a su vez sale de 02-diseno/logo/countpips-logo-small.svg
en el repositorio de la aplicación).

    public/logo.png        512x512  — dato estructurado de Organization
                                      (es el logotipo que toma Google) e
                                      icono de la PWA (src/app/manifest.ts)
    src/app/apple-icon.png 180x180  — icono al añadir a pantalla de inicio
    src/app/favicon.ico    16/32/48 — reserva para navegadores que no
                                      resuelven src/app/icon.svg

POR QUÉ EXISTE ESTE SCRIPT
El logotipo de la web es SVG, pero hay tres sitios donde el formato lo
impone quien consume el archivo, no nosotros: el buscador, el sistema
operativo al instalar la PWA y la pestaña del navegador. Si esos tres se
quedan con el mapa de bits antiguo, la marca se parte justo donde más se
ve desde fuera.

QUÉ DIBUJA, Y QUÉ DIBUJABA ANTES
El cuaderno de piel con las tres velas japonesas en la tapa: el mismo
icono que la aplicación de escritorio. Antes dibujaba un libro ABIERTO a
línea que no es el logotipo del producto — llegó ahí porque los
comentarios del código afirmaban que el archivo de la aplicación era «el
ojo de iris rojo», y no lo es.

Se dibuja la variante REDUCIDA y no la completa a propósito: estos tres
destinos se ven a 16-180 px, y a esos tamaños la sombra proyectada, el
filete de encuadernación y el rayado del canto no aportan detalle, sólo
ensucian la silueta.

USO
    python scripts/generate-brand.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent

PAPER = (240, 237, 228, 255)  # #F0EDE4 — el papel del sitio

# El logotipo se dibuja en el mismo lienzo de 512 que el SVG, así que las
# coordenadas de aquí son literalmente las del componente.
VIEW = 512.0

# Supermuestreo: se dibuja 4x y se reduce. PIL no antialiasa, y sin esto
# las esquinas redondeadas salen escalonadas.
SS = 4

# ── Paletas ───────────────────────────────────────────────────────────
# Mismas paradas que la variante reducida del componente. Cada degradado
# es (x1, y1, x2, y2, [(offset, "#rrggbb"), ...]) con las coordenadas en
# fracción de la caja de la forma, que es como se comporta un
# `linearGradient` de SVG sin `gradientUnits`.
COVER = (0.05, 0.0, 0.95, 1.0, [(0.0, "#C67E41"), (0.34, "#A85F2A"), (1.0, "#6E3512")])
SPINE = (0.0, 0.0, 1.0, 0.0, [(0.0, "#4F240B"), (0.5, "#82471C"), (1.0, "#9A5A27")])
PAGES = (0.0, 0.0, 1.0, 0.0, [(0.0, "#C6A87F"), (0.34, "#FCF4E3"), (1.0, "#A98B61")])
GOLD = (0.0, 0.0, 0.6, 1.0, [(0.0, "#FFF3DC"), (0.5, "#F5D6A4"), (1.0, "#D09E63")])
RIBBON = (0.0, 0.0, 1.0, 0.2, [(0.0, "#EFBE86"), (1.0, "#94571F")])


def hex_rgb(s):
    s = s.lstrip("#")
    return tuple(int(s[i : i + 2], 16) for i in (0, 2, 4))


def interpola(stops, t):
    """Color en la posición `t` (0-1) de una lista de paradas."""
    if t <= stops[0][0]:
        return hex_rgb(stops[0][1])
    if t >= stops[-1][0]:
        return hex_rgb(stops[-1][1])
    for (o0, c0), (o1, c1) in zip(stops, stops[1:]):
        if o0 <= t <= o1:
            f = 0.0 if o1 == o0 else (t - o0) / (o1 - o0)
            a, b = hex_rgb(c0), hex_rgb(c1)
            return tuple(round(a[i] + (b[i] - a[i]) * f) for i in range(3))
    return hex_rgb(stops[-1][1])


def pinta_degradado(lienzo, mascara, caja, grad):
    """Rellena `mascara` con un degradado lineal y lo pega en `lienzo`.

    `caja` es (x0, y0, x1, y1) en píxeles: la caja de la forma, porque un
    degradado de SVG se escala a la caja de CADA forma, no al lienzo.
    """
    x0, y0, x1, y1 = caja
    an, al = max(1, int(x1 - x0)), max(1, int(y1 - y0))
    gx1, gy1, gx2, gy2, stops = grad

    # Vector del degradado, en píxeles dentro de la caja.
    ax, ay = gx1 * an, gy1 * al
    bx, by = gx2 * an, gy2 * al
    dx, dy = bx - ax, by - ay
    largo2 = dx * dx + dy * dy or 1.0

    tira = Image.new("RGB", (an, al))
    px = tira.load()
    for j in range(al):
        for i in range(an):
            # Proyección del píxel sobre el vector del degradado.
            t = ((i - ax) * dx + (j - ay) * dy) / largo2
            px[i, j] = interpola(stops, min(1.0, max(0.0, t)))

    capa = Image.new("RGBA", lienzo.size, (0, 0, 0, 0))
    capa.paste(tira, (int(x0), int(y0)))
    lienzo.paste(capa, (0, 0), mascara)


def forma(lienzo, dibuja_en_mascara, caja, grad):
    """Dibuja una forma con relleno degradado."""
    m = Image.new("L", lienzo.size, 0)
    dibuja_en_mascara(ImageDraw.Draw(m))
    pinta_degradado(lienzo, m, caja, grad)


def q_bezier(p0, p1, p2, pasos=24):
    """Cuadrática de Bézier muestreada — las esquinas del lomo."""
    out = []
    for i in range(pasos + 1):
        t = i / pasos
        u = 1 - t
        out.append(
            (
                u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
                u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
            )
        )
    return out


def render(size, with_bg=True):
    """Dibuja el logotipo a `size` px."""
    s = size * SS
    k = s / VIEW  # factor del viewBox de 512 a píxeles reales
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))

    if with_bg:
        ImageDraw.Draw(img).rounded_rectangle(
            [0, 0, s - 1, s - 1], radius=int(s * 86 / 512), fill=PAPER
        )

    def E(*v):
        """Escala coordenadas del viewBox a píxeles."""
        return [x * k for x in v]

    def rect(x, y, w, h, r, grad):
        X, Y, W, H, R = E(x, y, w, h, r)
        caja = (X, Y, X + W, Y + H)
        forma(img, lambda d: d.rounded_rectangle([X, Y, X + W, Y + H], radius=R, fill=255), caja, grad)

    # ── Bloque de hojas ───────────────────────────────────────────────
    rect(352, 98, 56, 322, 12, PAGES)
    rect(132, 386, 272, 38, 12, PAGES)

    # ── Marcapáginas ──────────────────────────────────────────────────
    cinta = [(292, 380), (346, 380), (346, 470), (319, 446), (292, 470)]
    pts = [(x * k, y * k) for x, y in cinta]
    caja = (min(p[0] for p in pts), min(p[1] for p in pts),
            max(p[0] for p in pts), max(p[1] for p in pts))
    forma(img, lambda d: d.polygon(pts, fill=255), caja, RIBBON)

    # ── Tapa ──────────────────────────────────────────────────────────
    rect(104, 84, 264, 318, 20, COVER)

    # ── Lomo ──────────────────────────────────────────────────────────
    # M104 104 Q104 84 124 84 L162 84 L162 402 L124 402 Q104 402 104 382 Z
    lomo = [(104, 104)]
    lomo += q_bezier((104, 104), (104, 84), (124, 84))
    lomo += [(162, 84), (162, 402), (124, 402)]
    lomo += q_bezier((124, 402), (104, 402), (104, 382))
    pts = [(x * k, y * k) for x, y in lomo]
    caja = (min(p[0] for p in pts), min(p[1] for p in pts),
            max(p[0] for p in pts), max(p[1] for p in pts))
    forma(img, lambda d: d.polygon(pts, fill=255), caja, SPINE)

    # Filete claro del lomo — color plano con transparencia, no degradado.
    filete = Image.new("RGBA", img.size, (0, 0, 0, 0))
    X, Y, W, H, R = E(150, 92, 9, 302, 4.5)
    ImageDraw.Draw(filete).rounded_rectangle(
        [X, Y, X + W, Y + H], radius=R, fill=(255, 217, 168, int(255 * 0.34))
    )
    img = Image.alpha_composite(img, filete)

    # ── Velas ─────────────────────────────────────────────────────────
    # Cuerpo y mechas de las tres, en las coordenadas del componente.
    velas = [
        (192, 256, 46, 86, 10), (208, 228, 14, 28, 7), (208, 342, 14, 26, 7),
        (252, 196, 46, 102, 10), (268, 166, 14, 30, 7), (268, 298, 14, 26, 7),
        (312, 140, 46, 92, 10), (328, 112, 14, 28, 7), (328, 232, 14, 26, 7),
    ]
    # Un solo degradado para el grupo entero, como el `<g fill=...>` del
    # SVG: si cada vela llevara el suyo, las tres saldrían idénticas y se
    # perdería el barrido de luz que las recorre en diagonal.
    m = Image.new("L", img.size, 0)
    d = ImageDraw.Draw(m)
    for x, y, w, h, r in velas:
        X, Y, W, H, R = E(x, y, w, h, r)
        d.rounded_rectangle([X, Y, X + W, Y + H], radius=R, fill=255)
    xs = [E(v[0])[0] for v in velas] + [E(v[0] + v[2])[0] for v in velas]
    ys = [E(v[1])[0] for v in velas] + [E(v[1] + v[3])[0] for v in velas]
    pinta_degradado(img, m, (min(xs), min(ys), max(xs), max(ys)), GOLD)

    return img.resize((size, size), Image.LANCZOS)


def main():
    logo = render(512)
    logo.save(ROOT / "public" / "logo.png")
    print("public/logo.png                512x512")

    render(180).save(ROOT / "src" / "app" / "apple-icon.png")
    print("src/app/apple-icon.png        180x180")

    # favicon.ico — tres tamaños en un archivo.
    tam = [48, 32, 16]
    frames = [render(t) for t in tam]
    frames[0].save(
        ROOT / "src" / "app" / "favicon.ico",
        format="ICO",
        sizes=[(t, t) for t in tam],
        append_images=frames[1:],
    )
    print("src/app/favicon.ico           48/32/16")


if __name__ == "__main__":
    main()
