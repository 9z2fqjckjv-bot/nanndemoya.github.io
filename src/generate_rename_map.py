import os
import re
import json

def to_kebab_case(name):
    if name.endswith('.html'):
        base = name[:-5]
        ext = '.html'
    else:
        base = name
        ext = ''
    
    # Custom rules
    if base == 'Nanndemoya365': return 'nanndemoya-365' + ext
    if base == 'NanndemoyaCloud': return 'nanndemoya-cloud' + ext
    if base == 'NCF': return 'ncf' + ext
    if base == 'UserGuide': return 'user-guide' + ext
    if base == 'N.C.F~Nanndemoya_Crowd_Funding': return 'ncf' + ext
    
    # Generic camelCase and snake_case to kebab-case
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1-\2', base)
    s2 = re.sub('([a-z0-9])([A-Z])', r'\1-\2', s1).lower()
    s3 = s2.replace('_', '-')
    # remove consecutive hyphens
    s4 = re.sub(r'-+', '-', s3)
    return s4 + ext

ignore_dirs = ['.git', 'node_modules', '.github']

rename_map = {}
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ignore_dirs]
    
    for name in dirs:
        if name == 'documet':
            rename_map[os.path.join(root, name)] = os.path.join(root, 'document')
        elif name == 'N.C.F~Nanndemoya_Crowd_Funding':
            rename_map[os.path.join(root, name)] = os.path.join(root, 'ncf')
        elif name == 'Life-Events':
            rename_map[os.path.join(root, name)] = os.path.join(root, 'life-events')

    for name in files:
        if name.endswith('.html') and name != 'templete.html':
            new_name = to_kebab_case(name)
            if new_name != name:
                rename_map[os.path.join(root, name)] = os.path.join(root, new_name)

with open('rename_map.json', 'w') as f:
    json.dump(rename_map, f, indent=2, ensure_ascii=False)
print("Generated rename_map.json")
