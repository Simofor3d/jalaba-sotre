import React, { useMemo } from 'react';
import {
  getAllRegions,
  getCitiesByRegion,
} from '../data/moroccoGeoData.ts';
import { MapPin } from 'lucide-react';

export interface SelectedGeoLocation {
  regionId: string;
  regionNameAr: string;
  cityId: string;
  cityNameAr: string;
  provinceId: string;
  provinceNameAr: string;
  communeId: string;
  communeNameAr: string;
  addressDetails: string;
}

interface MoroccoAddressSelectorProps {
  value: SelectedGeoLocation;
  onChange: (val: SelectedGeoLocation) => void;
  error?: string;
}

export const MoroccoAddressSelector: React.FC<MoroccoAddressSelectorProps> = ({
  value,
  onChange,
  error,
}) => {
  const regions = useMemo(() => getAllRegions(), []);
  const cities = useMemo(
    () => (value.regionId ? getCitiesByRegion(value.regionId) : []),
    [value.regionId]
  );

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regId = e.target.value;
    const reg = regions.find(r => r.id === regId);
    onChange({
      ...value,
      regionId: regId,
      regionNameAr: reg ? reg.name_ar : '',
      cityId: '',
      cityNameAr: '',
      provinceId: '',
      provinceNameAr: '',
      communeId: '',
      communeNameAr: '',
    });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    const city = cities.find(c => c.id === cityId);
    onChange({
      ...value,
      cityId,
      cityNameAr: city ? city.name_ar : '',
      provinceId: city ? city.province_id : '',
      provinceNameAr: city ? city.name_ar : '',
      communeId: city ? city.id : '',
      communeNameAr: city ? city.name_ar : '',
    });
  };

  const handleAddressDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      addressDetails: e.target.value,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-[#E5DAC6] bg-[#FAF7F2] p-4 text-right">
      <div className="flex items-center justify-between border-b border-[#E5DAC6] pb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)]">
          <MapPin className="h-4 w-4 text-[var(--brand-accent)]" />
          <span>عنوان التوصيل بالمغرب</span>
        </div>
        <span className="text-[11px] text-stone-500">اختر الجهة ثم المدينة أو القرية</span>
      </div>

      {/* 2 Cascading Dropdowns: Region -> City/Village (Jumia style) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 1. Region Selector */}
        <div>
          <label
            htmlFor="checkout-region-select"
            className="mb-1 block text-xs font-medium text-stone-700"
          >
            الجهة <span className="text-red-500">*</span>
          </label>
          <select
            id="checkout-region-select"
            required
            value={value.regionId}
            onChange={handleRegionChange}
            className="w-full rounded-lg border border-[#D5C9B3] bg-white p-2.5 text-xs text-[#1E2522] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
          >
            <option value="">-- اختر الجهة --</option>
            {regions.map(reg => (
              <option key={reg.id} value={reg.id}>
                {reg.name_ar}
              </option>
            ))}
          </select>
        </div>

        {/* 2. City / Village Selector */}
        <div>
          <label
            htmlFor="checkout-city-select"
            className="mb-1 block text-xs font-medium text-stone-700"
          >
            المدينة أو القرية <span className="text-red-500">*</span>
          </label>
          <select
            id="checkout-city-select"
            required
            value={value.cityId}
            onChange={handleCityChange}
            disabled={!value.regionId}
            className="w-full rounded-lg border border-[#D5C9B3] bg-white p-2.5 text-xs text-[#1E2522] disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
          >
            <option value="">
              {value.regionId
                ? `-- اختر المدينة أو القرية (${cities.length}) --`
                : '-- اختر الجهة أولاً --'}
            </option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name_ar} ({city.name_fr})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Detailed Street / House Address */}
      <div>
        <label
          htmlFor="checkout-address-line"
          className="mb-1 block text-xs font-medium text-stone-700"
        >
          العنوان التفصيلي (الحي، الشارع، رقم المنزل/العمارة) <span className="text-red-500">*</span>
        </label>
        <input
          id="checkout-address-line"
          type="text"
          required
          placeholder="مثال: حي المسيرة، شارع محمد الخامس، عمارة ب، شقة 14"
          value={value.addressDetails}
          onChange={handleAddressDetailsChange}
          className="w-full rounded-lg border border-[#D5C9B3] bg-white p-2.5 text-xs text-[#1E2522] placeholder:text-stone-400 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
        />
      </div>

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
};
