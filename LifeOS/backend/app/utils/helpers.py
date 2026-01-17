from datetime import date, datetime, timedelta
from typing import List, Optional

def get_date_range(days: int) -> tuple:
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    return start_date, end_date

def format_date(d: date) -> str:
    return d.strftime("%Y-%m-%d")

def parse_date(date_str: str) -> Optional[date]:
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None

def get_week_dates() -> List[date]:
    today = date.today()
    start = today - timedelta(days=today.weekday())
    return [start + timedelta(days=i) for i in range(7)]

def get_month_dates() -> List[date]:
    today = date.today()
    start = date(today.year, today.month, 1)
    dates = []
    current = start
    while current.month == today.month:
        dates.append(current)
        current += timedelta(days=1)
    return dates

def calculate_percentage(value: float, total: float) -> float:
    if total == 0:
        return 0
    return round((value / total) * 100, 2)

def clamp(value: float, min_val: float, max_val: float) -> float:
    return max(min_val, min(value, max_val))

def safe_divide(numerator: float, denominator: float, default: float = 0) -> float:
    if denominator == 0:
        return default
    return numerator / denominator
