import sys
sys.stdout.reconfigure(encoding='utf-8')
import os
base1 = r'C:\Users\蔡静兰\Documents\website\aimodelprice'
base2 = r'C:\Users\蔡静兰\Documents\website\aimodelprice_2'

# Gather all file diffs
files = [
    'app/(main)/page.tsx',
    'app/(main)/compare/page.tsx',
    'app/(main)/search/page.tsx',
    'app/(main)/models/page.tsx',
    'app/(main)/models/[slug]/page.tsx',
    'components/layout/Header.tsx',
    'components/aceternity/price-comparison-card.tsx',
    'app/globals.css',
    'tailwind.config.ts',
]

results = {}
for fp in files:
    p1 = os.path.join(base1, fp.replace('/', '\\'))
    p2 = os.path.join(base2, fp.replace('/', '\\'))
    with open(p1, 'r', encoding='utf-8') as f:
        c1 = f.read()
    with open(p2, 'r', encoding='utf-8') as f:
        c2 = f.read()
    lines1 = c1.count(chr(10))
    lines2 = c2.count(chr(10))
    added = 0
    removed = 0
    for o in __import__('difflib').diff_match_patch().diff_main(c1, c2):
        if o[0] == 1: added += o[1].count(chr(10))
        elif o[0] == -1: removed += o[1].count(chr(10))
    results[fp] = {'lines1': lines1, 'lines2': lines2, 'added': added, 'removed': removed}

# Output as markdown
md = '# aimodelprice_2 vs aimodelprice 优化说明\n\n'
md += '## 一、总体统计\n\n'
total_added = sum(v['added'] for v in results.values())
total_removed = sum(v['removed'] for v in results.values())
total_lines2 = sum(v['lines2'] for v in results.values())
md += '| 文件 | 行数变化 | 新增行 | 删除行 |\n'
md += '|------|---------|--------|--------|\n'
for fp, v in results.items():
    delta = v['lines2'] - v['lines1']
    sign = '+' if delta >= 0 else ''
    md += '| ' + fp + ' | ' + sign + str(delta) + ' | ' + str(v['added']) + ' | ' + str(v['removed']) + ' |\n'
md += '\n- **总计**：新增约 ' + str(total_added) + ' 行，删除约 ' + str(total_removed) + ' 行\n'
md += '- **代码总量**：约 ' + str(total_lines2) + ' 行\n\n'

with open(r'C:\Users\蔡静兰\Documents\website\aimodelprice_2\OPTIMIZATION_NOTES.md', 'w', encoding='utf-8') as f:
    f.write(md)
print('Generated OPTIMIZATION_NOTES.md')