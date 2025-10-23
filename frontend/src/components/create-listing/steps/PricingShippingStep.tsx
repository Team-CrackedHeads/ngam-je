'use client';

import { useState } from 'react';
import { DollarSign, MapPin, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShippingPreferences } from '@/components/create-listing/shipping-options';
import { MOCK_LOCATION } from '@/utils/mock-location-data';
import { HistoricalPriceTrend } from '@/components/create-listing/price-chart';
import { MOCK_PRICE_HISTORY } from '@/utils/mock-price-chart-data';

interface PricingShippingStepProps {
  listingType: 'buy' | 'sell';
  formData: any;
  setFormData: (data: any) => void;
  recommendedPriceRange: { min: number; max: number; average: number };
  showLocationDropdown: boolean;
  setShowLocationDropdown: (show: boolean) => void;
  filteredLocations: string[];
  setFilteredLocations: (locations: string[]) => void;
  selectedLocationIndex: number;
  setSelectedLocationIndex: (index: number) => void;
  showCurrencyDropdown: boolean;
  setShowCurrencyDropdown: (show: boolean) => void;
  filteredCurrencies: string[];
  setFilteredCurrencies: (currencies: string[]) => void;
  selectedCurrencyIndex: number;
  setSelectedCurrencyIndex: (index: number) => void;
}

export default function PricingShippingStep({
  listingType,
  formData,
  setFormData,
  recommendedPriceRange,
  showLocationDropdown,
  setShowLocationDropdown,
  filteredLocations,
  setFilteredLocations,
  selectedLocationIndex,
  setSelectedLocationIndex,
  showCurrencyDropdown,
  setShowCurrencyDropdown,
  filteredCurrencies,
  setFilteredCurrencies,
  selectedCurrencyIndex: _selectedCurrencyIndex,
  setSelectedCurrencyIndex: _setSelectedCurrencyIndex,
}: PricingShippingStepProps) {
  const currencies = ['MYR', 'USD', 'SGD'];
  const [priceError, setPriceError] = useState<string | null>(null);

  const updatePriceRange = (minValue: number, maxValue: number) => {
    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) return;
    if (minValue > maxValue) {
      setPriceError('Minimum price cannot exceed maximum price.');
      return;
    }
    setPriceError(null);
    setFormData({
      ...formData,
      minPrice: minValue.toFixed(2),
      maxPrice: maxValue.toFixed(2),
    });
  };

  const handleRecommendedClick = (selection: 'low' | 'average' | 'high') => {
    const { min, average, max } = recommendedPriceRange;
    if (!(min || average || max)) return;

    if (selection === 'low') {
      updatePriceRange(min, average || max || min);
    } else if (selection === 'average') {
      updatePriceRange(min, max);
    } else {
      const lowerBound = average || min;
      updatePriceRange(lowerBound, max);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 text-[var(--color-accent-700)]">
          {listingType === 'buy' ? 'Set Your Budget' : 'Set Your Price'}
        </h2>
        <p className="text-lg text-[var(--color-primary-900)]">Configure pricing and shipping options</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <HistoricalPriceTrend
          priceHistory={MOCK_PRICE_HISTORY}
          recommendedRange={recommendedPriceRange}
          currency={formData.currency}
          onQuickSelect={handleRecommendedClick}
        />

        {/* Separator */}
        <div className="border-t border-[var(--color-primary-200)]"></div>

        {/* Pricing Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-secondary-500)]" />
            <Label className="text-sm sm:text-base font-medium text-[var(--color-accent-700)]">
              {listingType === 'buy' ? 'Budget Range' : 'Selling Price Range'}
            </Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Currency */}
            <div>
              <Label className="text-sm text-[var(--color-primary-900)]">Currency</Label>
              <div className="mt-2">
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center justify-between w-16 sm:w-20 h-9 px-3 border border-[var(--color-primary-200)] rounded-md bg-white text-sm font-medium text-[var(--color-accent-700)]"
                    onClick={() => {
                      setShowCurrencyDropdown(!showCurrencyDropdown);
                      setFilteredCurrencies(currencies);
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={showCurrencyDropdown}
                  >
                    <span>{formData.currency}</span>
                    <ChevronDown className="w-4 h-4 text-[var(--color-primary-600)]" />
                  </button>

                  {showCurrencyDropdown && filteredCurrencies.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-[var(--color-primary-200)] rounded-lg shadow-lg">
                      {filteredCurrencies.map((currency) => (
                        <button
                          key={currency}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm text-[var(--color-accent-700)] hover:bg-[var(--color-primary-100)]"
                          onClick={() => {
                            setFormData({ ...formData, currency });
                            setShowCurrencyDropdown(false);
                          }}
                        >
                          {currency}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Min Price */}
            <div>
              <Label htmlFor="minPrice" className="text-sm text-[var(--color-primary-900)]">
                Minimum Price (per unit)
              </Label>
              <Input
                id="minPrice"
                type="text"
                value={formData.minPrice}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  const parts = value.split('.');
                  const sanitised = `${parts.shift() || ''}${parts.length > 0 ? `.${parts.join('')}` : ''}`;
                  if (sanitised === '' || Number(sanitised) >= 0) {
                    const max = Number(formData.maxPrice);
                    if (sanitised && max && Number(sanitised) > max) {
                      setPriceError('Minimum price cannot exceed maximum price.');
                    } else {
                      setPriceError(null);
                    }
                    setFormData({ ...formData, minPrice: sanitised });
                  }
                }}
                placeholder="0.00"
                className="mt-2 text-base border-[var(--color-primary-200)] h-9"
                inputMode="decimal"
                pattern="^[0-9]*\.?[0-9]*$"
                onBlur={() => {
                  if (formData.minPrice === '') {
                    setFormData((prev: typeof formData) => ({ ...prev, minPrice: '' }));
                  }
                }}
              />
            </div>

            {/* Max Price */}
            <div>
              <Label htmlFor="maxPrice" className="text-sm text-[var(--color-primary-900)]">
                Maximum Price (per unit)
              </Label>
              <Input
                id="maxPrice"
                type="text"
                value={formData.maxPrice}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  const parts = value.split('.');
                  const sanitised = `${parts.shift() || ''}${parts.length > 0 ? `.${parts.join('')}` : ''}`;
                  if (sanitised === '' || Number(sanitised) >= 0) {
                    const min = Number(formData.minPrice);
                    if (sanitised && min && Number(sanitised) < min) {
                      setPriceError('Maximum price cannot be lower than minimum price.');
                    } else {
                      setPriceError(null);
                    }
                    setFormData({ ...formData, maxPrice: sanitised });
                  }
                }}
                placeholder="0.00"
                className="mt-2 text-base border-[var(--color-primary-200)] h-9"
                inputMode="decimal"
                pattern="^[0-9]*\.?[0-9]*$"
                onBlur={() => {
                  if (formData.maxPrice === '') {
                    setFormData((prev: typeof formData) => ({ ...prev, maxPrice: '' }));
                  }
                }}
              />
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <Label htmlFor="quantity" className="text-sm text-[var(--color-primary-900)]">
              {listingType === 'buy' ? 'Number of Units' : 'Inventory Quantity'}
            </Label>
            <Input
              id="quantity"
              type="text"
              value={listingType === 'buy' ? formData.quantity : formData.inventoryQuantity}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                if (value === '' || Number(value) >= 1) {
                  if (listingType === 'buy') {
                    setFormData({ ...formData, quantity: value });
                  } else {
                    setFormData({ ...formData, inventoryQuantity: value });
                  }
                }
              }}
              placeholder="Enter minimum quantity of 1 unit"
              className="text-base mt-2 border-[var(--color-primary-200)] h-9"
              inputMode="numeric"
              pattern="^[0-9]*$"
            />
          </div>

          {/* Total Budget Display (Buy only) */}
          {formData.minPrice && formData.maxPrice && Number(formData.minPrice) <= Number(formData.maxPrice) && (
            <div className="rounded-lg p-4 border space-y-3 bg-[var(--color-secondary-400)]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--color-primary-900)]">
                  {listingType === 'buy' ? 'Budget range per unit:' : 'Price range per unit:'}
                </p>
                <p className="text-xl font-bold text-[var(--color-accent-700)]">
                  {formData.currency} {formData.minPrice} - {formData.currency} {formData.maxPrice}
                </p>
              </div>

              {formData.quantity && parseInt(formData.quantity, 10) > 0 && (
                <div className="border-t pt-3 border-[var(--color-secondary-500)]">
                  <p className="text-sm mb-1 text-[var(--color-primary-900)]">
                    {listingType === 'buy' ? 'Total budget' : 'Total revenue potential'} ({formData.quantity} {parseInt(formData.quantity, 10) === 1 ? 'unit' : 'units'}):
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-accent-700)]">
                    {formData.currency} {(Number(formData.minPrice) * parseInt(formData.quantity, 10)).toFixed(2)} - {formData.currency} {(Number(formData.maxPrice) * parseInt(formData.quantity, 10)).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          {priceError && (
            <p className="text-sm text-red-600">{priceError}</p>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-[var(--color-primary-200)]"></div>

        {/* Location Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-secondary-500)]" />
            <Label className="text-sm sm:text-base font-medium text-[var(--color-accent-700)]">
              Location
            </Label>
          </div>

          <div className="relative">
            <Label htmlFor="locationInput" className="text-xs sm:text-sm text-[var(--color-primary-900)] mb-2 block">
              Select your location
            </Label>
            <Input
              id="locationInput"
              type="text"
              value={formData.location}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({...formData, location: value});
                const filtered = MOCK_LOCATION.filter(loc =>
                  loc.toLowerCase().includes(value.toLowerCase())
                );
                setFilteredLocations(filtered);
                setShowLocationDropdown(true);
                setSelectedLocationIndex(-1);
              }}
              onKeyDown={(e) => {
                if (!showLocationDropdown || filteredLocations.length === 0) return;

                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  const nextIndex = selectedLocationIndex < filteredLocations.length - 1 ? selectedLocationIndex + 1 : selectedLocationIndex;
                  setSelectedLocationIndex(nextIndex);
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  const nextIndex = selectedLocationIndex > 0 ? selectedLocationIndex - 1 : -1;
                  setSelectedLocationIndex(nextIndex);
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (selectedLocationIndex >= 0 && selectedLocationIndex < filteredLocations.length) {
                    setFormData({...formData, location: filteredLocations[selectedLocationIndex]});
                    setShowLocationDropdown(false);
                    setSelectedLocationIndex(-1);
                  }
                } else if (e.key === 'Escape') {
                  setShowLocationDropdown(false);
                  setSelectedLocationIndex(-1);
                }
              }}
              onFocus={() => {
                setShowLocationDropdown(true);
                setFilteredLocations(MOCK_LOCATION);
                setSelectedLocationIndex(-1);
              }}
              onBlur={() => {
                setTimeout(() => {
                  setShowLocationDropdown(false);
                  setSelectedLocationIndex(-1);
                }, 200);
              }}
              placeholder="Select a location"
              className="w-full text-sm sm:text-base border-[var(--color-primary-200)] bg-white text-[var(--color-accent-700)]"
            />

            {/* Location Dropdown */}
            {showLocationDropdown && filteredLocations.length > 0 && (
              <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-[var(--color-primary-200)] rounded-lg shadow-lg">
                {filteredLocations.map((location, index) => (
                  <div
                    key={location}
                    onClick={() => {
                      setFormData({...formData, location});
                      setShowLocationDropdown(false);
                      setSelectedLocationIndex(-1);
                    }}
                    onMouseEnter={() => setSelectedLocationIndex(index)}
                    className={`px-3 py-2 cursor-pointer text-sm sm:text-base text-[var(--color-accent-700)] transition-colors ${
                      selectedLocationIndex === index
                        ? 'bg-[var(--color-secondary-500)] text-[var(--color-accent-700)] font-semibold'
                        : 'hover:bg-[var(--color-primary-100)]'
                    }`}
                  >
                    {location}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-[var(--color-primary-200)]"></div>

        {/* Shipping Section */}
        <ShippingPreferences
          shippingOptions={formData.shippingOptions}
          onShippingOptionsChange={(options) => setFormData({ ...formData, shippingOptions: options })}
        />
      </div>
    </div>
  );
}
