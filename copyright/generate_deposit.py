#!/usr/bin/env python3
"""Build copyright-deposit PDFs (HTML stage) for the AtomX Portal monorepo."""
import html, pathlib, sys, datetime

ROOT = pathlib.Path("/Users/PRJ/ATOMX_PORTAL_V1/atomx_dashboard_v3")
OUT = pathlib.Path(sys.argv[1])

WORK_TITLE = "AtomX Portal"
OWNER = "AtomX"
DOMAIN = "portal.atomx.in"
PREPARED_DATE = "22 August 2026"   # date shown on the cover page

LINES_PER_PAGE = 70
WRAP = 105
EXTRACT_PAGES = 10          # India: first 10 + last 10 pages of source

EXCLUDE_DIRS = {"node_modules", ".next", "out", ".git", ".turbo", "shared"}
EXCLUDE_NAMES = {"package-lock.json", ".env", ".DS_Store", "favicon.ico"}
INCLUDE_EXT = {".js", ".jsx", ".mjs", ".css", ".json"}
# Live credentials must not appear in the deposited first/last pages.
SENSITIVE = {"apiConfig.js", "DeviceBankCredentials.js"}


def collect():
    files = []
    for base in ["apps", "packages", "scripts"]:
        for p in sorted((ROOT / base).rglob("*")):
            if not p.is_file() or p.suffix not in INCLUDE_EXT:
                continue
            if p.name in EXCLUDE_NAMES:
                continue
            if any(part in EXCLUDE_DIRS for part in p.relative_to(ROOT).parts):
                continue
            files.append(p)
    for name in ["package.json", "turbo.json", "jsconfig.json"]:
        p = ROOT / name
        if p.is_file():
            files.insert(0, p)

    # Order: keep credential-bearing files away from the first and last pages.
    safe = [f for f in files if f.name not in SENSITIVE]
    risky = [f for f in files if f.name in SENSITIVE]
    mid = len(safe) // 2
    return safe[:mid] + risky + safe[mid:]


def wrap(line):
    if not line:
        return [""]
    out, i = [], 0
    while i < len(line):
        out.append(line[i:i + WRAP])
        i += WRAP
    return out


def build_pages(files):
    """Flatten every file into fixed-height pages so pagination is exact."""
    pages, cur, toc = [], [], []
    cur_file = None

    def flush():
        nonlocal cur
        if cur:
            pages.append((cur_file, cur))
            cur = []

    for path in files:
        rel = str(path.relative_to(ROOT))
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        flush()
        cur_file = rel
        toc.append((rel, len(pages) + 1, len(text.splitlines())))
        cur.append(("hdr", rel, ""))
        for n, raw in enumerate(text.splitlines(), 1):
            for j, seg in enumerate(wrap(raw.replace("\t", "    "))):
                cur.append(("src", str(n) if j == 0 else "", seg))
                if len(cur) >= LINES_PER_PAGE:
                    pages.append((cur_file, cur))
                    cur = []
        flush()
    return pages, toc


CSS = """
@page { size: A4; margin: 14mm 14mm 12mm 14mm; }
* { box-sizing: border-box; }
body { margin:0; font-family:"Helvetica Neue",Arial,sans-serif; color:#000; background:#fff; }
.page { page-break-after: always; height: 269mm; display:flex; flex-direction:column; }
.page:last-child { page-break-after: auto; }
.phead { font-size:7pt; letter-spacing:.06em; text-transform:uppercase; color:#444;
         border-bottom:.4pt solid #999; padding-bottom:1.6mm; margin-bottom:2.2mm;
         display:flex; justify-content:space-between; }
.pfoot { margin-top:auto; border-top:.4pt solid #999; padding-top:1.4mm; font-size:7pt;
         color:#444; display:flex; justify-content:space-between; }
pre { margin:0; font-family:"SFMono-Regular",Menlo,Consolas,monospace; font-size:7.5pt;
      line-height:1.30; white-space:pre; }
.ln { display:inline-block; width:9mm; color:#888; text-align:right; padding-right:2.5mm; }
.fh { font-weight:700; background:#eee; padding:.7mm 1.5mm; display:block; margin-bottom:.8mm; }
.cover { height:269mm; display:flex; flex-direction:column; justify-content:center; }
.cover h1 { font-size:30pt; margin:0 0 2mm; letter-spacing:-.02em; }
.cover h2 { font-size:12pt; font-weight:400; color:#333; margin:0 0 14mm; }
.rule { height:2pt; background:#000; width:52mm; margin:0 0 9mm; }
table.meta { border-collapse:collapse; font-size:9.5pt; width:100%; }
table.meta td { padding:2.1mm 0; border-bottom:.4pt solid #ccc; vertical-align:top; }
table.meta td:first-child { width:52mm; color:#555; text-transform:uppercase;
                            font-size:7.5pt; letter-spacing:.08em; padding-top:2.9mm; }
.note { margin-top:12mm; font-size:8pt; color:#444; line-height:1.55; }
h3.sec { font-size:13pt; margin:0 0 4mm; }
table.toc { border-collapse:collapse; width:100%; font-size:7.6pt; }
table.toc th { text-align:left; font-size:6.6pt; text-transform:uppercase; letter-spacing:.08em;
               color:#555; border-bottom:.6pt solid #666; padding-bottom:1.2mm; }
table.toc td { padding:.75mm 0; border-bottom:.3pt solid #e2e2e2;
               font-family:"SFMono-Regular",Menlo,monospace; }
table.toc td.n { text-align:right; width:16mm; }
"""


def page_html(idx, total, fname, rows, label):
    body = []
    for kind, a, b in rows:
        if kind == "hdr":
            body.append(f'<span class="fh">FILE: {html.escape(a)}</span>')
        else:
            body.append(f'<span class="ln">{a}</span>{html.escape(b)}')
    return f"""<div class="page">
<div class="phead"><span>{WORK_TITLE} &mdash; Source Code</span><span>{html.escape(fname or "")}</span></div>
<pre>{chr(10).join(body)}</pre>
<div class="pfoot"><span>{OWNER} &mdash; {DOMAIN}</span><span>{label} {idx} of {total}</span></div>
</div>"""


def cover(total_pages, total_files, total_lines, subtitle, extra=""):
    today = PREPARED_DATE
    return f"""<div class="page"><div class="cover">
<div class="rule"></div>
<h1>{WORK_TITLE}</h1>
<h2>{subtitle}</h2>
<table class="meta">
<tr><td>Work</td><td><b>{WORK_TITLE}</b> &mdash; integrated web application suite</td></tr>
<tr><td>Owner</td><td>{OWNER}</td></tr>
<tr><td>Deployed at</td><td>https://{DOMAIN}</td></tr>
<tr><td>Components</td><td>Access Portal &middot; Dashboard &middot; Tag Series &middot; shared packages</td></tr>
<tr><td>Language</td><td>JavaScript (JSX), CSS</td></tr>
<tr><td>Framework</td><td>Next.js 16.2.6 / React 19.2.0, npm workspaces + Turborepo</td></tr>
<tr><td>Source files</td><td>{total_files}</td></tr>
<tr><td>Lines of code</td><td>{total_lines:,}</td></tr>
<tr><td>Deposit pages</td><td>{total_pages}</td></tr>
<tr><td>Prepared</td><td>{today}</td></tr>
</table>
<div class="note">{extra}This document contains the source code of {WORK_TITLE}, an original
literary work in the form of a computer programme. Generated build artefacts, third-party
dependencies (<i>node_modules</i>), lockfiles and environment configuration files are excluded;
the deposit contains only source authored for this work.</div>
</div></div>"""


def toc_pages(toc):
    rows = "".join(
        f'<tr><td>{html.escape(r)}</td><td class="n">{l}</td><td class="n">{p}</td></tr>'
        for r, p, l in toc)
    out, per = [], 46
    items = rows.split("</tr>")
    items = [i + "</tr>" for i in items if i.strip()]
    for i in range(0, len(items), per):
        out.append(f"""<div class="page">
<div class="phead"><span>{WORK_TITLE} &mdash; Contents</span><span></span></div>
<h3 class="sec">Table of Contents</h3>
<table class="toc"><tr><th>File</th><th style="text-align:right">Lines</th><th style="text-align:right">Page</th></tr>
{''.join(items[i:i+per])}</table>
<div class="pfoot"><span>{OWNER} &mdash; {DOMAIN}</span><span>Contents</span></div></div>""")
    return out


def main():
    files = collect()
    pages, toc = build_pages(files)
    total = len(pages)
    total_lines = sum(l for _, _, l in toc)

    # ---- master: cover + TOC + every source page
    src = [page_html(i + 1, total, f, r, "Source page") for i, (f, r) in enumerate(pages)]
    master = cover(total, len(toc), total_lines, "Complete Source Code Deposit") \
        + "".join(toc_pages(toc)) + "".join(src)
    (OUT / "AtomX_Portal_Source_Code_FULL.html").write_text(
        f"<html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{master}</body></html>")

    # ---- extract: cover + first 10 + last 10 source pages
    head = [page_html(i + 1, total, pages[i][0], pages[i][1], "Source page") for i in range(EXTRACT_PAGES)]
    tail = [page_html(i + 1, total, pages[i][0], pages[i][1], "Source page")
            for i in range(total - EXTRACT_PAGES, total)]
    note = (f"<b>Deposit extract.</b> This document reproduces the first {EXTRACT_PAGES} and the last "
            f"{EXTRACT_PAGES} pages of the {total}-page source listing, without omission or "
            f"blocked-out portions, as required for a computer programme. ")
    ex = cover(total, len(toc), total_lines, "Source Code Deposit &mdash; First 10 and Last 10 Pages", note) \
        + "".join(head) + "".join(tail)
    (OUT / "AtomX_Portal_Source_Code_EXTRACT.html").write_text(
        f"<html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{ex}</body></html>")

    # ---- safety report
    print(f"files={len(toc)} lines={total_lines} source_pages={total}")
    first = {pages[i][0] for i in range(EXTRACT_PAGES)}
    last = {pages[i][0] for i in range(total - EXTRACT_PAGES, total)}
    print("first 10 pages cover:", sorted(first))
    print("last 10 pages cover:", sorted(last))
    for rel, p, _ in toc:
        if pathlib.Path(rel).name in SENSITIVE:
            print(f"SENSITIVE {rel} -> starts page {p} (in extract: {p <= EXTRACT_PAGES or p > total - EXTRACT_PAGES})")


main()
