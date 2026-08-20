import os
from PIL import Image, ImageOps

source_images = [
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\ca7baee8-db1f-48c7-9396-1bb09e595fc8\\.user_uploaded\\media_1787221492602.jpg", "customer-001"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\ca7baee8-db1f-48c7-9396-1bb09e595fc8\\.user_uploaded\\media_1787221492703.jpg", "customer-002"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\ca7baee8-db1f-48c7-9396-1bb09e595fc8\\.user_uploaded\\media_1787221492759.jpg", "customer-003"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\ca7baee8-db1f-48c7-9396-1bb09e595fc8\\.user_uploaded\\media_1787221492804.jpg", "customer-004"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\ca7baee8-db1f-48c7-9396-1bb09e595fc8\\.user_uploaded\\media_1787221492863.jpg", "customer-005"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226353415.jpg", "customer-006"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226357541.jpg", "customer-007"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226368599.jpg", "customer-008"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226378184.jpg", "customer-009"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226381325.jpg", "customer-010"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226749660.jpg", "customer-011"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226755018.jpg", "customer-012"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226758344.jpg", "customer-013"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226762130.jpg", "customer-014"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226764705.jpg", "customer-015"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226880030.jpg", "customer-016"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226886911.jpg", "customer-017"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226890142.jpg", "customer-018"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226892952.jpg", "customer-019"),
    ("C:\\Users\\Jesse\\.gemini\\antigravity-ide\\brain\\76546312-fe6c-4e91-a0b2-5056beba2baf\\.user_uploaded\\media_1787226895444.jpg", "customer-020"),
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
