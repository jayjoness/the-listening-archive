#!/usr/bin/env python3
"""Extract *photographed* jacket/disc objects from approved side-by-side product shots.

Conservative by design: if the two-object layout cannot be established, skip.
Never fabricate colours, patterns, centre labels, or a substitute record.
Generated artwork is for the deployed _site copy, not source photographs.
"""
from pathlib import Path
from PIL import Image, ImageChops
import json

ROOT = Path("_site")
ASSETS = ROOT / "assets"
TOUR = [
    "tour-yours-truly-white-background-2026.jpeg",
    "tour-my-everything-white-background-2026.jpeg",
    "tour-dangerous-woman-white-background-2026.jpeg",
    "tour-sweetener-white-background-2026.jpeg",
    "tour-thank-u-next-white-background-2026.jpeg",
    "tour-positions-white-background-2026.jpeg",
    "tour-brighter-days-ahead-white-background-2026.jpeg",
]
# These are known as side-by-side product shots. Other records require
# individual review before enabling this extraction method.
APPROVED = TOUR
def foreground_box(img):
    im = img.convert("RGB")
    bg = Image.new("RGB", im.size, (255,255,255))
    difference = ImageChops.difference(im, bg).convert("L")
    mask = difference.point(lambda v: 255 if v > 28 else 0)
    return mask.getbbox()

def extract(path):
    with Image.open(path) as src:
        src = src.convert("RGBA")
        w,h = src.size
        if w < 420 or h < 200: return None
        # Avoid mixed/stacked shots; only landscape side-by-side photography.
        if not .95 <= w/h <= 3.6: return None
        gap = int(w * .025)
        left = src.crop((0,0,w//2-gap,h))
        right = src.crop((w//2+gap,0,w,h))
        a,b = foreground_box(left),foreground_box(right)
        if not a or not b: return None
        aw,ah = a[2]-a[0],a[3]-a[1]
        bw,bh = b[2]-b[0],b[3]-b[1]
        if min(aw,ah,bw,bh) < 100: return None
        if not (.78 < aw/ah < 1.22 and .78 < bw/bh < 1.22): return None
        # Both objects must have clear white margins and be similar in size.
        if not .65 < aw/bw < 1.55: return None
        if any((b[0] < 2,b[1] < 2,b[2] > right.width-2,b[3] > right.height-2)): return None
        jacket = left.crop(a)
        disc = right.crop(b)
        dw,dh=disc.size
        # Check that all four outer corners of disc's bbox are near white.
        for x,y in ((2,2),(dw-3,2),(2,dh-3),(dw-3,dh-3)):
            if max(disc.getpixel((x,y))[:3]) < 220: return None
        # A photographed circular record must reach the midpoints of its bounds.\n        # This helps reject a second square jacket or an unrelated promo tile.\n        for x,y in ((dw//2,2),(dw//2,dh-3),(2,dh//2),(dw-3,dh//2)):\n            rgb=disc.getpixel((x,y))[:3]\n            if min(rgb) > 247: return None\n        # Preserve original pixels within a circle; outside becomes transparent.
        from PIL import ImageDraw
        alpha=Image.new("L",(dw,dh),0)
        draw=ImageDraw.Draw(alpha)
        pad=max(1,int(min(dw,dh)*.009))
        draw.ellipse((pad,pad,dw-pad-1,dh-pad-1),fill=255)
        disc.putalpha(alpha)
        return jacket,disc

def main():
    generated={}
    for filename in APPROVED:
        path=ASSETS/filename
        if not path.is_file():
            print("SKIP missing:",filename)
            continue
        result=extract(path)
        if result is None:
            print("SKIP unverified layout:",filename)
            continue
        jacket,disc=result
        stem=path.stem
        jacket_name=f"assets/verified-extract-{stem}-sleeve.webp"
        disc_name=f"assets/verified-extract-{stem}-disc.png"
        jacket.save(ROOT/jacket_name,"WEBP",quality=94)
        disc.save(ROOT/disc_name,"PNG",optimize=True)
        generated["assets/"+filename]={"sleeve":jacket_name,"disc":disc_name}
        print("EXTRACT:",filename)
    # Only the deployed build receives mappings for successful extractions.
    if generated:
        js=ROOT/"app.js"
        data=json.dumps(generated,ensure_ascii=False)
        marker="  const albumFamilies = "
        contents=js.read_text(encoding="utf-8")
        inject=("  const verifiedExtracts = "+data+";\n"
                "  allRecords.forEach((record) => {\n"
                "    const key = (record.image || '').replace(/^.*\\/assets\\//, 'assets/');\n"
                "    const art = verifiedExtracts[key];\n"
                "    if (art) { record.sleeveImage = art.sleeve; record.discImage = art.disc; }\n"
                "  });\n")
        if marker not in contents: raise RuntimeError("Missing injection marker")
        js.write_text(contents.replace(marker,inject+marker,1),encoding="utf-8")
    (ROOT/"artwork-extraction-report.json").write_text(json.dumps({"generated":generated,"skipped":[f for f in APPROVED if "assets/"+f not in generated]},indent=2))
    print(f"Prepared {len(generated)} photographed pairs; no fictional discs created.")

if __name__=="__main__": main()
