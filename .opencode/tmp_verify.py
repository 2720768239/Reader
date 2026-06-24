import json, os
base = r'E:\cwh\project\Reader\src\content\articles'
for f in sorted(os.listdir(base)):
    if not f.endswith('.json'):
        continue
    p = os.path.join(base, f)
    with open(p, 'r', encoding='utf-8') as fh:
        d = json.load(fh)
    has_id = 'id' in d
    has_cat = 'category' in d
    has_prod = 'product' in d
    has_slug = 'slug' in d
    has_pub = 'publishedAt' in d
    has_src = 'sourceUrl' in d
    id_val = d.get('id', 'N/A')
    issues = []
    if not has_id: issues.append('MISSING id')
    if not has_cat: issues.append('MISSING category')
    if not has_prod: issues.append('MISSING product')
    if has_slug: issues.append('HAS slug')
    if has_pub: issues.append('HAS publishedAt')
    status = ' | '.join(issues) if issues else 'OK'
    print(f'{f:40s} id={id_val:15s} {status}')
