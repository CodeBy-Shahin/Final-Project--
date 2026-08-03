from __future__ import annotations

from pathlib import Path
import textwrap


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "presentation_output"
OUT_FILE = OUT_DIR / "Smart_Commerce_Project_Overview.pdf"

PAGE_W = 612
PAGE_H = 792
MARGIN_X = 64
TOP_Y = 720
BOTTOM_Y = 64

NAVY = (0.086, 0.125, 0.200)
TEAL = (0.118, 0.541, 0.541)
INK = (0.149, 0.192, 0.259)
MUTED = (0.388, 0.439, 0.514)
LIGHT = (0.965, 0.976, 0.988)


overview = [
    (
        "Project Overview",
        [
            "Project Title: Smart Commerce - AI-Driven Smart E-Commerce Platform",
            "Smart Commerce is a full-stack e-commerce platform designed to solve common problems in online business management, especially for small and medium-sized sellers. The system goes beyond a simple shopping website by combining a customer storefront, role-based dashboards, order management, inventory monitoring, analytics, and demand forecasting.",
            "The main purpose of the project is to help businesses manage products, vendors, customers, orders, and stock from one centralized platform while using data-driven insights to make better decisions.",
        ],
    ),
    (
        "Problem Statement",
        [
            "Many e-commerce businesses face difficulties managing daily operations efficiently. Product stock may be tracked manually, order status may not be clear, and admins often lack real-time insights into sales, customers, and inventory. Because of this, businesses may face stock shortages, delayed order processing, poor customer experience, and weak decision-making.",
            "Smart Commerce solves these problems by providing a structured digital platform where each user role has the right tools and access.",
        ],
    ),
    (
        "Main Users",
        [
            "Admin: The admin manages the whole platform. Admins can view dashboard analytics, manage users, add vendors, monitor orders, check inventory alerts, and review audit activity.",
            "Vendor: Vendors manage their own products, inventory, and incoming orders. They can add new products, update product status, adjust stock, and process customer orders.",
            "Customer: Customers can browse products, search and filter items, add products to cart, place orders, and track delivery status from their dashboard.",
        ],
    ),
    (
        "Core Features",
        [
            "Smart Commerce includes a modern customer-facing storefront where users can browse products, view product details, add items to cart, and complete checkout. After placing an order, customers can track the order status through stages such as pending, processing, shipped, and delivered.",
            "The admin dashboard provides key business information such as total revenue, number of orders, active products, customers, recent orders, inventory alerts, top products, and audit logs. This helps admins understand the business condition quickly.",
            "The vendor dashboard allows vendors to manage products and orders independently. Vendors can add products, publish or draft them, manage stock, and update delivery progress.",
            "The platform also includes role-based access control, meaning users can only access the pages and actions allowed for their role. This improves security and keeps the system organized.",
        ],
    ),
    (
        "Demand Forecasting Module",
        [
            "One of the important intelligent features of the project is demand forecasting. The backend collects product sales history and sends it to a Python forecasting script. The script analyzes recent sales, total sold units, product trends, and keywords to predict future demand.",
            "The forecast provides predicted units for the next 7, 14, and 21 days. It also gives a trend label such as rising, stable, or cooling, along with a confidence score. This helps admins and vendors decide which products need restocking before they run out.",
        ],
    ),
    (
        "Technology Stack",
        [
            "The frontend is built with Next.js, React, TypeScript, Tailwind CSS, and shadcn/ui. It provides a clean, responsive, and professional user interface.",
            "The backend is built with Node.js, Express.js, TypeScript, and MongoDB with Mongoose. It handles authentication, authorization, products, orders, users, vendors, analytics, and forecasting.",
            "The database uses MongoDB Atlas, where collections such as users, roles, products, categories, inventory, orders, and audit logs are stored.",
            "Authentication is handled using JWT with httpOnly cookies, which improves security by protecting user sessions.",
            "The project also supports Docker and Docker Compose, making it easier to run the frontend and backend services together.",
        ],
    ),
    (
        "System Workflow",
        [
            "A customer visits the storefront, browses products, adds items to cart, and places an order through checkout. After the order is created, the system saves the order details in the database and starts tracking the order from the pending stage.",
            "Admins or vendors can update the order status. Each update creates a tracking event, so the customer can see the latest progress. At the same time, the admin dashboard shows recent orders, inventory alerts, and business metrics.",
            "For demand forecasting, sales data is analyzed and converted into forecast results. These results help the business identify products with high future demand and plan stock accordingly.",
        ],
    ),
    (
        "Business Value",
        [
            "Smart Commerce improves business operations by bringing all important e-commerce activities into one platform. It reduces manual work, improves order tracking, helps prevent low-stock problems, and gives admins better visibility over the business.",
            "The demand forecasting feature adds extra value because it helps the business make decisions based on data instead of guessing. This can reduce missed sales, improve customer satisfaction, and support better inventory planning.",
        ],
    ),
    (
        "Conclusion",
        [
            "Smart Commerce is a complete e-commerce management system with modern technology and intelligent features. It provides a smooth shopping experience for customers, useful tools for vendors, and powerful management features for admins.",
            "The project successfully combines storefront functionality, secure role-based access, order tracking, inventory monitoring, analytics, and demand forecasting into one professional platform. Future improvements could include online payment integration, AI product recommendations, advanced reporting, automated restocking suggestions, and deployment to a live cloud platform.",
        ],
    ),
]


def rgb(color: tuple[float, float, float]) -> str:
    return f"{color[0]:.3f} {color[1]:.3f} {color[2]:.3f}"


def pdf_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def text_width_estimate(text: str, size: int) -> float:
    total = 0.0
    for ch in text:
        if ch in "il.,' ":
            total += 0.28
        elif ch in "MW":
            total += 0.90
        elif ch.isupper():
            total += 0.68
        else:
            total += 0.52
    return total * size


def wrap_line(text: str, size: int, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if text_width_estimate(candidate, size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


class PdfBuilder:
    def __init__(self) -> None:
        self.pages: list[list[str]] = []
        self.current: list[str] = []
        self.y = TOP_Y
        self.page_no = 0
        self.new_page()

    def new_page(self) -> None:
        if self.current:
            self.footer()
            self.pages.append(self.current)
        self.page_no += 1
        self.current = []
        self.y = TOP_Y
        self.header()

    def header(self) -> None:
        self.current.append(f"q {rgb(TEAL)} rg 0 {PAGE_H - 18} {PAGE_W} 18 re f Q")
        self.current.append(f"q {rgb(LIGHT)} rg 0 {PAGE_H - 82} {PAGE_W} 64 re f Q")
        self.text("Smart Commerce", MARGIN_X, PAGE_H - 54, 18, "F2", NAVY)
        self.text("Project Overview", PAGE_W - MARGIN_X - 130, PAGE_H - 52, 10, "F1", MUTED)
        self.y = TOP_Y

    def footer(self) -> None:
        self.text(f"Page {self.page_no}", PAGE_W - MARGIN_X - 36, 38, 9, "F1", MUTED)

    def ensure_space(self, amount: int) -> None:
        if self.y - amount < BOTTOM_Y:
            self.new_page()

    def text(self, value: str, x: int, y: int, size: int, font: str, color: tuple[float, float, float]) -> None:
        safe = pdf_escape(value)
        self.current.append(f"BT /{font} {size} Tf {rgb(color)} rg {x} {y} Td ({safe}) Tj ET")

    def paragraph(self, text: str, size: int = 11, leading: int = 16, indent: int = 0) -> None:
        lines = wrap_line(text, size, PAGE_W - (MARGIN_X * 2) - indent)
        self.ensure_space(len(lines) * leading + 10)
        for line in lines:
            self.text(line, MARGIN_X + indent, self.y, size, "F1", INK)
            self.y -= leading
        self.y -= 6

    def section(self, title: str, paragraphs: list[str]) -> None:
        self.ensure_space(54)
        self.text(title, MARGIN_X, self.y, 15, "F2", NAVY)
        self.y -= 8
        self.current.append(f"q {rgb(TEAL)} rg {MARGIN_X} {self.y} 44 2 re f Q")
        self.y -= 20
        for paragraph in paragraphs:
            self.paragraph(paragraph)
        self.y -= 2

    def finish(self) -> list[list[str]]:
        self.footer()
        self.pages.append(self.current)
        return self.pages


def build_pdf(path: Path) -> None:
    builder = PdfBuilder()
    builder.text("Smart Commerce: AI-Driven Smart E-Commerce Platform", MARGIN_X, builder.y, 22, "F2", NAVY)
    builder.y -= 34
    builder.paragraph(
        "A complete overview of the final project, including the problem, solution, users, features, workflow, technology stack, demand forecasting module, and business value.",
        size=12,
        leading=18,
    )
    builder.y -= 8

    for title, paragraphs in overview:
        builder.section(title, paragraphs)

    pages = builder.finish()

    objects: list[bytes] = []
    page_ids: list[int] = []
    content_ids: list[int] = []

    def add_object(data: str | bytes) -> int:
        objects.append(data.encode("latin-1") if isinstance(data, str) else data)
        return len(objects)

    catalog_id = add_object("<< /Type /Catalog /Pages 2 0 R >>")
    pages_id = add_object("PAGES_PLACEHOLDER")
    font_regular_id = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    font_bold_id = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

    for page_ops in pages:
        stream = "\n".join(page_ops).encode("latin-1")
        content_id = add_object(
            b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream"
        )
        page_id = add_object(
            f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 {PAGE_W} {PAGE_H}] "
            f"/Resources << /Font << /F1 {font_regular_id} 0 R /F2 {font_bold_id} 0 R >> >> "
            f"/Contents {content_id} 0 R >>"
        )
        content_ids.append(content_id)
        page_ids.append(page_id)

    kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
    objects[pages_id - 1] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode("latin-1")

    output = bytearray()
    output.extend(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for index, obj in enumerate(objects, 1):
        offsets.append(len(output))
        output.extend(f"{index} 0 obj\n".encode("ascii"))
        output.extend(obj)
        output.extend(b"\nendobj\n")

    xref_pos = len(output)
    output.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    output.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    output.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode(
            "ascii"
        )
    )

    path.write_bytes(output)


def main() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    build_pdf(OUT_FILE)
    print(OUT_FILE)


if __name__ == "__main__":
    main()
