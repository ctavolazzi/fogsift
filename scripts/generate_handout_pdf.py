#!/usr/bin/env python3
"""
Generate FogSift handout PDF using WAFT two-page layout.

Usage:
    python3 scripts/generate_handout_pdf.py
    python3 scripts/generate_handout_pdf.py --no-open
    python3 scripts/generate_handout_pdf.py --output fogsift_handout.pdf
"""
import argparse
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Generate FogSift handout PDF")
    parser.add_argument("--no-open", action="store_true", help="Do not open PDF after generation")
    parser.add_argument("--output", "-o", default="fogsift_handout.pdf", help="Output filename")
    args = parser.parse_args()

    project_root = Path(__file__).parent.parent
    content_path = project_root / "src" / "content" / "handout_content.md"
    logo_path = project_root / "src" / "assets" / "logo-color-transparent.png"
    output_path = project_root / args.output

    if not content_path.exists():
        print(f"Error: Content file not found: {content_path}")
        return 1

    if not logo_path.exists():
        print(f"Error: Logo file not found: {logo_path}")
        return 1

    try:
        from waft import PDF
    except ImportError:
        print("Error: WAFT not installed.")
        print("Install with: pip install waft")
        print("Or if using uv: uv pip install waft")
        return 1

    try:
        content = content_path.read_text()
        content = content.replace("../assets/logo-color-transparent.png", logo_path.as_uri())

        print(f"Generating handout PDF from: {content_path}")
        pdf = PDF.two_page(
            content=content,
            title="FogSift - How It Works",
            style="clinical_standard",
            output_path=output_path,
        )
        pdf_path = pdf.save(output_path=output_path, open_pdf=not args.no_open)

        print(f"Generated: {pdf_path}")
        print(f"Size: {pdf_path.stat().st_size:,} bytes")

    except Exception as e:
        print(f"Error generating PDF: {e}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
