#!/usr/bin/env python3
"""Best-effort build-time recovery of missing artwork from product-page metadata.
Never overwrites supplied local artwork or substitutes a different product."""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urljoin, urlparse
from html.parser import HTMLParser
import re, sys, shutil

root = Path("jays_vinyl_recovered_site")
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
    with urlopen(req, timeout=12) as response:
        data = response.read(maxbytes + 1)
        if len(data) > maxbytes: raise ValueError("image too large")
        return data, response.headers.get("Content-Type", "")

pairs = {}
pattern = re.compile(r'image:\s*"(assets/[^"]+\.(?:png|jpe?g|webp))"[\s\S]{0,550}?source:\s*"(https://[^"]+)"', re.I)
for match in pattern.finditer(app):
    asset, source = match.groups()
    if asset not in pairs: pairs[asset] = source

allowed = ("shop.arianagrande.com","shopuk.arianagrande.com","store.sabrinacarpenter.com",
           "shopuk.sabrinacarpenter.com","shopuk.officialsiennaspiro.com",
           "store.skyenewman.com","store.warnermusic.com","www.banquetrecords.com",
           "www.recordstoreday.co.uk","recordstoreday.com","www.djkit.com")
count = 0
for asset, page in pairs.items():
    target = out / asset
    if target.exists(): continue
    if urlparse(page).hostname not in allowed: continue
    try:
        html, _ = get(page, 1200000)
        metadata = Metadata()
        metadata.feed(html.decode("utf-8", errors="replace"))
        if not metadata.images: continue
        image_url = urljoin(page, metadata.images[0])
        if urlparse(image_url).scheme != "https": continue
        img, ctype = get(image_url)
        if not ctype.startswith("image/"): continue
        # The filename extension must match the bytes format for browsers.
        if asset.lower().endswith(".png") and not img.startswith(b"\\x89PNG"): continue
        if asset.lower().endswith((".jpg",".jpeg")) and not img.startswith(b"\\xff\\xd8"): continue
        if asset.lower().endswith(".webp") and not (img[:4] == b"RIFF" and img[8:12] == b"WEBP"): continue
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(img)
        count += 1
        print("Recovered:", asset)
    except Exception as exc:
        print("Skipped:", asset, type(exc).__name__)
print(f"Recovered {count} images from original product-page metadata; existing files unchanged.")
