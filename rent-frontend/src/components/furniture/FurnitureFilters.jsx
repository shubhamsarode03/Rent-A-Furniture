import { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Range, getTrackBackground } from 'react-range';
import Select from '@/components/common/Select';
import { formatCurrency } from '@/utils/formatCurrency';

const PRICE_MIN = 0;
const PRICE_MAX = 150000;
const STEP = 500;

const PRESETS = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000–₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000–₹15,000', min: 5000, max: 15000 },
  { label: '₹15,000+', min: 15000, max: PRICE_MAX },
];

export default function FurnitureFilters({
  filters,
  setFilters,
  categories,
}) {
  const [minPrice, setMinPrice] = useState(
    filters.minPrice ?? PRICE_MIN
  );
  const [maxPrice, setMaxPrice] = useState(
    filters.maxPrice ?? PRICE_MAX
  );
  const [categoryId, setCategoryId] = useState(
    filters.categoryId ?? ''
  );
  const [available, setAvailable] = useState(
    filters.available ?? false
  );

  // Sync local state with incoming filters
  useEffect(() => {
    setMinPrice(filters.minPrice ?? PRICE_MIN);
    setMaxPrice(filters.maxPrice ?? PRICE_MAX);
    setCategoryId(filters.categoryId ?? '');
    setAvailable(filters.available ?? false);
  }, [filters.minPrice, filters.maxPrice, filters.categoryId, filters.available]);

  const timerRef = useRef(null);

  // Debounce all filter changes before refetch
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setFilters({
        categoryId: categoryId || undefined,
        available: available || undefined,
        minPrice,
        maxPrice,
      });
    }, 400);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [minPrice, maxPrice, categoryId, available, setFilters]);

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

      <div className="space-y-5">
        {/* Category */}
        <Select
          label="Category"
          name="categoryId"
          value={categoryId}
          onChange={(e) =>
            setCategoryId(e.target.value)
          }
        >
          <option value="">All categories</option>

          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        {/* Price Range */}
        <div>
          <label className="label-base">Price Range</label>

          <div className="mb-4 flex items-center justify-between text-sm font-medium text-brand-700">
            <span>{formatCurrency(minPrice)}</span>

            <span className="text-brand-300">–</span>

            <span>{formatCurrency(maxPrice)}</span>
          </div>

          <Range
            values={[minPrice, maxPrice]}
            step={STEP}
            min={PRICE_MIN}
            max={PRICE_MAX}
            onChange={([min, max]) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
            renderTrack={({ props, children }) => (
              <div
                onMouseDown={props.onMouseDown}
                onTouchStart={props.onTouchStart}
                className="flex h-8 w-full items-center"
              >
                <div
                  ref={props.ref}
                  className="h-2 w-full rounded-full"
                  style={{
                    background: getTrackBackground({
                      values: [minPrice, maxPrice],
                      colors: [
                        '#dbeafe',
                        '#2563eb',
                        '#dbeafe',
                      ],
                      min: PRICE_MIN,
                      max: PRICE_MAX,
                    }),
                  }}
                >
                  {children}
                </div>
              </div>
            )}
            renderThumb={({ props, isDragged }) => (
              <div
                {...props}
                className={`h-5 w-5 rounded-full border-2 border-brand-600 bg-white shadow-md transition-transform focus:outline-none focus:ring-2 focus:ring-brand-300 ${
                  isDragged ? 'scale-110' : ''
                }`}
              />
            )}
          />
        </div>

        {/* Quick Select */}
        <div>
          <p className="label-base">Quick Select</p>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePreset(preset)}
                className="rounded-full border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <label className="flex items-center gap-2 text-sm text-brand-700">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) =>
              setAvailable(e.target.checked)
            }
            className="h-4 w-4 rounded border-brand-300 accent-brand-600"
          />
          Available only
        </label>
      </div>
    </div>
  );
}