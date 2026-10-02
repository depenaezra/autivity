with open('rendered.svg', 'r', encoding='utf-8') as f:
    text = f.read()

import re
matches = re.findall(r'transform="translate\(([0-9\.]+),\s*([0-9\.]+)\)"[^>]*>.*?Grant 15 Stars', text, re.DOTALL)
print('Grant 15 Stars pos:', matches)
for m in re.finditer(r'<g[^>]*class="[^"]*node[^"]*"[^>]*transform="translate\(([0-9\.]+),\s*([0-9\.]+)\)"', text):
    pass
print('Found nodes, let us check viewBox:')
vb = re.search(r'viewBox="([^"]+)"', text)
if vb:
    print('viewBox:', vb.group(1))
    
# Check height style
h = re.search(r'style="([^"]+)"', text)
if h:
    print('style:', h.group(1))
