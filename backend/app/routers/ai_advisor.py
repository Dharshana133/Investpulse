import time
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.routers.prices import get_stock_details, _fetch_one

router = APIRouter(prefix="/ai", tags=["ai_advisor"])


class AnalyzeRequest(BaseModel):
    ticker: str
    query: Optional[str] = "Shall I buy this stock?"


@router.post("/analyze")
def analyze_stock_endpoint(payload: AnalyzeRequest):
    ticker = payload.ticker.upper().strip()
    if not ticker:
        raise HTTPException(status_code=400, detail="Ticker is required.")

    # 1. Fetch live metrics & deep details
    try:
        details = get_stock_details(ticker)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Stock details not found for '{ticker}': {str(e)}")

    price = details.get("price") or 0.0
    prev_close = details.get("previous_close") or price
    change_pct = details.get("change_pct") or 0.0
    pe_ratio = details.get("pe_ratio")
    high_52w = details.get("fifty_two_week_high")
    low_52w = details.get("fifty_two_week_low")
    market_cap = details.get("market_cap")
    div_yield = details.get("dividend_yield")
    company_name = details.get("company_name", ticker)
    sector = details.get("sector", "N/A")
    currency = details.get("currency", "INR")

    # 2. Compute AI Analysis Indicators
    pros = []
    cons = []
    score = 50  # Base neutral score out of 100

    # 52-Week Range Position
    range_pos = None
    if high_52w and low_52w and high_52w > low_52w:
        range_pos = round(((price - low_52w) / (high_52w - low_52w)) * 100, 1)
        if range_pos < 30:
            pros.append(f"Trading near 52-week low ({range_pos}% of range) — potential value dip buy opportunity.")
            score += 15
        elif range_pos > 85:
            cons.append(f"Trading near 52-week high ({range_pos}% of range) — potential overhead resistance.")
            score -= 10
        else:
            pros.append(f"Trading in a healthy mid-range ({range_pos}% of 52-week High/Low span).")

    # Valuation / P/E Ratio Signal
    if pe_ratio is not None:
        if pe_ratio < 15:
            pros.append(f"Attractive Valuation: P/E ratio of {pe_ratio} indicates potential undervaluation.")
            score += 20
        elif 15 <= pe_ratio <= 35:
            pros.append(f"Reasonable Valuation: P/E ratio of {pe_ratio} aligns with standard sector multiples.")
            score += 10
        else:
            cons.append(f"High Valuation: P/E ratio of {pe_ratio} commands a premium growth multiple.")
            score -= 15
    else:
        cons.append("P/E ratio not available or company has negative trailing earnings.")

    # Price Momentum & Change
    if change_pct > 2.0:
        pros.append(f"Strong Positive Momentum: Stock is up +{change_pct}% today.")
        score += 10
    elif change_pct < -2.0:
        cons.append(f"Short-Term Selling Pressure: Stock is down {change_pct}% today.")
        score -= 10

    # Dividend Yield
    if div_yield and div_yield > 1.5:
        pros.append(f"Income Generating: Offers a solid annual dividend yield of {div_yield}%.")
        score += 10

    # Market Cap Strength
    if market_cap:
        if market_cap > 1_000_000_000_000:  # 1 Trillion INR / 100B+ USD
            pros.append("Mega-Cap Stability: Large market capitalization offers liquidity & risk mitigation.")
            score += 10
        elif market_cap > 100_000_000_000:
            pros.append("Established Capitalization: High liquidity and strong institutional coverage.")

    # Bound score between 10 and 95
    score = max(15, min(92, score))

    # 3. Determine Verdict & Recommendation
    if score >= 75:
        verdict = "BULLISH BUY CONSIDERATION"
        verdict_color = "#10b981"
        recommendation_summary = (
            f"{company_name} ({ticker}) displays strong fundamental indicators. "
            f"Favorable valuation metrics and solid price positioning present a attractive buying opportunity."
        )
    elif score >= 55:
        verdict = "MODERATE BUY / ACCUMULATE"
        verdict_color = "#38bdf8"
        recommendation_summary = (
            f"{company_name} ({ticker}) demonstrates steady performance in the {sector} sector. "
            f"Consider gradual accumulation or dollar-cost averaging."
        )
    elif score >= 40:
        verdict = "HOLD / NEUTRAL"
        verdict_color = "#f59e0b"
        recommendation_summary = (
            f"{company_name} ({ticker}) is currently fairly valued with balanced risk factors. "
            f"Existing holders may keep their position while awaiting clearer breakout signals."
        )
    else:
        verdict = "EXERCISE CAUTION / WAIT FOR DIP"
        verdict_color = "#ef4444"
        recommendation_summary = (
            f"{company_name} ({ticker}) shows high valuation metrics or short-term headwinds. "
            f"It may be prudent to wait for a price pull-back or further earnings confirmation."
        )

    # Detailed AI explanation answering user query
    user_q = payload.query or "Shall I buy this stock?"
    detailed_reasoning = (
        f"In response to your query ('{user_q}'), here is the AI synthesis for {company_name} ({ticker}):\n"
        f"The stock currently trades at {currency} {price} (change: {change_pct:+.2f}%). "
        f"In the {sector} sector, its 52-week trading corridor ranges between {low_52w or 'N/A'} and {high_52w or 'N/A'}. "
        f"{'With a P/E of ' + str(pe_ratio) + ', ' if pe_ratio else ''}"
        f"the AI model assigns a confidence score of {score}% toward a {verdict.lower()} stance."
    )

    return {
        "ticker": ticker,
        "company_name": company_name,
        "sector": sector,
        "price": price,
        "currency": currency,
        "change_pct": change_pct,
        "verdict": verdict,
        "verdict_color": verdict_color,
        "confidence_score": score,
        "recommendation_summary": recommendation_summary,
        "detailed_reasoning": detailed_reasoning,
        "pros": pros if pros else ["Stable operational profile in its primary market."],
        "cons": cons if cons else ["Standard market volatility applies."],
        "key_metrics": {
            "P/E Ratio": f"{pe_ratio:.2f}" if pe_ratio else "N/A",
            "52W High": f"{currency} {high_52w}" if high_52w else "N/A",
            "52W Low": f"{currency} {low_52w}" if low_52w else "N/A",
            "Dividend Yield": f"{div_yield}%" if div_yield else "0.0%",
            "52W Position": f"{range_pos}%" if range_pos is not None else "N/A"
        },
        "disclaimer": "AI financial analysis is provided for informational and analytical reference only. Always perform independent research or consult a licensed financial advisor before making investment decisions."
    }
