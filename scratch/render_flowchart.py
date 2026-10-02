import subprocess
import os
from PIL import Image

edge = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
html_path = os.path.abspath(r"c:\Projects\Capstone\autivity\docs\notes\preoral\adaptive_difficulty_flowchart.html")
screenshot_path = os.path.abspath(r"c:\Projects\Capstone\autivity\docs\notes\preoral\temp_full.png")

# Window size and 2x device scale for razor-sharp text and graphics
cmd = [
    edge,
    "--headless=new",
    f"--screenshot={screenshot_path}",
    "--window-size=1600,2800",
    "--force-device-scale-factor=2",
    "--virtual-time-budget=6000",
    "file:///" + html_path.replace("\\", "/")
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("Screenshot return code:", res.returncode)

if os.path.exists(screenshot_path):
    im = Image.open(screenshot_path)
    rgb = im.convert("RGB")
    bg = rgb.getpixel((10, 10))
    w, h = im.size
    print(f"Captured screenshot at {w}x{h}, background color: {bg}")
    
    # Scan for content boundaries with distance > 4
    min_x, max_x = w, 0
    min_y, max_y = h, 0
    for y in range(0, h, 4):
        for x in range(0, w, 4):
            p = rgb.getpixel((x, y))
            if abs(p[0]-bg[0]) > 4 or abs(p[1]-bg[1]) > 4 or abs(p[2]-bg[2]) > 4:
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
                
    print("Detected content bounds:", (min_x, min_y, max_x, max_y))
    
    # Add 40px padding
    pad = 40
    crop_box = (max(0, min_x - pad), max(0, min_y - pad), min(w, max_x + pad), min(h, max_y + pad))
    cropped = im.crop(crop_box)
    print("Cropped image size:", cropped.size)
    
    out_png = r"c:\Projects\Capstone\autivity\docs\notes\preoral\adaptive_difficulty_flowchart.png"
    out_jpg = r"c:\Projects\Capstone\autivity\docs\notes\preoral\adaptive_difficulty_flowchart.jpg"
    
    cropped.save(out_png, "PNG")
    cropped.convert("RGB").save(out_jpg, "JPEG", quality=95)
    print("Saved exact PNG and JPG to preoral directory successfully!")
    
    # Cleanup temp
    if os.path.exists(screenshot_path):
        os.remove(screenshot_path)
