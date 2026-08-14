import os
from PIL import Image, ImageOps

source_images = [
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\03685bdb-a707-412b-af04-3bc8d96ea1f1\\media__1786733286467.jpg", "customer-001"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\03685bdb-a707-412b-af04-3bc8d96ea1f1\\media__1786733286496.jpg", "customer-002"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\03685bdb-a707-412b-af04-3bc8d96ea1f1\\media__1786733286670.jpg", "customer-003"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\03685bdb-a707-412b-af04-3bc8d96ea1f1\\media__1786733286718.jpg", "customer-004"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\03685bdb-a707-412b-af04-3bc8d96ea1f1\\media__1786733286736.jpg", "customer-005"),
]

output_dir = "c:\\Users\\Jesse\\streetzaintsafe\\images\\community"
os.makedirs(output_dir, exist_ok=True)

for src_path, name in source_images:
    if not os.path.exists(src_path):
        print(f"Error: Source image not found: {src_path}")
        continue
    
    print(f"Processing {name} from {os.path.basename(src_path)}...")
    with Image.open(src_path) as img:
        # Correct orientation based on EXIF before stripping it
        img = ImageOps.exif_transpose(img)
        
        # Original dimensions
        orig_w, orig_h = img.size
        
        # 1. Gallery version: target 800px on long edge (or less if original is smaller)
        gallery_max = 800
        if max(orig_w, orig_h) <= gallery_max:
            gallery_img = img.copy()
        else:
            gallery_img = img.copy()
            gallery_img.thumbnail((gallery_max, gallery_max), Image.Resampling.LANCZOS)
            
        gallery_out_path = os.path.join(output_dir, f"{name}.webp")
        # Save as WebP, which naturally strips EXIF since we don't pass it
        gallery_img.save(gallery_out_path, "WEBP", quality=85)
        print(f"  Saved gallery card: {gallery_out_path} ({gallery_img.size})")
        
        # 2. Lightbox version: target 1600px on long edge (or less if original is smaller)
        lightbox_max = 1600
        if max(orig_w, orig_h) <= lightbox_max:
            lightbox_img = img.copy()
        else:
            lightbox_img = img.copy()
            lightbox_img.thumbnail((lightbox_max, lightbox_max), Image.Resampling.LANCZOS)
            
        lightbox_out_path = os.path.join(output_dir, f"{name}-large.webp")
        lightbox_img.save(lightbox_out_path, "WEBP", quality=85)
        print(f"  Saved lightbox version: {lightbox_out_path} ({lightbox_img.size})")
