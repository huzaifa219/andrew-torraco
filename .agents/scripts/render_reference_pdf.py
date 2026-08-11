import fitz
from pathlib import Path
pdf = Path("attached_assets/Mutual_Success_Partners_Website_Redesign_Specification_v2_1786471009433.pdf")
out = Path(".agents/outputs/pdf-pages")
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(pdf)
print(f"pages={doc.page_count}")
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    path = out / f"page-{i+1}.png"
    pix.save(path)
    print(path)
