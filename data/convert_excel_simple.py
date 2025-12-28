#!/usr/bin/env python3
"""
Simple Excel to JSON converter for M'Cheyne Bible Reading Plan.
This version inspects the Excel structure first, then converts.
"""

import pandas as pd
import json
import sys
from pathlib import Path

def inspect_excel(excel_path):
    """Inspect Excel file structure."""
    print(f"\n=== Inspecting Excel File ===")
    excel_file = pd.ExcelFile(excel_path)

    print(f"Number of sheets: {len(excel_file.sheet_names)}")
    print(f"Sheet names: {excel_file.sheet_names}\n")

    for sheet_name in excel_file.sheet_names:
        print(f"\n--- Sheet: {sheet_name} ---")
        df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)
        print(f"Shape: {df.shape} (rows, columns)")
        print(f"\nFirst 5 rows, first 5 columns:")
        print(df.iloc[:5, :5].to_string())
        print(f"\nColumn headers (first row):")
        print(df.iloc[0, :].tolist())

def convert_with_inspection(excel_path, output_path):
    """Convert after showing what we're working with."""

    # First inspect
    inspect_excel(excel_path)

    print("\n" + "="*60)
    print("Based on inspection above, attempting conversion...")
    print("="*60 + "\n")

    excel_file = pd.ExcelFile(excel_path)
    plans = {}

    for sheet_name in excel_file.sheet_names:
        print(f"\nProcessing: {sheet_name}")

        # Read without header first
        df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)

        # Determine plan type
        plan_type = None
        if '48' in sheet_name or '4' in sheet_name.lower() and 'year' in sheet_name.lower():
            plan_type = '48_month'
        elif '24' in sheet_name or '2' in sheet_name.lower() and 'year' in sheet_name.lower():
            plan_type = '24_month'
        elif '12' in sheet_name or '1' in sheet_name.lower() and 'year' in sheet_name.lower():
            plan_type = '12_month'

        if not plan_type:
            print(f"  Skipping - couldn't determine plan type")
            continue

        readings = []

        # Try different parsing strategies

        # Strategy 1: First row is months, first column is days
        print(f"  Trying Strategy 1: Row 0 = months, Column 0 = days")
        month_row = df.iloc[0, 1:].tolist()  # Skip first cell

        for row_idx in range(1, len(df)):
            day = df.iloc[row_idx, 0]

            # Skip if day is not a number
            if pd.isna(day):
                continue

            try:
                day_num = int(day)
            except (ValueError, TypeError):
                continue

            # Process each month
            for col_idx, month_val in enumerate(month_row, 1):
                if pd.isna(month_val):
                    continue

                reading_val = df.iloc[row_idx, col_idx]

                if pd.isna(reading_val) or str(reading_val).strip() == '':
                    continue

                # Determine month number
                month_num = col_idx  # Assuming columns go Jan=1, Feb=2, etc.

                readings.append({
                    'month': month_num,
                    'day': day_num,
                    'month_name': str(month_val).strip()[:3],  # First 3 chars
                    'reading': str(reading_val).strip()
                })

        if readings:
            plans[plan_type] = {
                'name': sheet_name,
                'description': get_plan_description(plan_type),
                'total_days': len(readings),
                'readings': readings
            }
            print(f"  ✓ Extracted {len(readings)} readings")
        else:
            print(f"  ✗ No readings found - Excel structure may be different")

    # Create output
    output_data = {
        'title': "M'Cheyne Bible Reading Plan",
        'description': "Daily Bible reading plans for completing the entire Bible",
        'plans': plans,
        'metadata': {
            'source': Path(excel_path).name,
            'conversion_date': pd.Timestamp.now().isoformat()
        }
    }

    # Write to JSON
    output_file = Path(output_path)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*60}")
    print(f"Conversion complete!")
    print(f"Output: {output_file}")
    print(f"\nSummary:")
    for plan_type, plan_data in plans.items():
        print(f"  {plan_data['name']}: {plan_data['total_days']} readings")
    print(f"{'='*60}\n")

def get_plan_description(plan_type):
    """Get description for each plan type."""
    descriptions = {
        '12_month': 'Complete the Bible in 1 year with 4 chapters per day',
        '24_month': 'Complete the Bible in 2 years with 2 chapters per day',
        '48_month': 'Complete the Bible in 4 years with a more relaxed pace'
    }
    return descriptions.get(plan_type, '')

if __name__ == '__main__':
    excel_path = Path(__file__).parent.parent / "Scaled M'Cheyne Bible Reading Plan.xlsx"
    output_path = Path(__file__).parent / 'reading_plan.json'

    if len(sys.argv) > 1:
        excel_path = Path(sys.argv[1])
    if len(sys.argv) > 2:
        output_path = Path(sys.argv[2])

    if not excel_path.exists():
        print(f"Error: Excel file not found at {excel_path}", file=sys.stderr)
        sys.exit(1)

    convert_with_inspection(excel_path, output_path)
