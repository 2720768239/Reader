import json, os

base = r'E:\cwh\project\Reader\src\content\articles'
img_base = r'E:\cwh\project\Reader\public\images'

# Read all article data
articles = {}
for fname in sorted(os.listdir(base)):
    if not fname.endswith('.json'):
        continue
    path = os.path.join(base, fname)
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    iid = data.get('id')
    if iid:
        articles[iid] = {
            'file': fname,
            'title': data.get('title', ''),
            'src': data.get('sourceUrl', ''),
            'category': data.get('category', ''),
            'product': data.get('product', ''),
            'has_sourceUrl': 'sourceUrl' in data,
        }
        # Collect local images
        local_imgs = set()
        for block in data.get('blocks', []):
            if block.get('type') == 'image':
                local_imgs.add(block.get('src', ''))
        articles[iid]['local_imgs'] = local_imgs
        
        # Check image files exist
        for img_src in local_imgs:
            img_path = os.path.join(img_base, img_src.replace('images/', '', 1))
            exists = os.path.exists(img_path)
            if not exists:
                articles[iid].setdefault('missing_img_files', []).append(img_src)

# Summary
print(f"{'ID':20s} | {'sourceUrl':>5s} | {'category':>5s} | {'product':>5s} | {'imgs':>4s} | {'img_files_ok':>10s} | {'cat_ok':>6s}")
print('-'*80)
for iid in sorted(articles, reverse=True):
    a = articles[iid]
    missing_imgs = a.get('missing_img_files', [])
    img_files_ok = 'OK' if not missing_imgs else f'MISS({len(missing_imgs)})'
    cat_ok = 'OK'
    if '*' in a['category'] or any('\u4e00' <= c <= '\u9fff' for c in a['category']):
        cat_ok = 'FIX'
    print(f"{iid:20s} | {'Y' if a['has_sourceUrl'] else 'N':>5s} | {'Y' if a['category'] else 'N':>5s} | {'Y' if a['product'] else 'N':>5s} | {len(a['local_imgs']):>4d} | {img_files_ok:>10s} | {cat_ok:>6s}")
