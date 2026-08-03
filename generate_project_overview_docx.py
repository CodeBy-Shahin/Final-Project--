from __future__ import annotations

import datetime as dt
import html
import zipfile
from pathlib import Path

from generate_project_overview_pdf import overview


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "presentation_output"
OUT_FILE = OUT_DIR / "Smart_Commerce_Project_Overview.docx"
FONT = "Aptos"


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def content_types() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>"""


def root_rels() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""


def core_xml() -> str:
    now = dt.datetime.now(dt.UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Smart Commerce Project Overview</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>"""


def app_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Codex</Application>
</Properties>"""


def paragraph(text: str, style: str = "body") -> str:
    if style == "title":
        size = "3200"
        spacing = '<w:spacing w:after="280"/>'
        bold = "<w:b/>"
        color = "162033"
    elif style == "heading":
        size = "2600"
        spacing = '<w:spacing w:before="260" w:after="140"/>'
        bold = "<w:b/>"
        color = "162033"
    else:
        size = "2200"
        spacing = '<w:spacing w:after="160" w:line="330" w:lineRule="auto"/>'
        bold = ""
        color = "263142"

    return f"""<w:p>
  <w:pPr>{spacing}</w:pPr>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="{FONT}" w:hAnsi="{FONT}"/>
      {bold}
      <w:color w:val="{color}"/>
      <w:sz w:val="{size}"/>
    </w:rPr>
    <w:t>{esc(text)}</w:t>
  </w:r>
</w:p>"""


def document_xml() -> str:
    body: list[str] = [
        paragraph("Smart Commerce Project Overview", "title"),
        paragraph("AI-Driven Smart E-Commerce Platform"),
        paragraph(
            "This document provides a complete overview of the final project, including the problem, solution, users, features, workflow, technology stack, demand forecasting module, and business value."
        ),
    ]

    for title, paragraphs in overview:
        body.append(paragraph(title, "heading"))
        for item in paragraphs:
            body.append(paragraph(item))

    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {''.join(body)}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/>
    </w:sectPr>
  </w:body>
</w:document>"""


def main() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    with zipfile.ZipFile(OUT_FILE, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types())
        z.writestr("_rels/.rels", root_rels())
        z.writestr("docProps/core.xml", core_xml())
        z.writestr("docProps/app.xml", app_xml())
        z.writestr("word/document.xml", document_xml())
    print(OUT_FILE)


if __name__ == "__main__":
    main()
