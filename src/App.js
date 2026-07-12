import React, { useState, useEffect } from 'react';
import HoldingsTable from './components/HoldingsTable';
import DetailView from './components/DetailView';
import { fetchAllHoldingsData } from './services/dataLayer';
import config from '../config.json';

export default function App() {
  const [holdings, setHoldings] = useState([]);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllHoldingsData(config.holdings);
      setHoldings(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleRefresh() {
    loadData();
  }

  // Calculate portfolio totals
  const totalInvested = holdings.reduce((sum, h) => sum + (h.investedAmount || 0), 0);
  const totalCurrent = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const totalGain = totalCurrent - totalInvested;
  const totalGainPercent = (totalGain / totalInvested) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">📊 Investment Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Track mutual funds, stocks & ETFs</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded font-medium transition"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {lastUpdated && (
            <p className="text-gray-400 text-xs">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <PortfolioCard
            label="Total Invested"
            value={`₹${totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            color="gray"
          />
          <PortfolioCard
            label="Current Value"
            value={`₹${totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            color="blue"
          />
          <PortfolioCard
            label="Total Gain/Loss"
            value={`₹${totalGain.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            color={totalGain >= 0 ? '#10b981' : '#ef4444'}
          />
          <PortfolioCard
            label="Return %"
            value={`${totalGainPercent.toFixed(2)}%`}
            color={totalGainPercent >= 0 ? '#10b981' : '#ef4444'}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6 text-red-100">
            <p className="font-semibold">Error loading data:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading portfolio data...</p>
          </div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No holdings configured. Add holdings to config.json</p>
          </div>
        ) : (
          <HoldingsTable
            holdings={holdings}
            onSelectHolding={setSelectedHolding}
          />
        )}
      </main>

      {/* Detail View Modal */}
      {selectedHolding && (
        <DetailView
          holding={selectedHolding}
          onClose={() => setSelectedHolding(null)}
        />
      )}
    </div>
  );
}

function PortfolioCard({ label, value, color }) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition">
      <p className="text-gray-400 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-2" style={{ color: color || '#fff' }}>
        {value}
      </p>
    </div>
  );
}
