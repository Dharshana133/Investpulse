# ⚡ Live Portfolio Tracker & AI Stock Analyst

![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite)
![Python](https://img.shields.io/badge/Language-Python_3-3776AB?style=for-the-badge&logo=python)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)

> A full-stack financial portfolio tracking and stock market analytics application powered by **Python FastAPI**, **React**, **`yfinance`**, and an **AI Stock Recommendation Engine**.

---

## ✨ Features

### 🤖 1. AI Stock Analyst Chatbot
* Ask queries like *"Shall I buy RELIANCE?"* or *"Analyze TATAMOTORS for growth"*.
* Computes live 52-week price range positioning, valuation multiples (P/E ratio), dividend yield, and price momentum.
* Outputs a **Confidence Score** and color-coded Verdict:
  * 🟢 **BULLISH BUY CONSIDERATION**
  * 🔵 **MODERATE BUY / ACCUMULATE**
  * 🟡 **HOLD / NEUTRAL**
  * 🔴 **EXERCISE CAUTION / WAIT FOR DIP**
* Provides bulleted **Bullish Drivers**, **Risks & Considerations**, and a **Contextual AI Synthesis**.

### 📊 2. Real-Time Stock Explorer
* Live quotes, daily change percentages, and currency metrics for 842+ NSE equities & major US stocks.
* Deep financial metrics: Market Cap, Trailing P/E, Forward P/E, 52W High/Low, Volume, and Business Summaries.
* Interactive time-series price history charts (`1D`, `5D`, `1M`, `6M`, `1Y`).

### 🇮🇳 3. 842+ NSE Stock Catalog
* Browse, search, and paginate through 840+ National Stock Exchange of India (NSE) listed companies.
* Filter stocks by market sector or ticker query.

### 💼 4. Portfolio & Transaction Management
* Log buy and sell transactions with custom execution prices, share quantities, and dates.
* Automatic calculation of total investment, current portfolio market value, net gain/loss ($ / ₹ and %), and portfolio breakdown.

### ⭐ 5. Watchlist Tracker
* Save favorite stocks for one-click monitoring and quick navigation.

### 🔐 6. Secure Authentication
* User signup and login backed by **JWT Bearer Tokens** and **Bcrypt** password hashing.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite, Glassmorphism CSS UI |
| **HTTP Client** | Axios |
| **Backend Framework** | Python 3, FastAPI, Uvicorn |
| **Financial Data API** | `yfinance` & Custom NSE Catalog Engine |
| **Database & ORM** | SQLite, SQLAlchemy 2.0 |
| **Security & Auth** | PyJWT, Passlib (bcrypt), Pydantic v2 |

---

## 📁 Repository Structure

```
live-portfolio-tracker/
├── backend/                  # FastAPI Backend API Server
│   ├── app/
│   │   ├── core/             # Database session, security & NSE stock catalog
│   │   ├── models/           # SQLAlchemy DB models (User, Transaction, Watchlist)
│   │   ├── routers/          # Endpoints: /auth, /prices, /transactions, /watchlist, /ai
│   │   ├── schemas/          # Pydantic request/response models
│   │   └── main.py           # FastAPI entry point
│   ├── portfolio.db          # SQLite database
│   └── requirements.txt      # Python dependencies
│
├── client/                   # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/       # StockExplorer, AiAdvisorTab, PortfolioTab, WatchlistTab
│   │   ├── services/         # Axios API client helper (`api.js`)
│   │   ├── App.jsx           # Main React component
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup & Installation

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & **npm**

---

### 🟢 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi "uvicorn[standard]" sqlalchemy "passlib[bcrypt]" "python-jose[cryptography]" python-multipart yfinance pydantic email-validator

# Run FastAPI Server
python -m uvicorn app.main:app --reload
```
> 🌐 Backend server will run at: `http://127.0.0.1:8000`  
> 📑 Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`

---

### 🔵 2. Frontend Setup

Open a second terminal window:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
> 💻 Frontend client will run at: `http://localhost:5173`

---

## 📑 Interactive API Documentation

Once the backend is running, explore and test all API endpoints directly in your browser:
* **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Spec**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 👤 Author

* **Dharshana S** — [@Dharshana133](https://github.com/Dharshana133)

---

⭐ *If you find this project useful, feel free to give it a star on GitHub!*
