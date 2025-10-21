'use client';

import React from 'react';
import { Truck, Handshake, Car, Package, Plane } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ShippingPreferencesProps {
  shippingOptions: string[];
  onShippingOptionsChange: (options: string[]) => void;
}

export function ShippingPreferences({ shippingOptions, onShippingOptionsChange }: ShippingPreferencesProps) {
  const shippingOptionsData = [
    { value: 'Meet in person', label: 'Meet in Person', description: 'Arrange a meetup at a public location', icon: Handshake },
    { value: 'Local delivery', label: 'Local Delivery', description: 'Seller delivers within local area', icon: Car },
    { value: 'Nationwide shipping', label: 'Nationwide Shipping', description: 'Courier delivery within the country', icon: Package },
    { value: 'International shipping', label: 'International Shipping', description: 'Accept items from overseas sellers', icon: Plane }
  ];

  const toggleShippingOption = (value: string) => {
    if (shippingOptions.includes(value)) {
      onShippingOptionsChange(shippingOptions.filter(o => o !== value));
    } else {
      onShippingOptionsChange([...shippingOptions, value]);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t-2 border-[var(--color-primary-300)]">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-6 h-6 text-[var(--color-secondary-500)]" />
        <Label className="text-base font-medium text-[var(--color-accent-700)]">
          Shipping Preferences
        </Label>
      </div>

      {shippingOptionsData.map((option) => {
        const IconComponent = option.icon;
        return (
          <Card
            key={option.value}
            className={`cursor-pointer transition-all hover:shadow-md border-2 ${
              shippingOptions.includes(option.value)
                ? 'border-[var(--color-secondary-500)] bg-[var(--color-secondary-400)]'
                : 'border-gray-200 bg-white'
            }`}
            onClick={() => toggleShippingOption(option.value)}
          >
            <CardContent className="flex items-start gap-4 p-4">
              <Checkbox checked={shippingOptions.includes(option.value)} className="mt-1" />
              <div className="flex items-start gap-3 flex-1">
                <IconComponent className="w-8 h-8 text-[var(--color-secondary-600)]" />
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1 text-[var(--color-accent-700)]">{option.label}</h3>
                  <p className="text-sm text-[var(--color-primary-900)]">{option.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

    </div>
  );
}
