import os, sys
sys.stdout.reconfigure(encoding='utf-8')

BASE = r"C:\Users\蔡静兰\Documents\website\aimodelprice_2"
BACKUP = r"C:\Users\蔡静兰\Documents\website\aimodelprice_backup"

files = [
    "app/globals.css",
    "tailwind.config.ts",
    "app/layout.tsx",
    "next.config.ts",
    "components/layout/Header.tsx",
    "components/layout/Footer.tsx",
    "components/layout/MainLayout.tsx",
    "components/aceternity/price-comparison-card.tsx",
    "app/(main)/page.tsx",
    "app/(main)/models/page.tsx",
    "app/(main)/models/[slug]/page.tsx",
    "app/(main)/compare/page.tsx",
    "app/(main)/search/page.tsx",
]

for f in files:
    src = os.path.join(BACKUP, f)
    dst = os.path.join(BASE, f)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(src, 'r', encoding='utf-8') as sf:
        content = sf.read()
    with open(dst, 'w', encoding='utf-8') as df:
        df.write(content)
    print("OK: " + f)

print("All done!")
