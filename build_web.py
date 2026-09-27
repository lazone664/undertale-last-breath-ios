import os
import shutil

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
WWW_DIR = os.path.join(ROOT_DIR, 'www')

print("Preparing 'www' directory for iOS Capacitor build...")
if os.path.exists(WWW_DIR):
    shutil.rmtree(WWW_DIR)
os.makedirs(WWW_DIR, exist_ok=True)

# Copy root web files
files_to_copy = ['index.html', 'style.css', 'manifest.json']
for f in files_to_copy:
    src = os.path.join(ROOT_DIR, f)
    dst = os.path.join(WWW_DIR, f)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f"Copied: {f}")

# Copy JS directory
src_js = os.path.join(ROOT_DIR, 'js')
dst_js = os.path.join(WWW_DIR, 'js')
shutil.copytree(src_js, dst_js)
print("Copied: js/")

# Copy assets (audio, sprites, icon)
dst_assets = os.path.join(WWW_DIR, 'assets')
os.makedirs(dst_assets, exist_ok=True)

for sub in ['audio', 'sprites', 'icon']:
    src_sub = os.path.join(ROOT_DIR, 'assets', sub)
    dst_sub = os.path.join(dst_assets, sub)
    if os.path.exists(src_sub):
        shutil.copytree(src_sub, dst_sub)
        print(f"Copied: assets/{sub}/")

print("Build complete! 'www/' is ready.")
