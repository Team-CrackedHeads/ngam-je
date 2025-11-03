'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PriceDataPoint {
  month: string;
  price: number;
  year?: number;
}

interface HistoricalPriceTrendProps {
  priceHistory: PriceDataPoint[];
  recommendedRange?: { min: number; average: number; max: number };
  currency: string;
  onQuickSelect?: (selection: 'low' | 'average' | 'high') => void;
}

const formatMoney = (currency: string) => (value: number) =>
  `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface PriceTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string | number;
  currency: string;
}

const PriceTooltip: React.FC<PriceTooltipProps> = ({ active, payload, label, currency }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const format = formatMoney(currency);

  return (
    <div className="rounded-lg border border-[var(--color-secondary-500)] bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-[var(--color-accent-700)]">{String(label)}</p>
      <p className="text-sm font-semibold text-[var(--color-secondary-600)]">
        {format(payload[0].value)}
      </p>
    </div>
  );
};

export function HistoricalPriceTrend({
  priceHistory,
  recommendedRange,
  currency,
  onQuickSelect,
}: HistoricalPriceTrendProps) {
  // All hooks must be called before any early returns
  const displayCurrency = currency || 'MYR';
  const format = useMemo(() => formatMoney(displayCurrency), [displayCurrency]);

  const monthOrder = useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], []);

  const hasYearData = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return false;
    return priceHistory.some((point) => point.year != null);
  }, [priceHistory]);

  const monthlySeries = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return [];
    const sorted = priceHistory
      .map((point, originalIndex) => ({ point, originalIndex }))
      .sort((a, b) => {
        const yearA = a.point.year ?? 0;
        const yearB = b.point.year ?? 0;
        if (yearA !== yearB) return yearA - yearB;
        const monthIndexA = monthOrder.indexOf(a.point.month);
        const monthIndexB = monthOrder.indexOf(b.point.month);
        if (monthIndexA !== monthIndexB) return monthIndexA - monthIndexB;
        return a.originalIndex - b.originalIndex;
      });

    const sliceStart = Math.max(sorted.length - 12, 0);
    const recent = sorted.slice(sliceStart).map(({ point }) => point);

    const uniqueYears = new Set(recent.map((point) => point.year).filter(Boolean));
    const includeYearInLabel = uniqueYears.size > 1;

    return recent.map((point) => ({
      label: includeYearInLabel && point.year ? `${point.month} ${point.year}` : point.month,
      price: point.price,
      year: point.year ?? null,
    }));
  }, [priceHistory, monthOrder]);

  const yearlySeries = useMemo(() => {
    if (!hasYearData || !priceHistory || priceHistory.length === 0) return [] as { label: string; price: number }[];

    const grouped = priceHistory.reduce<Record<number, { sum: number; count: number }>>((acc, point) => {
      const year = point.year ?? 0;
      const bucket = acc[year] ?? { sum: 0, count: 0 };
      bucket.sum += point.price;
      bucket.count += 1;
      acc[year] = bucket;
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([yearA], [yearB]) => Number(yearA) - Number(yearB))
      .map(([year, bucket]) => ({
        label: year,
        price: bucket.sum / Math.max(bucket.count, 1),
      }));
  }, [priceHistory, hasYearData]);

  const [view, setView] = useState<'monthly' | 'yearly'>('monthly');

  const chartData = useMemo(() => (view === 'yearly' && yearlySeries.length ? yearlySeries : monthlySeries), [view, yearlySeries, monthlySeries]);

  const yDomain = useMemo(() => {
    const values = chartData.map((point) => point.price);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const padding = Math.max((maxValue - minValue) * 0.1, 5);
    return [Math.max(minValue - padding, 0), maxValue + padding];
  }, [chartData]);

  const aiRange = useMemo(() => {
    if (recommendedRange && recommendedRange.min && recommendedRange.max) {
      return recommendedRange;
    }

    const values = chartData.map((point) => point.price);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const averageValue = values.reduce((sum, value) => sum + value, 0) / values.length;
    const padding = Math.max(averageValue * 0.1, 5);

    return {
      min: Math.max(0, Math.min(minValue, averageValue - padding)),
      average: averageValue,
      max: Math.max(maxValue, averageValue + padding),
    };
  }, [recommendedRange, chartData]);

  // Early return after all hooks have been called
  if (!priceHistory || priceHistory.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[var(--color-primary-200)] bg-white shadow-sm">
      <div className="px-4 py-4 sm:px-5 sm:py-5 border-b border-[var(--color-primary-200)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-secondary-500)]/10 text-[var(--color-secondary-600)]">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-[var(--color-accent-700)]">Market price overview</p>
              <p className="text-sm text-[var(--color-primary-800)]">Average prices from recent marketplace data</p>
            </div>
          </div>

          {hasYearData && yearlySeries.length > 0 && (
            <div className="inline-flex items-center rounded-xl border border-[var(--color-secondary-400)] bg-white px-1.5 py-1">
              <Button
                type="button"
                size="sm"
                variant={view === 'monthly' ? 'secondary' : 'ghost'}
                className={`h-8 px-3 text-xs rounded-lg transition-colors ${
                  view === 'monthly'
                    ? 'bg-[var(--color-secondary-500)] text-[var(--color-accent-700)] hover:bg-[var(--color-secondary-500)]'
                    : 'bg-white text-[var(--color-secondary-700)] hover:bg-[var(--color-secondary-100)]'
                }`}
                onClick={() => setView('monthly')}
              >
                Monthly
              </Button>
              <Button
                type="button"
                size="sm"
                variant={view === 'yearly' ? 'secondary' : 'ghost'}
                className={`h-8 px-3 text-xs rounded-lg transition-colors ${
                  view === 'yearly'
                    ? 'bg-[var(--color-secondary-500)] text-[var(--color-accent-700)] hover:bg-[var(--color-secondary-500)]'
                    : 'bg-white text-[var(--color-secondary-700)] hover:bg-[var(--color-secondary-100)]'
                }`}
                onClick={() => setView('yearly')}
              >
                Yearly
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-secondary-500)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-secondary-500)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-primary-200)" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--color-primary-800)', fontSize: 12 }}
                interval={0}
                minTickGap={12}
              />
              <YAxis
                tickFormatter={format}
                tickLine={false}
                axisLine={false}
                width={80}
                tick={{ fill: 'var(--color-primary-800)', fontSize: 12 }}
                domain={yDomain as [number, number]}
              />
              <Tooltip
                cursor={{ strokeDasharray: '4 4', stroke: 'var(--color-secondary-400)' }}
                content={(props) => <PriceTooltip currency={displayCurrency} {...props} />}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="var(--color-secondary-500)"
                fill="url(#priceTrendGradient)"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-secondary-500)', fill: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {aiRange.average > 0 && (
          <div className="rounded-lg border border-[var(--color-secondary-400)] bg-[var(--color-secondary-300)]/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[var(--color-secondary-600)]" />
              <p className="font-semibold text-sm sm:text-base text-[var(--color-accent-700)]">
                AI-recommended price range
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                className="justify-center border-[var(--color-secondary-400)] bg-white hover:bg-[var(--color-secondary-400)]/20"
                onClick={() => onQuickSelect?.('low')}
                aria-label="Use low AI recommended price"
              >
                <div className="flex flex-col items-center text-[var(--color-primary-700)] text-xs font-semibold">
                  <span>Low</span>
                  <span className="text-sm text-[var(--color-accent-700)] font-bold">
                    {format(aiRange.min)}
                  </span>
                </div>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="justify-center border-[var(--color-secondary-500)] bg-white hover:bg-[var(--color-secondary-500)]/20"
                onClick={() => onQuickSelect?.('average')}
                aria-label="Use average AI recommended price"
              >
                <div className="flex flex-col items-center text-[var(--color-primary-700)] text-xs font-semibold">
                  <span>Avg</span>
                  <span className="text-sm text-[var(--color-accent-700)] font-bold">
                    {format(aiRange.average)}
                  </span>
                </div>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="justify-center border-[var(--color-secondary-400)] bg-white hover:bg-[var(--color-secondary-400)]/20"
                onClick={() => onQuickSelect?.('high')}
                aria-label="Use high AI recommended price"
              >
                <div className="flex flex-col items-center text-[var(--color-primary-700)] text-xs font-semibold">
                  <span>High</span>
                  <span className="text-sm text-[var(--color-accent-700)] font-bold">
                    {format(aiRange.max)}
                  </span>
                </div>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
