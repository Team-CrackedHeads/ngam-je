'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PriceDataPoint {
  month: string;
  price: number;
}

interface HistoricalPriceTrendProps {
  priceHistory: PriceDataPoint[];
}

export function HistoricalPriceTrend({ priceHistory }: HistoricalPriceTrendProps) {
  const minHistoryPrice = Math.min(...priceHistory.map(p => p.price));
  const maxHistoryPrice = Math.max(...priceHistory.map(p => p.price));
  const priceRange = maxHistoryPrice - minHistoryPrice;

  return (
    <Card className="border-2 border-[var(--color-primary-300)]">
      <CardHeader className="bg-[var(--color-primary-100)]">
        <CardTitle className="text-lg flex items-center gap-2 text-[var(--color-accent-700)]">
          <TrendingUp className="w-5 h-5 text-[var(--color-secondary-500)]" />
          Historical Price Trend
        </CardTitle>
        <CardDescription className="text-[var(--color-primary-900)]">
          Average market prices over the last 10 months
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative h-64 bg-[var(--color-primary-50)] rounded-lg p-4 border border-[var(--color-primary-200)]">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between text-xs text-[var(--color-primary-900)] pr-2">
            <span>${maxHistoryPrice}</span>
            <span>${Math.round(minHistoryPrice + priceRange * 0.75)}</span>
            <span>${Math.round(minHistoryPrice + priceRange * 0.5)}</span>
            <span>${Math.round(minHistoryPrice + priceRange * 0.25)}</span>
            <span>${minHistoryPrice}</span>
          </div>

          {/* Chart area */}
          <div className="ml-12 h-full pb-6 flex items-end justify-between gap-1 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 bottom-6 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-full border-t border-[var(--color-primary-300)] border-dashed"></div>
              ))}
            </div>

            {/* Price line chart */}
            <svg className="absolute inset-0 bottom-6 w-full h-full" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-secondary-500)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-secondary-500)" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <path
                d={priceHistory.map((point, i) => {
                  const x = (i / (priceHistory.length - 1)) * 100;
                  const y = 100 - ((point.price - minHistoryPrice) / priceRange) * 100;
                  return `${i === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                }).join(' ') + ` L 100% 100% L 0% 100% Z`}
                fill="url(#areaGradient)"
              />

              {/* Line */}
              <polyline
                points={priceHistory.map((point, i) => {
                  const x = (i / (priceHistory.length - 1)) * 100;
                  const y = 100 - ((point.price - minHistoryPrice) / priceRange) * 100;
                  return `${x}%,${y}%`;
                }).join(' ')}
                fill="none"
                stroke="var(--color-secondary-500)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {priceHistory.map((point, i) => {
                const x = (i / (priceHistory.length - 1)) * 100;
                const y = 100 - ((point.price - minHistoryPrice) / priceRange) * 100;
                return (
                  <g key={i}>
                    <circle
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="4"
                      fill="white"
                      stroke="var(--color-secondary-500)"
                      strokeWidth="2"
                      className="hover:r-6 transition-all cursor-pointer"
                    />
                    <title>{point.month}: ${point.price}</title>
                  </g>
                );
              })}
            </svg>

            {/* Invisible hover areas for tooltip effect */}
            {priceHistory.map((point, i) => (
              <div
                key={i}
                className="flex-1 h-full relative group cursor-pointer"
                style={{ zIndex: 10 }}
              >
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border-2 border-[var(--color-secondary-500)] rounded-lg px-3 py-2 shadow-lg whitespace-nowrap pointer-events-none">
                  <div className="text-xs font-bold text-[var(--color-accent-700)]">{point.month}</div>
                  <div className="text-sm font-bold text-[var(--color-secondary-600)]">${point.price}</div>
                </div>
              </div>
            ))}

            {/* X-axis labels - inside the chart area */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-[var(--color-primary-900)]">
              {priceHistory.map((point, i) => (
                <span key={i} className="flex-1 text-center">{point.month}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-[var(--color-primary-50)] rounded-lg p-3 text-center border border-[var(--color-primary-300)]">
            <p className="text-xs mb-1 text-[var(--color-primary-900)]">Lowest</p>
            <p className="text-lg font-bold text-[var(--color-accent-700)]">${minHistoryPrice}</p>
          </div>
          <div className="bg-[var(--color-secondary-100)] rounded-lg p-3 text-center border-2 border-[var(--color-secondary-500)]">
            <p className="text-xs mb-1 text-[var(--color-primary-900)]">Current Avg</p>
            <p className="text-lg font-bold text-[var(--color-accent-700)]">${priceHistory[priceHistory.length - 1].price}</p>
          </div>
          <div className="bg-[var(--color-primary-50)] rounded-lg p-3 text-center border border-[var(--color-primary-300)]">
            <p className="text-xs mb-1 text-[var(--color-primary-900)]">Highest</p>
            <p className="text-lg font-bold text-[var(--color-accent-700)]">${maxHistoryPrice}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
