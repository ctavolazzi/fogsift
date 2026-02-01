#!/usr/bin/env python3
"""
Generate FogSift Services PDF using WAFT.

Usage:
    python3 scripts/generate_fogsift_pdf.py
    python3 scripts/generate_fogsift_pdf.py --no-open
    python3 scripts/generate_fogsift_pdf.py --output custom_name.pdf
"""
import argparse
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Generate FogSift Services PDF")
    parser.add_argument("--no-open", action="store_true", help="Don't open PDF after generation")
    parser.add_argument("--output", "-o", default="fogsift_services.pdf", help="Output filename")
    args = parser.parse_args()

    # Paths
    project_root = Path(__file__).parent.parent
    content_path = project_root / "src" / "content" / "fogsift_services.md"
    output_path = project_root / args.output

    # Validate content exists
    if not content_path.exists():
        print(f"Error: Content file not found: {content_path}")
        print("Create the content file first.")
        return 1

    # Import WAFT
    try:
        from waft import PDF
    except ImportError:
        print("Error: WAFT not installed.")
        print("Install with: pip install waft")
        return 1

    # Generate PDF
    content = content_path.read_text()
    pdf = PDF.from_markdown(
        content,
        title="FogSift Services",
        style="premium",
        output_path=output_path
    )
    pdf.save(str(output_path))

    print(f"Generated: {output_path}")
    print(f"Size: {output_path.stat().st_size:,} bytes")

    if not args.no_open:
        pdf.open()

    return 0

if __name__ == "__main__":
    exit(main())
