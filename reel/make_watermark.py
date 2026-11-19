"""Логотип на белом фоне -> белый полупрозрачный водяной знак PNG.
python3 make_watermark.py logo.jpg out.png ширина непрозрачность(0-1)"""
import sys
from PIL import Image, ImageFilter, ImageChops
src, out, width, op = sys.argv[1], sys.argv[2], int(sys.argv[3]), float(sys.argv[4])
g = Image.open(src).convert("L")
a = ImageChops.invert(g).point(lambda v: 0 if v < 18 else min(255, int((v - 18) * 1.6)))
im = Image.new("RGBA", g.size, (255, 255, 255, 0)); im.putalpha(a)
im = im.crop(a.getbbox())
im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
alpha = im.getchannel("A")
# лёгкая тёмная подложка-тень, чтобы знак читался и на светлом фоне
sh = alpha.filter(ImageFilter.GaussianBlur(3)).point(lambda v: int(v * 0.35))
pad = 8
c = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
s = Image.new("RGBA", c.size, (0, 0, 0, 0)); s.putalpha(Image.new("L", c.size, 0)); s.getchannel("A")
sl = Image.new("L", c.size, 0); sl.paste(sh, (pad + 1, pad + 2)); s.putalpha(sl)
c = Image.alpha_composite(c, s); c.alpha_composite(im, (pad, pad))
c.putalpha(c.getchannel("A").point(lambda v: int(v * op)))
c.save(out); print(out, c.size)
