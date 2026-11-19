"""Надпись OHANA в стиле «тропический стикер»: каждая буква своего розового оттенка
с узором (блёстки, гибискус, леопард), тёмная обводка, белая кайма и тень.
python3 make_ohana.py out.png [высота_букв_px]"""
import sys, random, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
from pathlib import Path

OUT = sys.argv[1]; H = int(sys.argv[2]) if len(sys.argv) > 2 else 200
FONT = str(Path(__file__).with_name("fonts") / "LilitaOne-Regular.ttf")
random.seed(7)
font = ImageFont.truetype(FONT, int(H * 1.32))
WORD = "OHANA"
STYLES = [  # (основной цвет, второй цвет, узор)
    ((150, 16, 104), (235, 90, 175), "rings"),
    ((246, 160, 205), (255, 230, 245), "glitter"),
    ((232, 60, 150), (255, 190, 225), "hibiscus"),
    ((245, 120, 185), (190, 40, 120), "leopard"),
    ((240, 95, 170), (255, 175, 215), "stripes"),
]

def letter_fill(size, base, accent, kind):
    w, h = size
    im = Image.new("RGBA", size, base + (255,))
    d = ImageDraw.Draw(im)
    # вертикальный градиент-блик
    for y in range(h):
        k = 0.22 * (1 - y / h)
        d.line([(0, y), (w, y)], fill=tuple(int(c + (255 - c) * k) for c in base) + (255,))
    if kind == "glitter":
        for _ in range(w * h // 60):
            x, y = random.randrange(w), random.randrange(h); r = random.choice([1, 1, 2])
            d.ellipse([x - r, y - r, x + r, y + r], fill=accent + (random.randint(120, 255),))
    elif kind == "hibiscus":
        for _ in range(7):
            cx, cy, R = random.randrange(w), random.randrange(h), random.randint(h // 9, h // 6)
            for i in range(5):
                a = i * 2 * math.pi / 5
                px, py = cx + R * 0.6 * math.cos(a), cy + R * 0.6 * math.sin(a)
                d.ellipse([px - R * 0.5, py - R * 0.5, px + R * 0.5, py + R * 0.5], fill=accent + (230,))
            d.ellipse([cx - R * .18, cy - R * .18, cx + R * .18, cy + R * .18], fill=(255, 215, 90, 255))
    elif kind == "leopard":
        for _ in range(w * h // 900):
            x, y = random.randrange(w), random.randrange(h); r = random.randint(h // 40, h // 22)
            d.arc([x - r, y - r, x + r, y + r], random.randint(0, 180), random.randint(220, 360), fill=accent + (255,), width=max(2, r // 3))
    elif kind == "rings":
        for i in range(0, w + h, max(6, h // 12)):
            d.ellipse([w * .5 - i, h * .55 - i, w * .5 + i, h * .55 + i], outline=accent + (110,), width=max(2, h // 60))
    elif kind == "stripes":
        for x in range(-h, w, max(8, h // 8)):
            d.line([(x, h), (x + h, 0)], fill=accent + (150,), width=max(3, h // 30))
    return im

# раскладка букв с лёгким наклоном и перекрытием
glyphs = []
for ch, (base, acc, kind) in zip(WORD, STYLES):
    bbox = font.getbbox(ch)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = H // 6
    mask = Image.new("L", (w + 2 * pad, h + 2 * pad), 0)
    ImageDraw.Draw(mask).text((pad - bbox[0], pad - bbox[1]), ch, font=font, fill=255)
    fill = letter_fill(mask.size, base, acc, kind)
    outl = mask.filter(ImageFilter.MaxFilter((H // 22) * 2 + 1))
    g = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    dark = Image.new("RGBA", mask.size, (45, 8, 40, 255)); g.paste(dark, (0, 0), outl)
    g.paste(fill, (0, 0), mask)
    # блик сверху
    hl = Image.new("L", mask.size, 0); ImageDraw.Draw(hl).rectangle([0, 0, mask.size[0], pad + h * 0.18], fill=70)
    g.paste(Image.new("RGBA", mask.size, (255, 255, 255, 255)), (0, 0), ImageChops.multiply(hl, mask.filter(ImageFilter.MinFilter(9))))
    glyphs.append(g.rotate(random.uniform(-6, 6), resample=Image.BICUBIC, expand=True))

overlap = H // 3 + H // 14
W = sum(g.width for g in glyphs) - overlap * (len(glyphs) - 1)
Ht = max(g.height for g in glyphs) + H // 6
word = Image.new("RGBA", (W, Ht), (0, 0, 0, 0)); x = 0
for i, g in enumerate(glyphs):
    y = (Ht - g.height) // 2 + (H // 20 if i % 2 else -H // 20)
    word.alpha_composite(g, (x, max(0, y))); x += g.width - overlap

# белая кайма + тень
b = H // 11; m = b * 3
canvas = Image.new("RGBA", (W + 2 * m, Ht + 2 * m), (0, 0, 0, 0))
a = Image.new("L", canvas.size, 0); a.paste(word.getchannel("A"), (m, m))
border = a.filter(ImageFilter.MaxFilter(2 * b + 1)).filter(ImageFilter.GaussianBlur(1.5)).point(lambda v: 255 if v > 90 else v * 2)
shadow = border.filter(ImageFilter.GaussianBlur(b)).point(lambda v: int(v * .4))
out = Image.new("RGBA", canvas.size, (0, 0, 0, 0)); out.putalpha(ImageChops.offset(shadow, b // 2, b))
wh = Image.new("RGBA", canvas.size, (255, 255, 255, 0)); wh.putalpha(border)
out = Image.alpha_composite(out, wh); out.alpha_composite(word, (m, m))
out = out.crop(out.getchannel("A").getbbox())
out.save(OUT); print(OUT, out.size)
