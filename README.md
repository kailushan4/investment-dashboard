# Personal Investment Dashboard

A React-based dashboard to track mutual funds, stocks, and ETFs with performance analysis and buy/hold/sell signals based on custom investment frameworks.

## Features

- **Unified Portfolio View**: Track mutual funds (via mfapi.in), stocks, and ETFs (via yfinance) in one dashboard
- **Performance Metrics**: Calculate 3-year CAGR, XIRR, gain/loss %, and rolling performance trends
- **Smart Signals**: Combine CAGR-based zone classification with PE valuation flags for actionable buy/hold/sell recommendations
- **Category-Specific Thresholds**: Different zone definitions for large-cap, mid-cap, small-cap, and individual stocks
- **Local Caching**: Daily refresh with localStorage persistence (no backend needed)
- **Interactive Charts**: Rolling 3-year CAGR visualization with zone overlays
- **Dark Mode**: Professional trading app aesthetic

## Setup

### Prerequisites
- Node.js 14+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`.

### Configuration

Edit `config.json` to add/modify your holdings:

```json
{
  "holdings": [
    {
      "id": "unique-id",
      "name": "Fund/Stock Name",
      "type": "mf|stock|etf",
      "schemeCode": 108973,        // for MF only
      "ticker": "VATECHWABAG.NS",  // for stock/ETF only
      "category": "large-cap-index|flexi-cap|mid-cap|small-cap|individual-stock",
      "investedAmount": 50000,
      "investedDate": "2021-01-15",
      "peRatio": 25.5,             // manual entry, optional
      "pe5YearMedian": 22.0        // manual entry, optional
    }
  ]
}
```

### Testing the Data Layer

Test fetching data for Bandhan Small Cap Fund:

```bash
npm run test:data
```

This validates:
- ✅ mfapi.in connectivity for NAV history
- ✅ NAV data parsing and sorting
- ✅ 3-year CAGR calculation
- ✅ Fund search functionality

## Architecture

### Data Layer (`src/services/`)
- **mfapi.js**: Fetch mutual fund NAV history from mfapi.in
- **yfinance.js**: Fetch stock/ETF price history via Yahoo Finance public API
- **dataLayer.js**: Unified orchestrator combining data with calculations

### Calculations (`src/utils/`)
- **calculations.js**: CAGR, XIRR, rolling returns, gain/loss %
- **zones.js**: Category-specific zone classification and signal generation
- **cache.js**: localStorage-based caching with 24-hour expiry

### UI Components (React)
- Main dashboard table (filterable, sortable)
- Holding detail view with charts
- PE valuation mini-chart

## Zone Thresholds

### Large-Cap Index (e.g., UTI Nifty 50)
| CAGR | Zone | Signal |
|------|------|--------|
| <8% | SIP+Extra | Buy |
| 8-13% | Regular SIP | Buy |
| 13-18% | Slow Down | Hold |
| 18-25% | Profit Book | Sell |
| >25% | High Risk Exit | Exit |

### Flexi-Cap (e.g., Parag Parikh)
| CAGR | Zone | Signal |
|------|------|--------|
| <10% | SIP+Extra | Buy |
| 10-15% | Regular SIP | Buy |
| 15-20% | Slow Down | Hold |
| 20-28% | Profit Book | Sell |
| >28% | High Risk Exit | Exit |

### Mid-Cap / Small-Cap
Similar structure with higher thresholds (12-35% range).

## Signal Logic

**High Conviction Buy/Sell**: Both CAGR zone AND PE flag agree  
**Hold and Monitor**: CAGR and PE signals conflict  
**Based on CAGR Only**: PE data not available

## Known Limitations (v1)

- ⚠️ Stock/ETF historical data fetches via Yahoo Finance public API (CORS restrictions may apply in some environments)
- ⚠️ PE ratios must be manually updated in config.json (no free real-time PE API included)
- ⚠️ Single-user, no authentication
- ⚠️ No real-time prices (daily refresh via cache)
- ⚠️ Limited to ~5 years of historical data (browser storage limits)

## Future Enhancements (v2+)

- [ ] Backend API for persistent storage and price data aggregation
- [ ] Real-time stock/MF price updates
- [ ] News integration and tag-based filtering
- [ ] Portfolio allocation charts and risk metrics
- [ ] Auto-download PE data from reliable sources
- [ ] Export portfolio as PDF/CSV

## Tech Stack

- **React 18** — UI framework
- **Recharts** — Data visualization
- **Tailwind CSS** — Styling
- **Axios** — HTTP client
- **date-fns** — Date utilities
- **localStorage** — Client-side caching

## License

MIT
