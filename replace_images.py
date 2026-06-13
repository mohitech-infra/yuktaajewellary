import os
import re

files_to_check = [
    "src/views/ProductView.jsx",
    "src/views/LookbookView.jsx",
    "src/views/HomeView.jsx"
]

idx = 14
for filepath in files_to_check:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    def replacer(match):
        global idx
        replacement = f"/assets/jewel_{idx}.jpeg"
        idx += 1
        return replacement

    new_content = re.sub(r'https://images\.unsplash\.com/[^\'"\s]+', replacer, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

print(f"Replaced up to index {idx-1}")
