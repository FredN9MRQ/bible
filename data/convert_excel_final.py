#!/usr/bin/env python3
"""
Final Excel to JSON converter for M'Cheyne Bible Reading Plan.
Works with the actual Excel structure discovered.
"""

import pandas as pd
import json
import re
from pathlib import Path

def convert_excel(excel_path, output_path):
    """Convert M'Cheyne Excel file to JSON."""

    print(f"\nConverting: {excel_path}")
    print(f"Output to: {output_path}\n")

    excel_file = pd.ExcelFile(excel_path)
    plans = {}

    for sheet_name in excel_file.sheet_names:
        print(f"Processing: {sheet_name}")

        # Read without header
        df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)

        # Determine plan type
        plan_type = None
        if '48' in sheet_name:
            plan_type = '48_month'
        elif '24' in sheet_name:
            plan_type = '24_month'
        elif '12' in sheet_name:
            plan_type = '12_month'

        if not plan_type:
            print(f"  Skipping - couldn't determine plan type")
            continue

        readings = []

        # Row 0 contains month names
        # Rows 1+ contain readings in format "1: Genesis 1, Matthew 1..."

        # Get month names from row 0 (skip first 2 columns)
        months = []
        for col_idx in range(2, len(df.columns)):
            month_val = df.iloc[0, col_idx]
            if pd.isna(month_val):
                break
            # Extract month name (e.g., "January of 26" -> "January")
            month_str = str(month_val).strip()
            month_name = month_str.split()[0] if month_str else f"Month{col_idx-1}"
            months.append((col_idx, month_name))

        # Process each row (day)
        for row_idx in range(1, min(32, len(df))):  # Days 1-31
            for col_idx, month_name in months:
                cell_value = df.iloc[row_idx, col_idx]

                if pd.isna(cell_value):
                    continue

                cell_str = str(cell_value).strip()
                if not cell_str:
                    continue

                # Extract day number and reading
                # Format: "1: Genesis 1, Matthew 1, Ezra 1, Acts 1"
                match = re.match(r'(\d+):\s*(.+)', cell_str)
                if match:
                    day_num = int(match.group(1))
                    reading_text = match.group(2).strip()

                    # Determine month number
                    month_map = {
                        'january': 1, 'february': 2, 'march': 3, 'april': 4,
                        'may': 5, 'june': 6, 'july': 7, 'august': 8,
                        'september': 9, 'october': 10, 'november': 11, 'december': 12
                    }
                    month_num = month_map.get(month_name.lower(), 1)

                    readings.append({
                        'month': month_num,
                        'day': day_num,
                        'month_name': month_name,
                        'reading': reading_text
                    })

        if readings:
            plans[plan_type] = {
                'name': f'{plan_type.replace("_", " ").title()} Plan',
                'description': get_plan_description(plan_type),
                'total_days': len(readings),
                'readings': readings
            }
            print(f"  Success: {len(readings)} readings extracted")
        else:
            print(f"  Warning: No readings found")

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

    print(f"\nConversion successful!")
    print(f"Output: {output_file}\n")
    print("Plans converted:")
    for plan_type, plan_data in plans.items():
        print(f"  - {plan_data['name']}: {plan_data['total_days']} readings")
    print()

def get_plan_description(plan_type):
    """Get description for each plan type."""
    descriptions = {
        '12_month': 'Complete the Bible in 1 year with 4 chapters per day',
        '24_month': 'Complete the Bible in 2 years with 2 chapters per day',
        '48_month': 'Complete the Bible in 4 years with a more relaxed pace'
    }
    return descriptions.get(plan_type, '')

if __name__ == '__main__':
    import sys

    excel_path = Path(__file__).parent.parent / "Scaled M'Cheyne Bible Reading Plan.xlsx"
    output_path = Path(__file__).parent / 'reading_plan.json'

    if len(sys.argv) > 1:
        excel_path = Path(sys.argv[1])
    if len(sys.argv) > 2:
        output_path = Path(sys.argv[2])

    if not excel_path.exists():
        print(f"Error: Excel file not found at {excel_path}", file=sys.stderr)
        sys.exit(1)

    convert_excel(excel_path, output_path)
