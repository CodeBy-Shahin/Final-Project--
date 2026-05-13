import json
import math
import re
import sys


STOP_WORDS = {
    "and",
    "for",
    "the",
    "with",
    "pcs",
    "kg",
    "ml",
    "ltr",
    "cm",
    "everyday",
}


def tokenize(text):
    tokens = re.findall(r"[a-zA-Z]+", text.lower())
    return [token for token in tokens if len(token) > 2 and token not in STOP_WORDS]


def weighted_average(values):
    if not values:
        return 0

    weight_total = 0
    value_total = 0

    for index, value in enumerate(values, start=1):
        weight = index
        value_total += value * weight
        weight_total += weight

    return value_total / weight_total if weight_total else 0


def trend_label(values):
    if len(values) < 2:
        return "stable"

    first_half = values[: max(1, len(values) // 2)]
    second_half = values[len(values) // 2 :]
    first_avg = sum(first_half) / len(first_half)
    second_avg = sum(second_half) / len(second_half)

    if second_avg > first_avg * 1.15:
        return "rising"
    if second_avg < first_avg * 0.85:
        return "cooling"
    return "stable"


def confidence(values, total_sold):
    non_zero = len([value for value in values if value > 0])
    coverage = non_zero / len(values) if values else 0
    volume = min(total_sold / 20, 1)
    score = 45 + coverage * 30 + volume * 25
    return round(min(score, 95))


def forecast_product(product):
    history = product.get("history", [])
    values = [max(0, int(item.get("units", 0))) for item in history]
    total_sold = sum(values)
    recent_values = values[-3:] if len(values) >= 3 else values
    recent_sold = sum(recent_values)
    weighted = weighted_average(values)
    trend = trend_label(values)

    multiplier = 1.18 if trend == "rising" else 0.88 if trend == "cooling" else 1
    keyword_boost = 1
    keywords = tokenize(product.get("name", ""))

    if {"fresh", "premium", "fastcharge", "emergency"} & set(keywords):
        keyword_boost += 0.08
    if {"daily", "family", "compact"} & set(keywords):
        keyword_boost += 0.05

    predicted_units = max(0, math.ceil(weighted * multiplier * keyword_boost))

    if total_sold > 0 and predicted_units == 0:
        predicted_units = 1

    return {
        "productId": product.get("productId"),
        "keywords": keywords[:4],
        "totalSold": total_sold,
        "recentSold": recent_sold,
        "predictedUnits": predicted_units,
        "trend": trend,
        "confidence": confidence(values, total_sold),
        "forecast": [
            {"label": "Next 7 days", "units": predicted_units},
            {"label": "Next 14 days", "units": math.ceil(predicted_units * 1.08)},
            {"label": "Next 21 days", "units": math.ceil(predicted_units * 1.15)},
        ],
    }


def main():
    payload = json.load(sys.stdin)
    products = payload.get("products", [])
    predictions = [forecast_product(product) for product in products]
    predictions.sort(
        key=lambda item: (item["predictedUnits"], item["recentSold"], item["totalSold"]),
        reverse=True,
    )
    print(json.dumps({"predictions": predictions}))


if __name__ == "__main__":
    main()
