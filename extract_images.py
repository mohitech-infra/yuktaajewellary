import fitz
import os

pdf_path = "jewellery.pdf"
output_dir = "public/assets"

os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)
count = 0
for page_index in range(len(doc)):
    page = doc[page_index]
    image_list = page.get_images(full=True)
    
    for img_index, img in enumerate(image_list):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        image_filename = os.path.join(output_dir, f"jewel_{count}.{image_ext}")
        
        with open(image_filename, "wb") as image_file:
            image_file.write(image_bytes)
            
        count += 1
        
print(f"Extracted {count} images.")
