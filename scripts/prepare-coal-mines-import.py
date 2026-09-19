"""Convert the Kaggle CSV into the Supabase staging-table format."""

import csv
import sys
from pathlib import Path


OUTPUT_FIELDS = [
    "source_row",
    "mine_name",
    "state",
    "district",
    "production_mt",
    "owner_code",
    "owner_name",
    "commodity",
    "ownership_code",
    "mine_type",
    "latitude",
    "longitude",
    "source_url",
    "coordinate_accuracy",
]


def clean(value: str | None) -> str:
    return (value or "").strip()


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: python scripts/prepare-coal-mines-import.py input.csv output.csv")
        return 2

    input_path, output_path = map(Path, sys.argv[1:])
    with input_path.open(newline="", encoding="utf-8-sig") as source:
        reader = csv.DictReader(source)
        with output_path.open("w", newline="", encoding="utf-8") as target:
            writer = csv.DictWriter(target, fieldnames=OUTPUT_FIELDS)
            writer.writeheader()
            for row in reader:
                source_row = int(clean(row.get("SL No.")) or clean(row.get("index")) or "0")
                latitude = float(clean(row.get("Latitude ")))
                longitude = float(clean(row.get("Longitude ")))
                writer.writerow(
                    {
                        "source_row": source_row,
                        "mine_name": clean(row.get("Mine Name")),
                        "state": clean(row.get("State/UT Name")),
                        "district": clean(row.get("District Name")),
                        "production_mt": clean(row.get("Coal/ Lignite Production (MT) (2019-2020)")),
                        "owner_code": clean(row.get("Coal Mine Owner Name")),
                        "owner_name": clean(row.get("Coal Mine Owner Full Name")),
                        "commodity": clean(row.get("Coal/Lignite")),
                        "ownership_code": clean(row.get("Govt Owned/Private")),
                        "mine_type": clean(row.get("Type of Mine (OC/UG/Mixed)")),
                        "latitude": latitude,
                        "longitude": longitude,
                        "source_url": clean(row.get("Source")),
                        "coordinate_accuracy": clean(row.get("Accuracy (exact vs approximate)")),
                    }
                )
    print(f"Wrote {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
