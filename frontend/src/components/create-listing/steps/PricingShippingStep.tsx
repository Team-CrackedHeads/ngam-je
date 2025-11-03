'use client';

import { useState, useRef } from 'react';
import { DollarSign, MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShippingPreferences } from '@/components/create-listing/shipping-options';
import { HistoricalPriceTrend } from '@/components/create-listing/price-chart';
import { MOCK_PRICE_HISTORY } from '@/utils/mock-all-data-used';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import dynamic from 'next/dynamic';

const GoogleLocationMap = dynamic(() => import('@/components/create-listing/GoogleLocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-lg border-2 border-[var(--color-primary-200)] bg-[var(--color-primary-50)] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--color-secondary-600)]" />
    </div>
  ),
});

import { PartialFormData } from '@/types/listing-form';

interface PricingShippingStepProps {
  listingType: 'buy' | 'sell';
  formData: PartialFormData;
  setFormData: React.Dispatch<React.SetStateAction<PartialFormData>>;
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

function PricingShippingContent({
  listingType,
  formData,
  setFormData,
  recommendedPriceRange,
  showLocationDropdown,
  setShowLocationDropdown,
  filteredLocations: _filteredLocations,
  setFilteredLocations: _setFilteredLocations,
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
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 3.139,
    lng: 101.6869,
  });
  const [placePredictions, setPlacePredictions] = useState<google.maps.places.PlacePrediction[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const placesLibrary = useMapsLibrary('places');

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

  const handleLocationSelectFromMap = (locationName: string, coordinates: { lat: number; lng: number }) => {
    setFormData({ ...formData, location: locationName });
    setMapCoordinates(coordinates);
  };


  // Handle location search with Google Places Autocomplete
  const handleLocationSearch = (query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query || query.trim().length === 0) {
      setPlacePredictions([]);
      setShowLocationDropdown(false);
      return;
    }

    setIsSearchingPlaces(true);
    setShowLocationDropdown(true);

    searchTimeoutRef.current = setTimeout(async () => {
      if (!placesLibrary) {
        setIsSearchingPlaces(false);
        setPlacePredictions([]);
        return;
      }

      try {
        const { AutocompleteSuggestion } = placesLibrary;
        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
        });

        const predictions = suggestions
          .map(suggestion => suggestion.placePrediction)
          .filter((prediction): prediction is google.maps.places.PlacePrediction => prediction !== null);

        setPlacePredictions(predictions);
      } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        setPlacePredictions([]);
      }
      setIsSearchingPlaces(false);
    }, 300);
  };

  // Handle selection from search dropdown
  const handlePlaceSelect = async (placeId: string, description: string) => {
    if (!placesLibrary) return;

    setFormData({ ...formData, location: description });
    setShowLocationDropdown(false);
    setSelectedLocationIndex(-1);

    // Get place details using new Place class
    try {
      const { Place } = placesLibrary;
      const place = new Place({
        id: placeId,
      });

      await place.fetchFields({
        fields: ['location'],
      });

      if (place.location) {
        const lat = place.location.lat();
        const lng = place.location.lng();
        setMapCoordinates({ lat, lng });
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
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

            {/* Show selected location or search input */}
            {formData.location && !showLocationDropdown ? (
              <div
                className="p-3 bg-white rounded-lg border-2 border-[var(--color-primary-300)] cursor-pointer hover:border-[var(--color-secondary-500)] transition-colors"
                onClick={() => {
                  setFormData({ ...formData, location: '' });
                  setMapCoordinates({ lat: 3.139, lng: 101.6869 });
                }}
              >
                <p className="text-xs text-[var(--color-primary-700)] mb-1">Selected Location:</p>
                <p className="text-sm font-medium text-[var(--color-accent-700)] flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--color-secondary-600)]" />
                  <span>{formData.location}</span>
                </p>
                <p className="text-xs text-[var(--color-secondary-600)] mt-2">Click to change location</p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Input
                    id="locationInput"
                    type="text"
                    value={formData.location}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({...formData, location: value});
                      handleLocationSearch(value);
                      setSelectedLocationIndex(-1);
                    }}
                    onKeyDown={(e) => {
                      if (!showLocationDropdown || placePredictions.length === 0) return;

                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const nextIndex = selectedLocationIndex < placePredictions.length - 1 ? selectedLocationIndex + 1 : selectedLocationIndex;
                        setSelectedLocationIndex(nextIndex);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const nextIndex = selectedLocationIndex > 0 ? selectedLocationIndex - 1 : -1;
                        setSelectedLocationIndex(nextIndex);
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        if (selectedLocationIndex >= 0 && selectedLocationIndex < placePredictions.length) {
                          const prediction = placePredictions[selectedLocationIndex];
                          handlePlaceSelect(prediction.placeId, prediction.text.text);
                        }
                      } else if (e.key === 'Escape') {
                        setShowLocationDropdown(false);
                        setSelectedLocationIndex(-1);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setShowLocationDropdown(false);
                        setSelectedLocationIndex(-1);
                      }, 200);
                    }}
                    placeholder="Search for a city, address, or region..."
                    className="w-full text-sm sm:text-base border-[var(--color-primary-200)] bg-white text-[var(--color-accent-700)] pr-10"
                  />
                  {isSearchingPlaces && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-[var(--color-secondary-600)]" />
                    </div>
                  )}
                </div>

                {/* Location Dropdown - Google Places Predictions */}
                {showLocationDropdown && placePredictions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-[var(--color-primary-200)] rounded-lg shadow-lg">
                    {placePredictions.map((prediction, index) => (
                      <div
                        key={prediction.placeId}
                        onClick={() => handlePlaceSelect(prediction.placeId, prediction.text.text)}
                        onMouseEnter={() => setSelectedLocationIndex(index)}
                        className={`px-3 py-2 cursor-pointer text-sm sm:text-base transition-colors ${
                          selectedLocationIndex === index
                            ? 'bg-[var(--color-secondary-500)] text-[var(--color-accent-700)] font-semibold'
                            : 'hover:bg-[var(--color-primary-100)]'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--color-secondary-600)]" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--color-accent-700)]">
                              {prediction.mainText?.text || prediction.text.text}
                            </p>
                            <p className="text-xs text-[var(--color-primary-700)] truncate">
                              {prediction.secondaryText?.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showLocationDropdown && !isSearchingPlaces && placePredictions.length === 0 && formData.location && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-[var(--color-primary-200)] rounded-lg shadow-lg px-3 py-4 text-center">
                    <p className="text-sm text-[var(--color-primary-700)]">No locations found. Try a different search term.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Interactive Google Map */}
          <div className="mt-4">
            <Label className="text-xs sm:text-sm text-[var(--color-primary-900)] mb-2 block">
              Or click on the map to select
            </Label>
            <GoogleLocationMap
              location={formData.location}
              onLocationSelect={handleLocationSelectFromMap}
              initialCoordinates={mapCoordinates}
            />
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

export default function PricingShippingStep(props: PricingShippingStepProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <APIProvider apiKey={apiKey}>
      <PricingShippingContent {...props} />
    </APIProvider>
  );
}
