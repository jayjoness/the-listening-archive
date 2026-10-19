#!/usr/bin/env python3
"""Best-effort build-time recovery of missing artwork from product-page metadata.
Never overwrites supplied local artwork or substitutes a different product."""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urljoin, urlparse, urlunparse
from html.parser import HTMLParser
import re, sys, shutil, io, json, time
from PIL import Image

root = Path("jays_vinyl_recovered_site")
recovery_deadline = time.monotonic() + 35  # Never hold up Pages deployment for shop sites
out = Path("_site")
if out.exists():
    shutil.rmtree(out)
shutil.copytree(root, out)
app = (root / "app.js").read_text(encoding="utf-8")

class Metadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
    def handle_starttag(self, tag, attrs):
        if tag != "meta": return
        a = dict(attrs)
        if a.get("property") in ("og:image", "og:image:secure_url") or a.get("name") == "twitter:image":
            if a.get("content"): self.images.append(a["content"])

def get(url, maxbytes=9000000):
    req = Request(url, headers={"User-Agent":"Mozilla/5.0 (compatible; VinylArchiveArtwork/1.0)"})
    with urlopen(req, timeout=3) as response:
        data = response.read(maxbytes + 1)
        if len(data) > maxbytes: raise ValueError("image too large")
        return data, response.headers.get("Content-Type", "")

pairs = {}
pattern = re.compile(r'image:\s*"(assets/[^"]+\.(?:png|jpe?g|webp))"[\s\S]{0,550}?source:\s*"(https://[^"]+)"', re.I)
for match in pattern.finditer(app):
    asset, source = match.groups()
    if asset not in pairs: pairs[asset] = source

allowed = ("shop.arianagrande.com","shopuk.arianagrande.com","shopus.officialsiennaspiro.com","shop.oliviadeano.com","store.sabrinacarpenter.com",
           "shopuk.sabrinacarpenter.com","shopuk.officialsiennaspiro.com",
           "store.skyenewman.com","store.warnermusic.com","www.banquetrecords.com",
           "www.recordstoreday.co.uk","recordstoreday.com","www.djkit.com")
count = 0
for asset, page in pairs.items():
    if time.monotonic() >= recovery_deadline:
        print("Artwork recovery time budget reached; publishing existing images now.")
        break
    target = out / asset
    if target.exists(): continue
    if urlparse(page).hostname not in allowed: continue
    try:
        # Use Shopify's exact product endpoint when available, then page metadata.
        # Do not use store homepages, whose artwork is unrelated to a record.
        parsed = urlparse(page)
        if "/products/" not in parsed.path: continue
        image_url = None
        try:
            clean = urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", "", ""))
            product, _ = get(clean + ".js", 3000000)
            info = json.loads(product)
            images = info.get("images") or []
            if images:
                first = images[0]
                image_url = first.get("src") if isinstance(first, dict) else first
        except Exception:
            pass
        if not image_url:
            html, _ = get(page, 1200000)
            metadata = Metadata()
            metadata.feed(html.decode("utf-8", errors="replace"))
            if metadata.images: image_url = metadata.images[0]
        if not image_url: continue
        image_url = urljoin(page, image_url)
        if urlparse(image_url).scheme != "https": continue
        img, ctype = get(image_url)
        if not ctype.startswith("image/"): continue
        # Convert downloaded artwork to the format expected by existing HTML.
        with Image.open(io.BytesIO(img)) as original:
            image = original.convert("RGBA" if original.mode in ("RGBA", "LA", "P") else "RGB")
            target.parent.mkdir(parents=True, exist_ok=True)
            buffer = io.BytesIO()
            if asset.lower().endswith(".png"):
                image.save(buffer, format="PNG", optimize=True)
            elif asset.lower().endswith(".webp"):
                image.save(buffer, format="WEBP", quality=90)
            else:
                image.convert("RGB").save(buffer, format="JPEG", quality=90)
            target.write_bytes(buffer.getvalue())
        count += 1
        print("Recovered:", asset)
    except Exception as exc:
        print("Skipped:", asset, type(exc).__name__)
print(f"Recovered {count} images from original product-page metadata; existing files unchanged.")
