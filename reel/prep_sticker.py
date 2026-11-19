"""Делает «стикер» из картинки на белом фоне: убирает фон, добавляет белую обводку и мягкую тень.
python3 prep_sticker.py in.jpg out.png ширина [угол] [обрезать_снизу_px]"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops

src, dst, width = sys.argv[1], sys.argv[2], int(sys.argv[3])
angle = float(sys.argv[4]) if len(sys.argv) > 4 else 0
crop_bottom = int(sys.argv[5]) if len(sys.argv) > 5 else 0

im = Image.open(src).convert("RGB")
if crop_bottom:
    im = im.crop((0, 0, im.width, im.height - crop_bottom))
# фон = почти белые пиксели, связанные с краем картинки
pad = 4
big = Image.new("RGB", (im.width + 2 * pad, im.height + 2 * pad), (255, 255, 255))
big.paste(im, (pad, pad))
gray = big.convert("L")
white = gray.point(lambda v: 255 if v > 232 else 0)
ImageDraw.floodfill(white, (0, 0), 128, thresh=0)
alpha = white.point(lambda v: 0 if v == 128 else 255)
alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
rgba = big.copy(); rgba.putalpha(alpha)
rgba = rgba.crop(alpha.getbbox())

# масштаб
h = round(rgba.height * width / rgba.width)
rgba = rgba.resize((width, h), Image.LANCZOS)

# белая обводка + тень
b = max(6, width // 28)
m = b * 3
canvas = Image.new("RGBA", (width + 2 * m, h + 2 * m), (0, 0, 0, 0))
a = Image.new("L", canvas.size, 0); a.paste(rgba.getchannel("A"), (m, m))
outline = a.filter(ImageFilter.MaxFilter(2 * b + 1)).filter(ImageFilter.GaussianBlur(1.2))
outline = outline.point(lambda v: 255 if v > 90 else v * 2)
shadow = outline.filter(ImageFilter.GaussianBlur(b)).point(lambda v: int(v * 0.35))
sh = Image.new("RGBA", canvas.size, (0, 0, 0, 0)); sh.putalpha(ImageChops.offset(shadow, b // 2, b))
wh = Image.new("RGBA", canvas.size, (255, 255, 255, 0)); wh.putalpha(outline)
canvas = Image.alpha_composite(sh, wh)
layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0)); layer.paste(rgba, (m, m), rgba)
canvas = Image.alpha_composite(canvas, layer)
if angle:
    canvas = canvas.rotate(angle, resample=Image.BICUBIC, expand=True)
canvas.save(dst)
print(dst, canvas.size)
