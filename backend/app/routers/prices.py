import time
from typing import Dict, List, Optional
import requests

import yfinance as yf
from fastapi import APIRouter, HTTPException, Query

from app.core.nse_catalog import search_nse_catalog

router = APIRouter(prefix="/prices", tags=["prices"])

# Cache for single quote checks
_CACHE: Dict[str, tuple] = {}
_CACHE_TTL_SECONDS = 15

# Cache for stock details
_DETAILS_CACHE: Dict[str, tuple] = {}
_DETAILS_TTL_SECONDS = 300


# Alias map for rebranded, demerged, or multi-class tickers
TICKER_ALIASES = {
    "TATAMOTORS": "TMCV.NS",
    "TATAMOTOR": "TMCV.NS",
    "TATA MOTORS": "TMCV.NS",
    "TMCV": "TMCV.NS",
    "TMPV": "TMPV.NS",
    "M&M": "M&M.NS",
    "BAJAJ-AUTO": "BAJAJ-AUTO.NS",
    "L&T": "LT.NS",
    "MCDOWELL-N": "UNITDSPR.NS",
}


def _yf_symbol(ticker: str) -> str:
    """Format symbol for yfinance. US stocks stay as-is;
    Indian tickers get the .NS suffix or resolve via alias."""
    ticker = ticker.upper().strip()
    if ticker in TICKER_ALIASES:
        return TICKER_ALIASES[ticker]
    if "." in ticker:
        return ticker
    # US Major stocks list
    us_stocks = {
        "AAPL", "MSFT", "GOOGL", "GOOG", "AMZN", "NVDA", "TSLA", "META", "BRK.B",
        "NFLX", "AMD", "INTC", "PYPL", "COIN", "DIS", "NKE", "SBUX", "UBER"
    }
    if ticker in us_stocks:
        return ticker
    return f"{ticker}.NS"


def _fetch_one(ticker: str) -> dict:
    now = time.time()
    cached = _CACHE.get(ticker)
    if cached and now - cached[0] < _CACHE_TTL_SECONDS:
        return cached[1]

    symbol = _yf_symbol(ticker)
    stock = yf.Ticker(symbol)

    last_price = None
    prev_close = None

    try:
        fast = stock.fast_info
        last_price = fast.get("lastPrice") or fast.get("last_price")
        prev_close = fast.get("previousClose") or fast.get("previous_close")
    except Exception:
        pass

    if last_price is None:
        try:
            hist = stock.history(period="2d")
            if not hist.empty:
                last_price = float(hist["Close"].iloc[-1])
                prev_close = float(hist["Close"].iloc[-2]) if len(hist) > 1 else last_price
        except Exception:
            pass

    # Fallback search if ticker symbol was changed or demerged
    if last_price is None:
        try:
            results = yf.Search(ticker, max_results=3).quotes
            for r in results:
                alt = r.get("symbol")
                if alt and alt != symbol:
                    alt_stock = yf.Ticker(alt)
                    try:
                        fast = alt_stock.fast_info
                        alt_lp = fast.get("lastPrice") or fast.get("last_price")
                        alt_pc = fast.get("previousClose") or fast.get("previous_close")
                    except Exception:
                        alt_lp, alt_pc = None, None
                    if alt_lp is None:
                        alt_hist = alt_stock.history(period="2d")
                        if not alt_hist.empty:
                            alt_lp = float(alt_hist["Close"].iloc[-1])
                            alt_pc = float(alt_hist["Close"].iloc[-2]) if len(alt_hist) > 1 else alt_lp
                    if alt_lp is not None:
                        symbol = alt
                        stock = alt_stock
                        last_price = alt_lp
                        prev_close = alt_pc
                        break
        except Exception:
            pass

    # Direct Yahoo v8 chart fallback (unblocked on cloud datacenters)
    if last_price is None:
        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=2d"
            resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=6)
            if resp.status_code == 200:
                data_json = resp.json().get("chart", {}).get("result", [])
                if data_json and "meta" in data_json[0]:
                    meta = data_json[0]["meta"]
                    last_price = meta.get("regularMarketPrice")
                    prev_close = meta.get("chartPreviousClose") or last_price
        except Exception:
            pass

    if last_price is None:
        raise HTTPException(status_code=404, detail=f"Price data not found for '{ticker}'")

    change = last_price - prev_close if prev_close else 0.0
    change_pct = (change / prev_close * 100) if prev_close else 0.0

    data = {
        "ticker": ticker.upper(),
        "symbol": symbol,
        "price": round(float(last_price), 2),
        "previous_close": round(float(prev_close), 2) if prev_close else None,
        "change": round(float(change), 2),
        "change_pct": round(float(change_pct), 2),
    }
    _CACHE[ticker] = (now, data)
    return data


@router.get("/nse/catalog")
def get_nse_catalog_endpoint(
    q: Optional[str] = Query("", description="Search ticker or name"),
    sector: Optional[str] = Query("", description="Sector filter"),
    limit: int = Query(50, ge=1, le=850),
    offset: int = Query(0, ge=0),
):
    """Returns catalog of 842+ NSE stocks with pagination & search filtering."""
    return search_nse_catalog(query=q or "", sector=sector or "", limit=limit, offset=offset)


@router.get("/{ticker}/details")
def get_stock_details(ticker: str):
    """Fetch deep yfinance metrics: Market Cap, P/E, 52W High/Low, Sector, Summary."""
    now = time.time()
    ticker = ticker.upper().strip()
    cached = _DETAILS_CACHE.get(ticker)
    if cached and now - cached[0] < _DETAILS_TTL_SECONDS:
        return cached[1]

    symbol = _yf_symbol(ticker)
    stock = yf.Ticker(symbol)

    quote = _fetch_one(ticker)

    info = {}
    try:
        info = stock.info or {}
    except Exception:
        info = {}

    # If stock.info was incomplete or blocked by Yahoo on cloud IPs, enrich from Yahoo v8 chart meta
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=2d"
        resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=6)
        if resp.status_code == 200:
            res_json = resp.json().get("chart", {}).get("result", [])
            if res_json and "meta" in res_json[0]:
                meta = res_json[0]["meta"]
                if not info.get("longName"):
                    info["longName"] = meta.get("longName") or meta.get("shortName")
                if not info.get("fiftyTwoWeekHigh"):
                    info["fiftyTwoWeekHigh"] = meta.get("fiftyTwoWeekHigh")
                if not info.get("fiftyTwoWeekLow"):
                    info["fiftyTwoWeekLow"] = meta.get("fiftyTwoWeekLow")
                if not info.get("dayHigh"):
                    info["dayHigh"] = meta.get("regularMarketDayHigh")
                if not info.get("dayLow"):
                    info["dayLow"] = meta.get("regularMarketDayLow")
                if not info.get("volume"):
                    info["volume"] = meta.get("regularMarketVolume")
                if not info.get("currency"):
                    info["currency"] = meta.get("currency")
    except Exception:
        pass

    # Extract info fields safely
    details = {
        **quote,
        "company_name": info.get("longName") or info.get("shortName") or ticker,
        "sector": info.get("sector") or "N/A",
        "industry": info.get("industry") or "N/A",
        "market_cap": info.get("marketCap") or info.get("totalAssets"),
        "pe_ratio": round(float(info.get("trailingPE")), 2) if info.get("trailingPE") else None,
        "forward_pe": round(float(info.get("forwardPE")), 2) if info.get("forwardPE") else None,
        "fifty_two_week_high": round(float(info.get("fiftyTwoWeekHigh")), 2) if info.get("fiftyTwoWeekHigh") else None,
        "fifty_two_week_low": round(float(info.get("fiftyTwoWeekLow")), 2) if info.get("fiftyTwoWeekLow") else None,
        "day_high": round(float(info.get("dayHigh")), 2) if info.get("dayHigh") else None,
        "day_low": round(float(info.get("dayLow")), 2) if info.get("dayLow") else None,
        "volume": info.get("volume") or info.get("regularMarketVolume"),
        "avg_volume": info.get("averageVolume"),
        "dividend_yield": round(float(info.get("dividendYield")) * 100, 2) if info.get("dividendYield") else None,
        "summary": info.get("longBusinessSummary") or "No business summary available.",
        "currency": info.get("currency") or ("INR" if symbol.endswith(".NS") else "USD"),
    }

    _DETAILS_CACHE[ticker] = (now, details)
    return details


@router.get("/{ticker}/history")
def get_stock_history(
    ticker: str,
    period: str = Query("1m", description="Options: 1d, 5d, 1m, 6m, 1y"),
):
    """Fetch timestamped historical price series for charts."""
    symbol = _yf_symbol(ticker)
    stock = yf.Ticker(symbol)

    period_map = {
        "1d": "1d",
        "5d": "5d",
        "1m": "1mo",
        "6m": "6mo",
        "1y": "1y",
    }
    yf_period = period_map.get(period, "1mo")

    interval_map = {
        "1d": "5m",
        "5d": "15m",
        "1mo": "1d",
        "6mo": "1d",
        "1y": "1d",
    }
    interval = interval_map.get(yf_period, "1d")

    try:
        hist = stock.history(period=yf_period, interval=interval)
        if hist.empty:
            try:
                results = yf.Search(ticker, max_results=3).quotes
                for r in results:
                    alt = r.get("symbol")
                    if alt and alt != symbol:
                        alt_stock = yf.Ticker(alt)
                        alt_hist = alt_stock.history(period=yf_period, interval=interval)
                        if not alt_hist.empty:
                            hist = alt_hist
                            symbol = alt
                            break
            except Exception:
                pass

        if not hist.empty:
            points = []
            for index, row in hist.iterrows():
                time_str = index.strftime("%b %d" if period in ["1m", "6m", "1y"] else "%H:%M")
                points.append({
                    "date": time_str,
                    "timestamp": int(index.timestamp()),
                    "open": round(float(row["Open"]), 2),
                    "high": round(float(row["High"]), 2),
                    "low": round(float(row["Low"]), 2),
                    "close": round(float(row["Close"]), 2),
                    "volume": int(row["Volume"]) if "Volume" in row else 0,
                })
            return {"ticker": ticker.upper(), "period": period, "history": points}

        # Yahoo v8 chart fallback for history
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval={interval}&range={yf_period}"
        resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=6)
        if resp.status_code == 200:
            res_json = resp.json().get("chart", {}).get("result", [])
            if res_json and "timestamp" in res_json[0]:
                timestamps = res_json[0]["timestamp"]
                quotes = res_json[0].get("indicators", {}).get("quote", [{}])[0]
                opens = quotes.get("open", [])
                highs = quotes.get("high", [])
                lows = quotes.get("low", [])
                closes = quotes.get("close", [])
                volumes = quotes.get("volume", [])
                import datetime
                points = []
                for i in range(len(timestamps)):
                    c = closes[i] if i < len(closes) else None
                    if c is None:
                        continue
                    dt = datetime.datetime.fromtimestamp(timestamps[i])
                    time_str = dt.strftime("%b %d" if period in ["1m", "6m", "1y"] else "%H:%M")
                    o = opens[i] if i < len(opens) and opens[i] is not None else c
                    h = highs[i] if i < len(highs) and highs[i] is not None else c
                    l = lows[i] if i < len(lows) and lows[i] is not None else c
                    v = volumes[i] if i < len(volumes) and volumes[i] is not None else 0
                    points.append({
                        "date": time_str,
                        "timestamp": int(timestamps[i]),
                        "open": round(float(o), 2),
                        "high": round(float(h), 2),
                        "low": round(float(l), 2),
                        "close": round(float(c), 2),
                        "volume": int(v),
                    })
                if points:
                    return {"ticker": ticker.upper(), "period": period, "history": points}

        raise HTTPException(status_code=404, detail="No history found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch history: {str(e)}")



@router.get("/{ticker}")
def get_price(ticker: str):
    return _fetch_one(ticker)


@router.get("")
def get_prices_batch(tickers: List[str] = Query(..., description="Repeat as ?tickers=RELIANCE&tickers=TCS")):
    results = {}
    for t in tickers:
        try:
            results[t.upper()] = _fetch_one(t)
        except Exception:
            results[t.upper()] = None
    return results
