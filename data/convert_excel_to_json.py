#!/usr/bin/env python3
"""
Convert M'Cheyne Bible Reading Plan Excel file to JSON format.
Handles 12-month (4 chapters/day), 24-month (2 chapters/day), and 48-month plans.
"""

import pandas as pd
import json
import sys
from pathlib import Path

def convert_excel_to_json(excel_path, output_path):
    """
    Convert the M'Cheyne reading plan Excel file to JSON.

    Expected structure:
    - Sheets: 12-month, 24-month, 48-month plans
    - Columns: Months (Jan, Feb, Mar, etc.)
    - Rows: Days of month (1-31)
    - Cells: Bible reading references
    """

    try:
        # Read all sheets from the Excel file
        excel_file = pd.ExcelFile(excel_path)

        plans = {}

        # Map common sheet name variations to plan types
        sheet_mapping = {
            '12': '12_month',
            '24': '24_month',
            '48': '48_month',
            '1_year': '12_month',
            '2_year': '24_month',
            '4_year': '48_month',
        }

        for sheet_name in excel_file.sheet_names:
            print(f"Processing sheet: {sheet_name}")
            df = pd.read_excel(excel_file, sheet_name=sheet_name)

            # Determine plan type from sheet name
            plan_type = None
            for key, value in sheet_mapping.items():
                if key.lower() in sheet_name.lower():
                    plan_type = value
                    break

            if not plan_type:
                print(f"  Skipping sheet '{sheet_name}' - couldn't determine plan type")
                continue

            # Process the data
            readings = []

            # Assuming first column is day numbers, rest are months
            months = df.columns[1:].tolist()  # Skip first column (day numbers)

            for month_idx, month in enumerate(months, 1):
                # Clean month name
                month_name = str(month).strip()

                for day_idx, row in df.iterrows():
                    try:
                        day = int(row.iloc[0])  # First column is day number
                        reading = row[month]

                        # Skip empty readings or NaN
                        if pd.isna(reading) or str(reading).strip() == '':
                            continue

                        # Parse the reading (might be comma-separated for multiple chapters)
                        reading_str = str(reading).strip()

                        readings.append({
                            'month': month_idx,
                            'day': day,
                            'month_name': month_name,
                            'reading': reading_str,
                            'day_of_year': calculate_day_of_year(month_idx, day)
                        })
                    except (ValueError, KeyError) as e:
                        # Skip rows that don't have valid day numbers
                        continue

            plans[plan_type] = {
                'name': f'{plan_type.replace("_", " ").title()} Plan',
                'description': get_plan_description(plan_type),
                'total_days': len(readings),
                'readings': sorted(readings, key=lambda x: x['day_of_year'])
            }

        # Create the final JSON structure
        output_data = {
            'title': "M'Cheyne Bible Reading Plan",
            'description': "Daily Bible reading plans for completing the entire Bible",
            'plans': plans,
            'metadata': {
                'source': 'Scaled M\'Cheyne Bible Reading Plan.xlsx',
                'conversion_date': pd.Timestamp.now().isoformat()
            }
        }

        # Write to JSON file
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        print(f"\nConversion successful!")
        print(f"Output written to: {output_file}")
        print(f"\nPlans converted:")
        for plan_type, plan_data in plans.items():
            print(f"  - {plan_data['name']}: {plan_data['total_days']} readings")

        return output_data

    except Exception as e:
        print(f"Error converting Excel file: {e}", file=sys.stderr)
        raise

def calculate_day_of_year(month, day):
    """Calculate approximate day of year (for non-leap year)."""
    days_in_months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    if month > 12 or month < 1:
        return 0
    return days_in_months[month - 1] + day

def get_plan_description(plan_type):
    """Get description for each plan type."""
    descriptions = {
        '12_month': 'Complete the Bible in 1 year with 4 chapters per day',
        '24_month': 'Complete the Bible in 2 years with 2 chapters per day',
        '48_month': 'Complete the Bible in 4 years with a more relaxed pace'
    }
    return descriptions.get(plan_type, '')

if __name__ == '__main__':
    # Default paths
    excel_path = Path(__file__).parent.parent / "Scaled M'Cheyne Bible Reading Plan.xlsx"
    output_path = Path(__file__).parent / 'reading_plan.json'

    if len(sys.argv) > 1:
        excel_path = Path(sys.argv[1])
    if len(sys.argv) > 2:
        output_path = Path(sys.argv[2])

    if not excel_path.exists():
        print(f"Error: Excel file not found at {excel_path}", file=sys.stderr)
        print("\nUsage: python convert_excel_to_json.py [excel_path] [output_path]")
        sys.exit(1)

    print(f"Converting: {excel_path}")
    print(f"Output to: {output_path}\n")

    convert_excel_to_json(excel_path, output_path)
