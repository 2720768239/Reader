import json, os
base = r'E:\cwh\project\Reader\src\content\articles'
articles = []
for fname in sorted(os.listdir(base)):
    if not fname.endswith('.json'):
        continue
    path = os.path.join(base, fname)
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    iid = data.get('id', 'N/A')
    src = data.get('sourceUrl', '')
    title = data.get('title', '')
    articles.append({'id': iid, 'file': fname, 'src': src, 'title': title})

for a in articles:
    print(f"{a['id']:20s} {a['file']:40s} | {a['src']}")
