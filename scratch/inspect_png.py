from PIL import Image
im = Image.open(r'c:\Projects\Capstone\autivity\docs\notes\preoral\adaptive_difficulty_flowchart.png')
print('Size:', im.size)
# Let's inspect some vertical slices
# check pixels at x = im.width // 2
for y in range(0, im.height, 50):
    print(f'y={y}:', im.getpixel((im.width // 2, y)))
