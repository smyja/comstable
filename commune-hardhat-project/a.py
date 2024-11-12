import requests

NVDA_PRICE_ID = "0xb1073854ed24cbc755dc527418f52b7d271f6cc967bbf8d8129112b18860a593"
url = f"https://hermes.pyth.network/api/latest_price_feeds?ids[]={NVDA_PRICE_ID}"

response = requests.get(url)
data = response.json()

if data:
    price_feed = data[0]
    price = float(price_feed['price']['price'])
    confidence = float(price_feed['price']['conf'])
    print(f"NVIDIA Stock Price: ${price}")
    print(f"Confidence: ±${confidence}")