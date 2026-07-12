import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ZONE_THRESHOLDS } from '../constants/zones';

export default function DetailView({ holding, onClose }) {
  const [activeTab, setActiveTab] = useState('performance');

  if (!holding || holding.error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full mx-4">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Details</h2>
          <p className="text-gray-400 mb-6">{holding?.error || 'Unable to load holding details'}</p>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const thresholds = ZONE_THRESHOLDS[holding.category] || ZONE_THRESHOLDS['individual-stock'];
  const zoneLines = thresholds.zones.map(z => z.max).filter(v => v !== Infinity);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white">{holding.name}</h2>
            <p className="text-gray-400 text-sm mt-1">
              {holding.type.toUpperCase()} • {holding.category.replace('-', ' ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Summary Cards */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            label="Invested"
            value={`₹${holding.investedAmount?.toLocaleString() || 'N/A'}`}
            color="gray"
          />
          <SummaryCard
            label="Current Value"
            value={`₹${Math.round(holding.currentValue || 0).toLocaleString()}`}
            color="blue"
          />
          <SummaryCard
            label="3Y CAGR"
            value={`${holding.cagr?.toFixed(2) || 'N/A'}%`}
            color={holding.zone?.color}
          />
          <SummaryCard
            label="XIRR"
            value={`${holding.xirr?.toFixed(2) || 'N/A'}%`}
            color={holding.gainLossPercent >= 0 ? '#10b981' : '#ef4444'}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-3 px-4 border-b-2 font-medium transition ${
                activeTab === 'performance'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              3Y CAGR Chart
            </button>
            <button
              onClick={() => setActiveTab('signal')}
              className={`py-3 px-4 border-b-2 font-medium transition ${
                activeTab === 'signal'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Signal Analysis
            </button>
            {holding.peFlag && (
              <button
                onClick={() => setActiveTab('pe')}
                className={`py-3 px-4 border-b-2 font-medium transition ${
                  activeTab === 'pe'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                PE Valuation
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'performance' && holding.rolling3YearCAGR && (
            <PerformanceChart data={holding.rolling3YearCAGR} zoneLines={zoneLines} zones={thresholds.zones} />
          )}

          {activeTab === 'signal' && (
            <SignalAnalysis holding={holding} thresholds={thresholds} />
          )}

          {activeTab === 'pe' && holding.peFlag && (
            <PEAnalysis holding={holding} />
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="bg-gray-800 rounded p-4">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={`text-lg font-bold`} style={{ color: color || '#fff' }}>
        {value}
      </p>
    </div>
  );
}

function PerformanceChart({ data, zoneLines, zones }) {
  return (
    <div>
      <h3 className="text-white font-bold mb-4">Rolling 3-Year CAGR History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" stroke="#999" />
          <YAxis stroke="#999" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff'
            }}
            formatter={(value) => `${value.toFixed(2)}%`}
          />
          <Line type="monotone" dataKey="cagr" stroke="#3b82f6" strokeWidth={2} dot={false} />

          {/* Zone reference lines */}
          {zoneLines.map((line, idx) => (
            <ReferenceLine
              key={idx}
              y={line}
              stroke="#666"
              strokeDasharray="5 5"
              label={{
                value: zones[idx]?.name,
                position: 'right',
                fill: '#999',
                fontSize: 12
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function SignalAnalysis({ holding, thresholds }) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded p-4">
        <h3 className="text-white font-bold mb-3">Current Zone</h3>
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: holding.zone?.color }}
          />
          <div>
            <p className="text-white font-semibold">{holding.zone?.name}</p>
            <p className="text-gray-400 text-sm">CAGR: {holding.cagr?.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded p-4">
        <h3 className="text-white font-bold mb-3">Zone Thresholds ({holding.category})</h3>
        <div className="space-y-2">
          {thresholds.zones.map((zone, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-300">{zone.name}</span>
              <span className="text-gray-400">
                {zone.min}% - {zone.max === Infinity ? '∞' : zone.max + '%'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded p-4">
        <h3 className="text-white font-bold mb-3">Combined Signal</h3>
        <div className="space-y-2">
          <p className="text-white font-semibold text-lg">{holding.combinedSignal?.signal}</p>
          <p className="text-gray-400 text-sm">{holding.combinedSignal?.confidence}</p>
        </div>
      </div>
    </div>
  );
}

function PEAnalysis({ holding }) {
  if (!holding.peRatio || !holding.pe5YearMedian) {
    return <p className="text-gray-400">PE data not available</p>;
  }

  const ratio = holding.peRatio / holding.pe5YearMedian;
  const flag = holding.peFlag?.flag;

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded p-4">
        <h3 className="text-white font-bold mb-3">Current PE vs Historical Median</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm mb-1">Current PE</p>
            <p className="text-white font-bold text-lg">{holding.peRatio?.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">5Y Median PE</p>
            <p className="text-white font-bold text-lg">{holding.pe5YearMedian?.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Ratio</p>
            <p className="text-white font-bold text-lg">{ratio.toFixed(2)}x</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded p-4">
        <h3 className="text-white font-bold mb-3">PE Flag</h3>
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: holding.peFlag?.color }}
          />
          <div>
            <p className="text-white font-semibold">{flag}</p>
            <p className="text-gray-400 text-sm">
              {flag === 'Cheap' && 'PE below historical median - attractive entry'}
              {flag === 'Fair' && 'PE in line with historical average - fair valuation'}
              {flag === 'Expensive' && 'PE above historical median - stretched valuation'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
