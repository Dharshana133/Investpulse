import axios from "axios";

const isLocal =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isLocal
    ? "http://127.0.0.1:8000"
    : "https://live-portfolio-tracker.onrender.com");

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization Bearer token dynamically if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Authentication Service helper functions
export const authService = {
  login: async (email, password) => {
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);
    const response = await api.post("/auth/login", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  },

  signup: async (email, password) => {
    const response = await api.post("/auth/signup", { email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Prices & yfinance Service helpers
export const priceService = {
  getPrice: async (ticker) => {
    const res = await api.get(`/prices/${ticker}`);
    return res.data;
  },
  getDetails: async (ticker) => {
    const res = await api.get(`/prices/${ticker}/details`);
    return res.data;
  },
  getHistory: async (ticker, period = "1m") => {
    const res = await api.get(`/prices/${ticker}/history?period=${period}`);
    return res.data;
  },
  getNseCatalog: async (q = "", sector = "", limit = 50, offset = 0) => {
    const res = await api.get(`/prices/nse/catalog`, {
      params: { q, sector, limit, offset },
    });
    return res.data;
  },
  getPricesBatch: async (tickers) => {
    // Fetch prices for multiple tickers concurrently
    const results = {};
    await Promise.allSettled(
      tickers.map(async (ticker) => {
        try {
          const res = await api.get(`/prices/${ticker}`);
          results[ticker.toUpperCase()] = res.data;
        } catch {
          results[ticker.toUpperCase()] = null;
        }
      })
    );
    return results;
  },
};

// Watchlist Service
export const watchlistService = {
  getWatchlist: async () => {
    const res = await api.get("/watchlist");
    return res.data;
  },
  addWatchlist: async (ticker) => {
    const res = await api.post("/watchlist", { ticker });
    return res.data;
  },
  removeWatchlist: async (id) => {
    const res = await api.delete(`/watchlist/${id}`);
    return res.data;
  },
};

// Transactions Service
export const transactionService = {
  getTransactions: async () => {
    const res = await api.get("/transactions");
    return res.data;
  },
  addTransaction: async (data) => {
    const res = await api.post("/transactions", data);
    return res.data;
  },
  deleteTransaction: async (id) => {
    const res = await api.delete(`/transactions/${id}`);
    return res.data;
  },
};

// AI Advisor Service
export const aiService = {
  analyzeStock: async (ticker, query) => {
    const res = await api.post("/ai/analyze", { ticker, query });
    return res.data;
  },
};

