with open('rendered.svg', 'r', encoding='utf-8') as f:
    text = f.read()

import re
labels = re.findall(r'<span class="nodeLabel">([^<]+)</span>', text)
print('Node labels:', len(labels), labels)
edges = re.findall(r'<span class="edgeLabel">([^<]+)</span>', text)
print('Edge labels:', len(edges), edges)
