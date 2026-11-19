"""Подпись-картинка: первая строка = PNG-надпись (OHANA) + текст, далее строки текста.
python3 make_caption.py out.png logo.png logo_w "хвост первой строки" "строка2" "строка3" ..."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

out, logo_p, logo_w, first, *rest = sys.argv[1:]
FS = 70; W = 1080
font = ImageFont.truetype(str(Path(__file__).with_name("fonts") / "Caveat.ttf"), FS)
logo = Image.open(logo_p); logo = logo.resize((int(logo_w), round(logo.height * int(logo_w) / logo.width)), Image.LANCZOS)
line_h = 62
H = logo.height + line_h * len(rest) + 40
txt = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(txt)
fw = d.textlength(first, font=font)
x0 = int((W - (logo.width - 4 + fw)) / 2)
cy = logo.height // 2
d.text((x0 + logo.width - 4, cy + 6), first, font=font, fill="white", anchor="lm")
y = logo.height + 4
for line in rest:
    d.text((W / 2, y + line_h / 2), line, font=font, fill="white", anchor="mm"); y += line_h
sh = Image.new("RGBA", txt.size, (0, 0, 0, 0)); sh.putalpha(txt.getchannel("A").filter(ImageFilter.GaussianBlur(4)).point(lambda v: int(v * .55)))
canvas = Image.new("RGBA", txt.size, (0, 0, 0, 0)); canvas.alpha_composite(sh, (2, 3)); canvas.alpha_composite(txt)
canvas.alpha_composite(logo, (x0, 0))
canvas.save(out); print(out, canvas.size)
