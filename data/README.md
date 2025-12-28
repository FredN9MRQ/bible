# Data Conversion

This directory contains the script to convert the M'Cheyne Bible Reading Plan Excel file to JSON format.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run conversion
python convert_excel_to_json.py
```

The script will create `reading_plan.json` containing all three plans (12, 24, and 48 month).

## Manual Usage

```bash
python convert_excel_to_json.py "path/to/excel/file.xlsx" "output/path.json"
```
