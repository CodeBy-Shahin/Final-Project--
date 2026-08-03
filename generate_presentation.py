from __future__ import annotations

import datetime as dt
import html
import os
import zipfile
from pathlib import Path

import fitz


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "presentation_output"
ASSETS = ROOT / "report_assets"

EMU = 914400
SLIDE_W = 13.333333 * EMU
SLIDE_H = 7.5 * EMU

FONT = "Aptos"
NAVY = "162033"
TEAL = "1E8A8A"
MINT = "EAF7F4"
INK = "263142"
MUTED = "637083"
LIGHT = "F6F8FB"
WHITE = "FFFFFF"


slides = [
    {
        "title": "Smart Commerce",
        "subtitle": "AI-Driven Smart E-Commerce Platform",
        "bullets": [
            "E-Commerce",
            "Inventory Intelligence",
            "Analytics",
            "Demand Forecasting",
        ],
    },
    {
        "title": "Real-Life Problem",
        "bullets": [
            "Manual stock tracking",
            "Scattered business data",
            "Delayed restocking",
            "Weak demand visibility",
        ],
    },
    {
        "title": "Project Overview",
        "bullets": [
            "Full-stack commerce system",
            "Admin, vendor, customer",
            "Orders, inventory, analytics",
            "Forecast-based decisions",
        ],
    },
    {
        "title": "Key Features",
        "bullets": [
            "Secure login",
            "Role-based dashboards",
            "Product and order management",
            "Low-stock alerts",
            "Forecast reports",
        ],
        "image": "role_access.png",
    },
    {
        "title": "Architecture and Lifecycle",
        "bullets": [
            "Client-server architecture",
            "REST API",
            "MongoDB persistence",
            "DSR + Agile increments",
        ],
        "image": "architecture.png",
    },
    {
        "title": "Technology Used",
        "bullets": [
            "Next.js, React, TypeScript",
            "Node.js, Express.js",
            "MongoDB, Mongoose",
            "JWT, Docker, Python",
        ],
    },
    {
        "title": "Business Value",
        "bullets": [
            "Better visibility",
            "Faster decisions",
            "Reduced stock risk",
            "Improved customer trust",
        ],
        "image": "result_comparison.png",
    },
    {
        "title": "Future Scope",
        "bullets": [
            "Payment gateway",
            "Recommendation engine",
            "Advanced ML forecasting",
            "Intelligent chatbot",
            "Cloud deployment",
        ],
    },
    {
        "title": "Conclusion",
        "bullets": [
            "Integrated platform",
            "Operational intelligence",
            "Graduate-level engineering",
            "Scalable future roadmap",
        ],
    },
]

speeches = [
    (
        "Good morning. My presentation topic is Smart Commerce, an AI-driven smart e-commerce platform. "
        "The main purpose of this project is to combine online shopping with inventory intelligence, "
        "business analytics, and demand forecasting. Instead of building only a simple product selling website, "
        "this project focuses on how an e-commerce platform can support better operational decisions for customers, vendors, and administrators."
    ),
    (
        "In real life, many small and medium businesses sell products online but still manage stock, orders, and business decisions manually. "
        "They may use separate spreadsheets, messaging apps, and basic store dashboards. This creates a serious problem because product stock, "
        "customer demand, order progress, and business performance are not visible in one place. As a result, sellers may restock late, lose sales, "
        "or fail to identify which products need urgent attention."
    ),
    (
        "Smart Commerce is a full-stack web application designed to solve this problem. The system provides a customer storefront for product browsing, "
        "cart, checkout, receipt download, and order tracking. It also provides dashboards for vendors and administrators. Vendors can manage products, "
        "inventory, and orders, while administrators can monitor users, vendors, inventory alerts, analytics, audit activity, and demand forecast results."
    ),
    (
        "The key features of this project include secure login, role-based dashboards, product and order management, low-stock alerts, audit logs, "
        "PDF receipt generation, and forecast reporting. The role-based structure is important because customers, vendors, and administrators do not need "
        "the same interface. Each user sees the tools that match their responsibility, which improves usability and security."
    ),
    (
        "The software architecture follows a modular client-server model. The frontend communicates with the backend through REST APIs. The backend handles "
        "authentication, authorization, business logic, data validation, analytics, and forecast orchestration. MongoDB stores users, roles, products, orders, "
        "inventory logs, and audit logs. The project approach follows Design Science Research for problem solving and Agile incremental development for building "
        "the system step by step."
    ),
    (
        "The major technologies used in this project are Next.js, React, TypeScript, Tailwind CSS, Node.js, Express.js, MongoDB, and Mongoose. "
        "JWT is used for authentication, Docker supports reproducible deployment, Recharts is used for dashboard visualization, jsPDF is used for PDF export, "
        "and Python is used for the demand forecasting script. These technologies were selected because they support a scalable and maintainable full-stack application."
    ),
    (
        "This project improves business value by giving decision-makers better visibility. Administrators can see revenue, order activity, low-stock products, "
        "top products, and forecast rankings from one dashboard. Vendors can react faster to stock changes and order updates. Customers receive a smoother shopping "
        "and tracking experience. Overall, the system reduces manual work, improves planning, and helps prevent lost sales caused by poor inventory visibility."
    ),
    (
        "The future scope of Smart Commerce includes real online payment gateway integration, personalized recommendation engines, advanced machine learning forecasting, "
        "an intelligent chatbot, notification services, cloud deployment, and production monitoring. The current forecasting module is an explainable baseline, but future "
        "versions can compare ARIMA, Prophet, Random Forest, XGBoost, or LSTM models using real transaction data."
    ),
    (
        "In conclusion, Smart Commerce is more than a conventional e-commerce website. It integrates customer shopping, vendor operations, administrator control, inventory intelligence, "
        "analytics, auditability, and demand forecasting into one platform. The project demonstrates graduate-level software engineering by combining real-world problem solving, "
        "modern architecture, formal methodology, and a clear roadmap for future improvement."
    ),
]


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def shape_text(shape_id: int, x: int, y: int, w: int, h: int, text: str, size: int, color: str, bold=False):
    return f"""
    <p:sp>
      <p:nvSpPr><p:cNvPr id="{shape_id}" name="Text {shape_id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
      <p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{w}" cy="{h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr>
      <p:txBody>
        <a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0"/>
        <a:lstStyle/>
        <a:p><a:r><a:rPr lang="en-US" sz="{size * 100}" b="{1 if bold else 0}"><a:solidFill><a:srgbClr val="{color}"/></a:solidFill><a:latin typeface="{FONT}"/></a:rPr><a:t>{esc(text)}</a:t></a:r><a:endParaRPr lang="en-US" sz="{size * 100}"/></a:p>
      </p:txBody>
    </p:sp>"""


def bullet_list(shape_id: int, x: int, y: int, w: int, h: int, bullets: list[str]):
    paragraphs = []
    for bullet in bullets:
        paragraphs.append(
            f"""<a:p><a:pPr marL="285750" indent="-171450"><a:buChar char="•"/></a:pPr>
            <a:r><a:rPr lang="en-US" sz="2200"><a:solidFill><a:srgbClr val="{INK}"/></a:solidFill><a:latin typeface="{FONT}"/></a:rPr><a:t>{esc(bullet)}</a:t></a:r>
            <a:endParaRPr lang="en-US" sz="2200"/></a:p>"""
        )
    return f"""
    <p:sp>
      <p:nvSpPr><p:cNvPr id="{shape_id}" name="Bullets {shape_id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
      <p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{w}" cy="{h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr>
      <p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" anchor="t"/><a:lstStyle/>{''.join(paragraphs)}</p:txBody>
    </p:sp>"""


def accent_bar():
    return f"""
    <p:sp>
      <p:nvSpPr><p:cNvPr id="90" name="Accent"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
      <p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{int(SLIDE_W)}" cy="152400"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="{TEAL}"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr>
    </p:sp>"""


def image_pic(shape_id: int, rel_id: str, x: int, y: int, w: int, h: int):
    return f"""
    <p:pic>
      <p:nvPicPr><p:cNvPr id="{shape_id}" name="Project visual"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr>
      <p:blipFill><a:blip r:embed="{rel_id}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
      <p:spPr><a:xfrm><a:off x="{x}" y="{y}"/><a:ext cx="{w}" cy="{h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:ln><a:solidFill><a:srgbClr val="D7DEE8"/></a:solidFill></a:ln></p:spPr>
    </p:pic>"""


def slide_xml(index: int, data: dict):
    title_y = 515000
    content = [accent_bar()]
    content.append(shape_text(2, 685800, title_y, 8800000, 700000, data["title"], 34, NAVY, True))
    if index == 1:
        content.append(shape_text(3, 685800, 1300000, 7600000, 420000, data["subtitle"], 20, TEAL, True))
        content.append(bullet_list(4, 685800, 2100000, 9800000, 2400000, data["bullets"]))
    elif data.get("image"):
        content.append(bullet_list(3, 685800, 1450000, 5200000, 3800000, data["bullets"]))
        content.append(image_pic(4, "rId2", 6400000, 1500000, 5200000, 3300000))
    else:
        content.append(bullet_list(3, 1050000, 1650000, 10300000, 3900000, data["bullets"]))
    content.append(shape_text(91, 685800, 6500000, 2200000, 250000, f"{index:02d}", 12, MUTED, False))
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="{WHITE}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree>
    <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
    <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
    {''.join(content)}
  </p:spTree></p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>"""


def slide_rels(data: dict):
    rels = [
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>'
    ]
    if data.get("image"):
        rels.append(
            f'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/{esc(data["image"])}"/>'
        )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{''.join(rels)}</Relationships>"""


def presentation_xml():
    ids = "".join(
        f'<p:sldId id="{255 + i}" r:id="rId{i}"/>' for i in range(1, len(slides) + 1)
    )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId{len(slides)+1}"/></p:sldMasterIdLst>
  <p:sldIdLst>{ids}</p:sldIdLst>
  <p:sldSz cx="{int(SLIDE_W)}" cy="{int(SLIDE_H)}" type="wide"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>"""


def presentation_rels():
    rels = [
        f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>'
        for i in range(1, len(slides) + 1)
    ]
    rels.append(
        f'<Relationship Id="rId{len(slides)+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>'
    )
    rels.append(
        f'<Relationship Id="rId{len(slides)+2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>'
    )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{''.join(rels)}</Relationships>"""


def content_types():
    overrides = [
        '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>',
        '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>',
        '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>',
        '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>',
        '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
        '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
    ]
    overrides.extend(
        f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
        for i in range(1, len(slides) + 1)
    )
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  {''.join(overrides)}
</Types>"""


ROOT_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""

APP_XML = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application><PresentationFormat>On-screen Show (16:9)</PresentationFormat><Slides>{len(slides)}</Slides><Notes>0</Notes><HiddenSlides>0</HiddenSlides>
</Properties>"""


def core_xml():
    now = dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Smart Commerce Problem Solving Presentation</dc:title><dc:creator>Codex</dc:creator><cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>"""


SLIDE_MASTER = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
  <p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles>
</p:sldMaster>"""

MASTER_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>"""

SLIDE_LAYOUT = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sldLayout>"""

LAYOUT_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>"""

THEME = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Smart Commerce">
  <a:themeElements>
    <a:clrScheme name="Smart Commerce"><a:dk1><a:srgbClr val="{NAVY}"/></a:dk1><a:lt1><a:srgbClr val="{WHITE}"/></a:lt1><a:dk2><a:srgbClr val="{INK}"/></a:dk2><a:lt2><a:srgbClr val="{LIGHT}"/></a:lt2><a:accent1><a:srgbClr val="{TEAL}"/></a:accent1><a:accent2><a:srgbClr val="37A169"/></a:accent2><a:accent3><a:srgbClr val="F2C94C"/></a:accent3><a:accent4><a:srgbClr val="E07A5F"/></a:accent4><a:accent5><a:srgbClr val="5B6C8F"/></a:accent5><a:accent6><a:srgbClr val="8A7CCF"/></a:accent6><a:hlink><a:srgbClr val="{TEAL}"/></a:hlink><a:folHlink><a:srgbClr val="5B6C8F"/></a:folHlink></a:clrScheme>
    <a:fontScheme name="Aptos"><a:majorFont><a:latin typeface="{FONT}"/></a:majorFont><a:minorFont><a:latin typeface="{FONT}"/></a:minorFont></a:fontScheme>
    <a:fmtScheme name="Clean"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme>
  </a:themeElements>
</a:theme>"""


def write_pptx(path: Path):
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types())
        z.writestr("_rels/.rels", ROOT_RELS)
        z.writestr("docProps/app.xml", APP_XML)
        z.writestr("docProps/core.xml", core_xml())
        z.writestr("ppt/presentation.xml", presentation_xml())
        z.writestr("ppt/_rels/presentation.xml.rels", presentation_rels())
        z.writestr("ppt/slideMasters/slideMaster1.xml", SLIDE_MASTER)
        z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", MASTER_RELS)
        z.writestr("ppt/slideLayouts/slideLayout1.xml", SLIDE_LAYOUT)
        z.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", LAYOUT_RELS)
        z.writestr("ppt/theme/theme1.xml", THEME)
        for i, data in enumerate(slides, 1):
            z.writestr(f"ppt/slides/slide{i}.xml", slide_xml(i, data))
            z.writestr(f"ppt/slides/_rels/slide{i}.xml.rels", slide_rels(data))
        for name in sorted({s["image"] for s in slides if s.get("image")}):
            z.write(ASSETS / name, f"ppt/media/{name}")


def docx_content_types():
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>"""


def docx_root_rels():
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""


def para(text: str, style: str = "body"):
    size = "2800" if style == "title" else "2400" if style == "heading" else "2200"
    bold = '<w:b/>' if style in {"title", "heading"} else ""
    spacing = '<w:spacing w:after="180"/>' if style != "title" else '<w:spacing w:after="300"/>'
    return f"""<w:p><w:pPr>{spacing}</w:pPr><w:r><w:rPr><w:rFonts w:ascii="{FONT}" w:hAnsi="{FONT}"/>{bold}<w:sz w:val="{size}"/></w:rPr><w:t>{esc(text)}</w:t></w:r></w:p>"""


def document_xml():
    body = [para("Smart Commerce: Problem Solving Presentation Speech", "title")]
    body.append(para("Presentation Topic: Smart Commerce - AI-Driven Smart E-Commerce Platform", "body"))
    for i, (slide, speech) in enumerate(zip(slides, speeches), 1):
        body.append(para(f"Slide {i}: {slide['title']}", "heading"))
        body.append(para(speech, "body"))
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>{''.join(body)}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr></w:body>
</w:document>"""


def write_docx(path: Path):
    app = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Codex</Application></Properties>"""
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", docx_content_types())
        z.writestr("_rels/.rels", docx_root_rels())
        z.writestr("docProps/core.xml", core_xml())
        z.writestr("docProps/app.xml", app)
        z.writestr("word/document.xml", document_xml())


def write_pdf(path: Path, title: str, sections: list[tuple[str, list[str]]]) -> None:
    pdf = fitz.open()
    page_w, page_h = fitz.paper_size("a4")
    margin = 54
    width = page_w - 2 * margin
    page = pdf.new_page(width=page_w, height=page_h)
    y = margin

    def ensure(space: float) -> None:
        nonlocal page, y
        if y + space > page_h - margin:
            page = pdf.new_page(width=page_w, height=page_h)
            y = margin

    def text_width(value: str, size: float, fontname: str = "Helvetica") -> float:
        return fitz.get_text_length(value, fontsize=size, fontname=fontname)

    def wrap(value: str, size: float, max_width: float, fontname: str = "Helvetica") -> list[str]:
        words = value.split()
        lines: list[str] = []
        current = ""
        for word in words:
            trial = f"{current} {word}".strip()
            if text_width(trial, size, fontname) <= max_width:
                current = trial
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
        return lines

    def add(value: str, size: float = 10.5, bold: bool = False, spacing: float = 8, indent: float = 0) -> None:
        nonlocal y
        fontname = "Helvetica-Bold" if bold else "Helvetica"
        lines = wrap(value, size, width - indent, fontname)
        line_h = size * 1.35
        ensure(line_h * max(1, len(lines)) + spacing)
        for line in lines:
            page.insert_text((margin + indent, y), line, fontsize=size, fontname=fontname, color=(0.08, 0.1, 0.14))
            y += line_h
        y += spacing

    add(title, 17, True, 16)
    add("Smart Commerce - Formal Project Presentation", 11.5, False, 16)
    for heading, lines in sections:
        add(heading, 13.5, True, 8)
        for line in lines:
            add(line, 10.5, False, 5, 14)
        y += 4

    for i, page in enumerate(pdf, 1):
        page.insert_text((page_w / 2 - 12, page_h - 24), str(i), fontsize=9, fontname="Helvetica", color=(0.4, 0.4, 0.4))
    pdf.save(path)
    pdf.close()


def write_topic_pdf(path: Path) -> None:
    sections = []
    for i, slide in enumerate(slides, 1):
        lines = [f"- {bullet}" for bullet in slide["bullets"]]
        sections.append((f"Slide {i}: {slide['title']}", lines))
    write_pdf(path, "Presentation Topics and Slide Keywords", sections)


def write_speech_pdf(path: Path) -> None:
    sections = []
    for i, (slide, speech) in enumerate(zip(slides, speeches), 1):
        sections.append((f"Slide {i}: {slide['title']}", [speech]))
    write_pdf(path, "Presentation Speech", sections)


def main():
    OUT.mkdir(exist_ok=True)
    pptx = OUT / "Smart_Commerce_Formal_Presentation.pptx"
    docx = OUT / "Smart_Commerce_Presentation_Speech.docx"
    topic_pdf = OUT / "Smart_Commerce_Presentation_Topics.pdf"
    speech_pdf = OUT / "Smart_Commerce_Presentation_Speech.pdf"
    write_pptx(pptx)
    write_docx(docx)
    write_topic_pdf(topic_pdf)
    write_speech_pdf(speech_pdf)
    print(pptx)
    print(docx)
    print(topic_pdf)
    print(speech_pdf)


if __name__ == "__main__":
    main()
