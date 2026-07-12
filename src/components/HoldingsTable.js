import React, { useState } from 'react';

export default function HoldingsTable({ holdings, onSelectHolding, filters }) {
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [typeFilter, setTypeFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [signalFilter, setSignalFilter] = useState('all');

  // Apply filters
  let filtered = holdings.filter(h => {
    if (typeFilter !== 'all' && h.type !== typeFilter) return false;
    if (zoneFilter !== 'all' && h.zone?.name !== zoneFilter) return false;
    if (signalFilter !== 'all' && !h.combinedSignal?.signal.includes(signalFilter)) return false;
    return true;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    const key = sortConfig.key;
    let aVal = a[key];
    let bVal = b[key];

    // Handle nested properties
    if (key === 'zoneName') {
      aVal = a.zone?.name;
      bVal = b.zone?.name;
    } else if (key === 'signal') {
      aVal = a.combinedSignal?.signal;
      bVal = b.combinedSignal?.signal;
    }

    if (aVal === undefined || aVal === null) aVal = '';
    if (bVal === undefined || bVal === null) bVal = '';

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    aVal = String(aVal).toLowerCase();
    bVal = String(bVal).toLowerCase();

    if (sortConfig.direction === 'asc') {
      return aVal.localeCompare(bVal);
    } else {
      return bVal.localeCompare(aVal);
    }
  });

  function handleSort(key) {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  }

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <span className="text-gray-500">⇅</span>;
    return sortConfig.direction === 'asc' ? <span className="text-blue-400">↑</span> : <span className="text-blue-400">↓</span>;
  };

  const uniqueZones = [...new Set(holdings.map(h => h.zone?.name).filter(Boolean))];
  const uniqueSignals = ['Buy', 'Hold', 'Sell', 'Exit'];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
          >
            <option value="all">All</option>
            <option value="mf">Mutual Funds</option>
            <option value="stock">Stocks</option>
            <option value="etf">ETFs</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Zone</label>
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
          >
            <option value="all">All</option>
            {uniqueZones.map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Signal</label>
          <select
            value={signalFilter}
            onChange={(e) => setSignalFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
          >
            <option value="all">All</option>
            {uniqueSignals.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('name')} className="font-semibold text-gray-300 hover:text-white flex items-center gap-1">
                  Holding Name <SortIcon column="name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('type')} className="font-semibold text-gray-300 hover:text-white flex items-center gap-1">
                  Type <SortIcon column="type" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button onClick={() => handleSort('investedAmount')} className="font-semibold text-gray-300 hover:text-white flex items-center justify-end gap-1">
                  Invested <SortIcon column="investedAmount" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button onClick={() => handleSort('currentValue')} className="font-semibold text-gray-300 hover:text-white flex items-center justify-end gap-1">
                  Current Value <SortIcon column="currentValue" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button onClick={() => handleSort('gainLossPercent')} className="font-semibold text-gray-300 hover:text-white flex items-center justify-end gap-1">
                  Gain/Loss % <SortIcon column="gainLossPercent" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button onClick={() => handleSort('xirr')} className="font-semibold text-gray-300 hover:text-white flex items-center justify-end gap-1">
                  XIRR <SortIcon column="xirr" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button onClick={() => handleSort('cagr')} className="font-semibold text-gray-300 hover:text-white flex items-center justify-end gap-1">
                  3Y CAGR <SortIcon column="cagr" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button onClick={() => handleSort('zoneName')} className="font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-1">
                  Zone <SortIcon column="zoneName" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="font-semibold text-gray-300">PE Flag</span>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('signal')} className="font-semibold text-gray-300 hover:text-white flex items-center gap-1">
                  Signal <SortIcon column="signal" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filtered.map((holding) => (
              <tr
                key={holding.id}
                onClick={() => onSelectHolding(holding)}
                className="hover:bg-gray-700 cursor-pointer transition"
              >
                <td className="px-4 py-3 font-medium text-white">{holding.name}</td>
                <td className="px-4 py-3 text-gray-400 uppercase text-xs font-semibold">{holding.type}</td>
                <td className="px-4 py-3 text-right text-gray-300">₹{holding.investedAmount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-gray-300">₹{Math.round(holding.currentValue || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: holding.gainLossPercent >= 0 ? '#10b981' : '#ef4444' }}>
                  {holding.gainLossPercent?.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: holding.xirr >= 0 ? '#10b981' : '#ef4444' }}>
                  {holding.xirr?.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: holding.zone?.color }}>
                  {holding.cagr?.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="inline-block px-3 py-1 rounded text-xs font-semibold text-white"
                    style={{ backgroundColor: holding.zone?.color, opacity: 0.8 }}
                  >
                    {holding.zone?.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {holding.peFlag ? (
                    <span
                      className="inline-block px-3 py-1 rounded text-xs font-semibold text-white"
                      style={{ backgroundColor: holding.peFlag.color, opacity: 0.8 }}
                    >
                      {holding.peFlag.flag}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold text-white">{holding.combinedSignal?.signal}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No holdings match the selected filters.
        </div>
      )}

      <div className="text-sm text-gray-400">
        Showing {filtered.length} of {holdings.length} holdings
      </div>
    </div>
  );
}
