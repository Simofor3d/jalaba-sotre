import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllRegions,
  getCitiesByRegion,
  getProvincesByRegion,
  getCommunesByProvince,
  validateMoroccoAddressHierarchy,
  validateMoroccoRegionCity,
  searchLocations,
} from './moroccoGeoData.ts';

test('Morocco Geographic Data - 12 Official Regions', () => {
  const regions = getAllRegions();
  assert.equal(regions.length, 12, 'Must contain exactly the 12 official Moroccan administrative regions');
  assert.ok(regions.some(r => r.name_ar.includes('الدار البيضاء')), 'Casablanca-Settat must exist');
  assert.ok(regions.some(r => r.name_ar.includes('مراكش')), 'Marrakech-Safi must exist');
  assert.ok(regions.some(r => r.name_ar.includes('طنجة')), 'Tanger-Tétouan must exist');
});

test('Morocco Geographic Data - Every Region has comprehensive Cities & Villages', () => {
  const regions = getAllRegions();
  for (const reg of regions) {
    const cities = getCitiesByRegion(reg.id);
    assert.ok(cities.length >= 5, `Region ${reg.name_ar} (${reg.id}) must have at least 5 cities/villages`);
    for (const city of cities) {
      assert.equal(city.region_id, reg.id);
      assert.ok(city.name_ar.trim().length > 0);
      assert.ok(city.province_id.startsWith('prov-'));
    }
  }
  const casaCities = getCitiesByRegion('reg-06');
  assert.ok(casaCities.some(c => c.name_ar === 'الدار البيضاء'));
  assert.ok(casaCities.some(c => c.name_ar === 'سطات'));
  assert.ok(casaCities.some(c => c.name_ar === 'الجديدة'));
  assert.ok(casaCities.some(c => c.name_ar === 'بوسكورة'));
});

test('Morocco Geographic Validation - 2-Step Region -> City validation works', () => {
  const valid = validateMoroccoRegionCity('reg-01', 'city-chefchaouen');
  assert.equal(valid.isValid, true);
  assert.equal(valid.city?.name_ar, 'شفشاون');

  const mismatched = validateMoroccoRegionCity('reg-06', 'city-chefchaouen');
  assert.equal(mismatched.isValid, false);
  assert.match(mismatched.error || '', /لا تنتمي/);

  const unknown = validateMoroccoRegionCity('reg-06', 'city-nonexistent');
  assert.equal(unknown.isValid, false);
});

test('Morocco Geographic Data - Provinces correctly mapped to Regions', () => {
  // Casablanca-Settat has id 'reg-06'
  const casaProvinces = getProvincesByRegion('reg-06');
  assert.ok(casaProvinces.length >= 7, 'Casablanca-Settat should have its official prefectures and provinces');
  assert.ok(casaProvinces.some(p => p.id === 'prov-casa'), 'Préfecture de Casablanca must belong to reg-06');
  assert.ok(casaProvinces.some(p => p.id === 'prov-moham'), 'Préfecture de Mohammedia must belong to reg-06');

  // Tanger has id 'reg-01'
  const tangerProvinces = getProvincesByRegion('reg-01');
  assert.ok(tangerProvinces.some(p => p.id === 'prov-tng'));
  assert.ok(tangerProvinces.some(p => p.id === 'prov-tet'));
});

test('Morocco Geographic Data - Communes correctly mapped to Provinces', () => {
  const casaCommunes = getCommunesByProvince('prov-casa');
  assert.ok(casaCommunes.length > 0, 'Casablanca must have communes');
  assert.ok(casaCommunes.some(c => c.id === 'com-casa-maar'), 'Maârif commune must exist in Casablanca');
});

test('Morocco Geographic Validation - Valid hierarchy passes', () => {
  const result = validateMoroccoAddressHierarchy('reg-06', 'prov-casa', 'com-casa-maar');
  assert.equal(result.isValid, true, 'Valid Casablanca address hierarchy should pass');
});

test('Morocco Geographic Validation - Rejects mismatched province to region', () => {
  // Tanger province under Casablanca region
  const result = validateMoroccoAddressHierarchy('reg-06', 'prov-tng', 'com-casa-maar');
  assert.equal(result.isValid, false, 'Province mismatch must be rejected');
  assert.match(result.error || '', /لا ينتمي/);
});

test('Morocco Geographic Validation - Rejects mismatched commune to province', () => {
  // Agdal Rabat commune under Casablanca province
  const result = validateMoroccoAddressHierarchy('reg-04', 'prov-rab', 'com-casa-maar');
  assert.equal(result.isValid, false, 'Commune mismatch must be rejected');
});

test('Morocco Geographic Search - Bilingual search works', () => {
  const arabicSearch = searchLocations('فاس');
  assert.ok(arabicSearch.regions.length > 0 || arabicSearch.provinces.length > 0);

  const frenchSearch = searchLocations('Marrakech');
  assert.ok(frenchSearch.regions.length > 0 || frenchSearch.provinces.length > 0);
});
