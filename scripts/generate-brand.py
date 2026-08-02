#!/usr/bin/env python3
"""
Genera los mapas de bits de la marca a partir de la MISMA geometría que
el glifo vectorial de la web (src/components/tj/BrandGlyph.tsx).

    public/logo.png        512x512  — dato estructurado de Organization
                                      (es el logotipo que toma Google) e
                                      icono de la PWA (src/app/manifest.ts)
    src/app/apple-icon.png 180x180  — icono al añadir a pantalla de inicio
    src/app/favicon.ico    16/32/48 — reserva para navegadores que no
                                      resuelven src/app/icon.svg

POR QUÉ EXISTE ESTE SCRIPT
El logotipo de la web es SVG y hereda la tinta del tema, pero hay tres
sitios donde el formato lo impone quien consume el archivo, no nosotros:
el buscador, el sistema operativo al instalar la PWA y la pestaña del
navegador. Si esos tres se quedan con el mapa de bits antiguo (el ojo de
iris rojo), la marca se parte justo donde más se ve desde fuera.

Escribir la geometría dos veces sería garantizar que se desincronicen a
la primera modificación, así que las curvas de aquí son las MISMAS
coordenadas del componente, en el mismo viewBox de 48. Si se cambia el
glifo, hay que tocar los dos sitios y volver a lanzar esto.

USO
    python scripts/generate-brand.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent

PAPER = (240, 237, 228, 255)  # #F0EDE4
INK = (26, 23, 20, 255)  # #1A1714

VIEW = 48.0
# Supermuestreo: se dibuja 4x y se reduce. PIL no antialiasa el trazo, y
# sin esto los bordes curvos salen escalonados a 32 px.
SS = 4


def bezier(p0, p1, p2, p3, steps=48):
    """Cúbica de Bézier muestreada en `steps` puntos."""
    out = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        x = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
        out.append((x, y))
    return out


def book_outline():
    """La silueta del libro abierto, en coordenadas del viewBox de 48.

    Es el mismo trazado que el `<path>` del componente:
      M24 13 C20 9.5 15.5 8 8 8 v27 c7.5 0 12 1.5 16 5
             c4 -3.5 8.5 -5 16 -5 V8 c-7.5 0 -12 1.5 -16 5 z
    """
    pts = []
    pts += bezier((24, 13), (20, 9.5), (15.5, 8), (8, 8))
    pts += [(8, 35)]
    pts += bezier((8, 35), (15.5, 35), (20, 36.5), (24, 40))
    pts += bezier((24, 40), (28, 36.5), (32.5, 35), (40, 35))
    pts += [(40, 8)]
    pts += bezier((40, 8), (32.5, 8), (28, 9.5), (24, 13))
    return pts


def render(size, radius_ratio=1 / 6, stroke_px=1.15, with_bg=True):
    """Dibuja el glifo a `size` px.

    `stroke_px` es el grosor que debe medir el trazo EN PANTALLA a ese
    tamaño — el mismo criterio de grosor óptico constante que usa el
    componente. A tamaños de favicon se sube a mano, porque por debajo
    de 32 px un trazo de 1,15 px se rompe al reducir.
    """
    s = size * SS
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    if with_bg:
        r = int(s * radius_ratio)
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=r, fill=PAPER)

    k = s / VIEW
    w = max(2, int(round(stroke_px * SS)))

    outline = [(x * k, y * k) for x, y in book_outline()]
    d.line(outline + [outline[0]], fill=INK, width=w, joint="curve")

    # Lomo
    d.line([(24 * k, 13 * k), (24 * k, 40 * k)], fill=INK, width=max(2, int(w * 0.8)))

    return img.resize((size, size), Image.LANCZOS)


def main():
    # logo.png — se usa a tamaños grandes (Google lo pide de 112 px como
    # mínimo; la PWA lo escala). Trazo proporcionalmente más fino porque
    # aquí hay píxeles de sobra.
    logo = render(512, stroke_px=13.5)
    logo.save(ROOT / "public" / "logo.png")
    print("public/logo.png                512x512")

    apple = render(180, stroke_px=5.4)
    apple.save(ROOT / "src" / "app" / "apple-icon.png")
    print("src/app/apple-icon.png        180x180")

    # favicon.ico — tres tamaños en un archivo. El trazo engorda al bajar
    # de tamaño: a 16 px, un grosor proporcional desaparecería.
    ico_sizes = [(48, 1.9), (32, 1.5), (16, 1.1)]
    frames = [render(sz, stroke_px=sw) for sz, sw in ico_sizes]
    frames[0].save(
        ROOT / "src" / "app" / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s, _ in ico_sizes],
        append_images=frames[1:],
    )
    print("src/app/favicon.ico           48/32/16")


if __name__ == "__main__":
    main()
