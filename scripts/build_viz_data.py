"""Build small, anonymous aggregates for the portfolio's visual studies."""

import csv
import json
import zipfile
from collections import Counter, defaultdict
from io import TextIOWrapper
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BA_CSV = Path.home() / "Desktop" / "Tableau Project" / "Datasets" / "ba_reviews.csv"
BIRD_TWBX = (
    Path.home()
    / "Documents"
    / "My Tableau Repository"
    / "Workbooks"
    / "Business Intelligence"
    / "Vaibhav_Dighe_BI_Assignment_1(Bird_Strikes).twbx"
)


def parse_int(value):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


ba = defaultdict(lambda: {"count": 0, "rating_sum": 0, "rating_count": 0, "yes": 0})
with BA_CSV.open(encoding="utf-8-sig", newline="") as stream:
    for row in csv.DictReader(stream):
        seat = row["seat_type"].strip() or "Unspecified"
        traveler = row["traveller_type"].strip() or "Unspecified"
        for key in ("All", seat, f"traveler:{traveler}"):
            item = ba[key]
            item["count"] += 1
            rating = parse_int(row["rating"])
            if rating is not None and 1 <= rating <= 10:
                item["rating_sum"] += rating
                item["rating_count"] += 1
            if row["recommended"].strip().lower() == "yes":
                item["yes"] += 1

bird_years = Counter()
bird_phases = Counter()
bird_damage = Counter()
bird_total = 0
with zipfile.ZipFile(BIRD_TWBX) as archive:
    csv_name = next(name for name in archive.namelist() if name.lower().endswith(".csv"))
    with TextIOWrapper(archive.open(csv_name), encoding="utf-8-sig", errors="replace", newline="") as stream:
        for row in csv.DictReader(stream):
            year = parse_int(row.get("Incident Year"))
            if year is None or not 1990 <= year <= 2020:
                continue
            bird_total += 1
            bird_years[year] += 1
            phase = (row.get("Phase Of Flight") or "").strip().title() or "Unspecified"
            bird_phases[phase] += 1
            damage = (row.get("Damage Level") or "").strip().upper() or "Unspecified"
            bird_damage[damage] += 1

payload = {
    "ba": {
        "source": "British Airways Analysis Dashboard.twb and ba_reviews.csv",
        "groups": {key: value for key, value in sorted(ba.items())},
    },
    "bird": {
        "source": "Vaibhav_Dighe_BI_Assignment_1(Bird_Strikes).twbx",
        "total": bird_total,
        "years": [{"year": year, "count": bird_years[year]} for year in range(1990, 2021)],
        "phases": dict(bird_phases.most_common(8)),
        "damage_levels": dict(bird_damage),
    },
}

target = ROOT / "dist" / "assets" / "viz-data.json"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
print(f"Wrote {target} ({target.stat().st_size:,} bytes)")
print(f"British Airways reviews: {ba['All']['count']:,}; bird strike reports: {bird_total:,}")
