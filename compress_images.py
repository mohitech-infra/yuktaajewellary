import os
from PIL import Image

assets_dir = "public/assets"
large_indices = {66, 67, 68, 69, 71, 73, 74}

total_original_size = 0
total_compressed_size = 0

print("Starting image compression...")

for filename in os.listdir(assets_dir):
    filepath = os.path.join(assets_dir, filename)
    if not os.path.isfile(filepath):
        continue
    
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ('.jpeg', '.jpg', '.png'):
        continue
        
    original_size = os.path.getsize(filepath)
    total_original_size += original_size
    
    try:
        with Image.open(filepath) as img:
            # Determine target size
            is_large = False
            name_no_ext = os.path.splitext(filename)[0]
            if name_no_ext.startswith("jewel_"):
                try:
                    idx = int(name_no_ext.split("_")[1])
                    if idx in large_indices:
                        is_large = True
                except ValueError:
                    pass
            elif "collage" in name_no_ext:
                is_large = True
                
            max_size = 1600 if is_large else 1000
            
            # Dimensions before thumbnail
            w, h = img.size
            
            # Apply thumbnail resizing
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Handle color mode conversion (CMYK/RGBA to RGB)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            elif img.mode == "CMYK":
                img = img.convert("RGB")
                
            # Save back to same file
            img.save(filepath, "JPEG", optimize=True, quality=80)
            
        compressed_size = os.path.getsize(filepath)
        total_compressed_size += compressed_size
        savings = ((original_size - compressed_size) / original_size) * 100 if original_size > 0 else 0
        print(f"Compressed {filename}: {original_size/1024/1024:.2f}MB -> {compressed_size/1024/1024:.2f}MB ({savings:.1f}% saved) Dimensions: {w}x{h} -> {img.width}x{img.height}")
    except Exception as e:
        print(f"Failed to compress {filename}: {e}")
        total_compressed_size += original_size

if total_original_size > 0:
    total_savings = ((total_original_size - total_compressed_size) / total_original_size) * 100
    print(f"\nCompression complete!")
    print(f"Total original size: {total_original_size/1024/1024:.2f} MB")
    print(f"Total compressed size: {total_compressed_size/1024/1024:.2f} MB")
    print(f"Total savings: {total_savings:.2f}%")
else:
    print("\nNo images found to compress.")
