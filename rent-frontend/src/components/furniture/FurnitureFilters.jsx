import { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Range } from 'react-range';
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
    filters.minPrice !== undefined ? filters.minPrice : PRICE_MIN
  );
  const [maxPrice, setMaxPrice] = useState(
    filters.maxPrice !== undefined ? filters.maxPrice : PRICE_MAX
  );
  const [categoryId, setCategoryId] = useState(
    filters.categoryId ?? ''
  );
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Sync local state with incoming filters
  useEffect(() => {
    const newMin = filters.minPrice !== undefined ? filters.minPrice : PRICE_MIN;
    const newMax = filters.maxPrice !== undefined ? filters.maxPrice : PRICE_MAX;
    
    // Ensure min and max are different and properly ordered
    if (newMin === newMax) {
      setMinPrice(PRICE_MIN);
      setMaxPrice(PRICE_MAX);
    } else {
      setMinPrice(newMin);
      setMaxPrice(newMax);
    }
    
    setCategoryId(filters.categoryId ?? '');
    
    // Check if current range matches any preset
    const matchingPreset = PRESETS.find(
      preset => preset.min === newMin && preset.max === newMax
    );
    setSelectedPreset(matchingPreset ? matchingPreset.label : null);
  }, [filters.minPrice, filters.maxPrice, filters.categoryId]);

  const timerRef = useRef(null);

  // Debounce all filter changes before refetch
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setFilters({
        categoryId: categoryId || undefined,
        minPrice,
        maxPrice,
      });
    }, 400);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [minPrice, maxPrice, categoryId, setFilters]);

  const handlePreset = (preset) => {
    // If clicking the same preset, deselect it and reset to default
    if (selectedPreset === preset.label) {
      setMinPrice(PRICE_MIN);
      setMaxPrice(PRICE_MAX);
      setSelectedPreset(null);
    } else {
      setMinPrice(preset.min);
      setMaxPrice(preset.max);
      setSelectedPreset(preset.label);
    }
  };

  const handleSliderChange = ([min, max]) => {
    // Ensure min and max don't overlap and maintain proper order
    const safeMin = Math.min(min, max);
    const safeMax = Math.max(min, max);
    
    // Ensure they're at least one step apart
    const minWithStep = Math.min(safeMin, safeMax - STEP);
    const maxWithStep = Math.max(safeMax, safeMin + STEP);
    
    setMinPrice(minWithStep);
    setMaxPrice(maxWithStep);
    
    // Check if the new range matches any preset
    const matchingPreset = PRESETS.find(
      preset => preset.min === minWithStep && preset.max === maxWithStep
    );
    setSelectedPreset(matchingPreset ? matchingPreset.label : null);
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
            onChange={handleSliderChange}
            allowOverlap={false}
            renderTrack={({ props, children }) => (
              <div
                onMouseDown={props.onMouseDown}
                onTouchStart={props.onTouchStart}
                className="relative flex h-8 w-full items-center"
              >
                <div
                  ref={props.ref}
                  className="h-2 w-full rounded-full bg-brand-100"
                >
                  <div
                    className="absolute h-2 rounded-full bg-brand-600"
                    style={{
                      left: `${((minPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                      width: `${((maxPrice - minPrice) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                    }}
                  />
                  {children}
                </div>
              </div>
            )}
            renderThumb={({ props, isDragged, index }) => (
              <div
                key={index}
                style={props.style}
                tabIndex={props.tabIndex}
                aria-valuemax={props.ariaValuemax}
                aria-valuemin={props.ariaValuemin}
                aria-valuenow={props.ariaValuenow}
                draggable={props.draggable}
                ref={props.ref}
                aria-label={props.ariaLabel}
                aria-labelledby={props.ariaLabelledby}
                role={props.role}
                onKeyDown={props.onKeyDown}
                onKeyUp={props.onKeyUp}
                className={`h-4 w-4 rounded-full border-2 border-brand-600 bg-white shadow-md transition-transform focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2 ${
                  isDragged ? 'scale-110 shadow-lg' : 'hover:scale-105'
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
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  selectedPreset === preset.label
                    ? 'border-brand-600 bg-brand-600 text-white hover:bg-brand-700'
                    : 'border-brand-200 text-brand-700 hover:bg-brand-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}