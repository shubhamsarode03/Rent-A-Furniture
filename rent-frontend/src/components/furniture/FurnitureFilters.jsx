import { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import Select from '@/components/common/Select';
import { formatCurrency } from '@/utils/formatCurrency';

const PRICE_MIN = 0;
const PRICE_MAX = 150000;
const PRESETS = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000–₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000–₹15,000', min: 5000, max: 15000 },
  { label: '₹15,000+', min: 15000, max: PRICE_MAX },
];

export default function FurnitureFilters({ filters, setFilters, categories }) {
  const [minPrice, setMinPrice] = useState(filters.minPrice ?? PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice ?? PRICE_MAX);
  const timerRef = useRef(null);

  // Debounce price changes ~400ms before triggering refetch
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setFilters({ minPrice, maxPrice });
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [minPrice, maxPrice, setFilters]);

  const handlePreset = (preset) => {
    setMinPrice(preset.min);
    setMaxPrice(preset.max);
  };

  return (
    <div className="rounded-xl border border-brand-100 bg-white p-4 shadow-card">
      <div className="mb-4 flex items-center gap-2 text-brand-800">
        <SlidersHorizontal className="h-5 w-5" />
        <h3 className="font-semibold">Filters</h3>
      </div>

      <div className="space-y-4">
        <Select
          label="Category"
          name="categoryId"
          value={filters.categoryId ?? ''}
          onChange={(e) => setFilters({ categoryId: e.target.value || undefined })}
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>

        <div>
          <label className="label-base">Price range</label>
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-brand-700">
            <span>{formatCurrency(minPrice)}</span>
            <span className="text-brand-300">–</span>
            <span>{formatCurrency(maxPrice)}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={500}
              value={minPrice}
              onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 500))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-brand-100 accent-brand-600"
            />
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 500))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-brand-100 accent-brand-600"
            />
          </div>
        </div>

        <div>
          <p className="label-base">Quick select</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePreset(p)}
                className="rounded-full border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-brand-700">
          <input
            type="checkbox"
            checked={filters.available ?? false}
            onChange={(e) => setFilters({ available: e.target.checked || undefined })}
            className="h-4 w-4 rounded border-brand-300 accent-brand-600"
          />
          Available only
        </label>
      </div>
    </div>
  );
}
