/**
 * Official Moroccan Geographic Administrative Hierarchy
 * Source: Haut-Commissariat au Plan (HCP) & Ministère de l'Intérieur du Royaume du Maroc
 * Décret n° 2-15-40 (12 Régions, 75 Provinces & Préfectures, Communes)
 */

export interface Region {
  id: string;
  code: string;
  name_ar: string;
  name_fr: string;
}

export interface Province {
  id: string;
  region_id: string;
  code: string;
  name_ar: string;
  name_fr: string;
  is_prefecture: boolean;
}

export interface Commune {
  id: string;
  province_id: string;
  code: string;
  name_ar: string;
  name_fr: string;
  is_urban: boolean;
}

export interface Locality {
  id: string;
  commune_id: string;
  name_ar: string;
  name_fr: string;
  postal_code?: string;
}

export interface MoroccoCity {
  id: string;
  region_id: string;
  province_id: string;
  name_ar: string;
  name_fr: string;
}

export const MOROCCAN_REGIONS: Region[] = [
  { id: 'reg-01', code: '01', name_ar: 'جهة طنجة - تطوان - الحسيمة', name_fr: 'Tanger-Tétouan-Al Hoceïma' },
  { id: 'reg-02', code: '02', name_ar: 'جهة الشرق', name_fr: "L'Oriental" },
  { id: 'reg-03', code: '03', name_ar: 'جهة فاس - مكناس', name_fr: 'Fès-Meknès' },
  { id: 'reg-04', code: '04', name_ar: 'جهة الرباط - سلا - القنيطرة', name_fr: 'Rabat-Salé-Kénitra' },
  { id: 'reg-05', code: '05', name_ar: 'جهة بني ملال - خنيفرة', name_fr: 'Béni Mellal-Khénifra' },
  { id: 'reg-06', code: '06', name_ar: 'جهة الدار البيضاء - سطات', name_fr: 'Casablanca-Settat' },
  { id: 'reg-07', code: '07', name_ar: 'جهة مراكش - آسفي', name_fr: 'Marrakech-Safi' },
  { id: 'reg-08', code: '08', name_ar: 'جهة درعة - تافيلالت', name_fr: 'Drâa-Tafilalet' },
  { id: 'reg-09', code: '09', name_ar: 'جهة سوس - ماسة', name_fr: 'Souss-Massa' },
  { id: 'reg-10', code: '10', name_ar: 'جهة كلميم - واد نون', name_fr: 'Guelmim-Oued Noun' },
  { id: 'reg-11', code: '11', name_ar: 'جهة العيون - الساقية الحمراء', name_fr: 'Laâyoune-Sakia El Hamra' },
  { id: 'reg-12', code: '12', name_ar: 'جهة الداخلة - وادي الذهب', name_fr: 'Dakhla-Oued Ed-Dahab' },
];

export const MOROCCAN_PROVINCES: Province[] = [
  // Région 01: Tanger-Tétouan-Al Hoceïma
  { id: 'prov-tng', region_id: 'reg-01', code: '01.511', name_ar: 'عمالة طنجة - أصيلة', name_fr: 'Préfecture de Tanger-Assilah', is_prefecture: true },
  { id: 'prov-tet', region_id: 'reg-01', code: '01.571', name_ar: 'إقليم تطوان', name_fr: 'Province de Tétouan', is_prefecture: false },
  { id: 'prov-hoc', region_id: 'reg-01', code: '01.051', name_ar: 'إقليم الحسيمة', name_fr: "Province d'Al Hoceïma", is_prefecture: false },
  { id: 'prov-lar', region_id: 'reg-01', code: '01.331', name_ar: 'إقليم العرائش', name_fr: 'Province de Larache', is_prefecture: false },
  { id: 'prov-chf', region_id: 'reg-01', code: '01.151', name_ar: 'إقليم شفشاون', name_fr: 'Province de Chefchaouen', is_prefecture: false },
  { id: 'prov-mde', region_id: 'reg-01', code: '01.573', name_ar: 'عمالة المضيق - الفنيدق', name_fr: 'Préfecture de Mdiq-Fnideq', is_prefecture: true },
  { id: 'prov-ouez', region_id: 'reg-01', code: '01.405', name_ar: 'إقليم وزان', name_fr: 'Province d\'Ouezzane', is_prefecture: false },

  // Région 02: L'Oriental
  { id: 'prov-ouj', region_id: 'reg-02', code: '02.411', name_ar: 'عمالة وجدة - أنكاد', name_fr: 'Préfecture d\'Oujda-Angad', is_prefecture: true },
  { id: 'prov-nad', region_id: 'reg-02', code: '02.381', name_ar: 'إقليم الناظور', name_fr: 'Province de Nador', is_prefecture: false },
  { id: 'prov-ber', region_id: 'reg-02', code: '02.111', name_ar: 'إقليم بركان', name_fr: 'Province de Berkane', is_prefecture: false },
  { id: 'prov-drou', region_id: 'reg-02', code: '02.383', name_ar: 'إقليم الدريوش', name_fr: 'Province de Driouch', is_prefecture: false },
  { id: 'prov-tau', region_id: 'reg-02', code: '02.531', name_ar: 'إقليم تاوريرت', name_fr: 'Province de Taourirt', is_prefecture: false },
  { id: 'prov-jra', region_id: 'reg-02', code: '02.275', name_ar: 'إقليم جرادة', name_fr: 'Province de Jerada', is_prefecture: false },
  { id: 'prov-fig', region_id: 'reg-02', code: '02.251', name_ar: 'إقليم فكيك', name_fr: 'Province de Figuig', is_prefecture: false },
  { id: 'prov-gue', region_id: 'reg-02', code: '02.271', name_ar: 'إقليم جرسيف', name_fr: 'Province de Guercif', is_prefecture: false },

  // Région 03: Fès-Meknès
  { id: 'prov-fes', region_id: 'reg-03', code: '03.231', name_ar: 'عمالة فاس', name_fr: 'Préfecture de Fès', is_prefecture: true },
  { id: 'prov-mek', region_id: 'reg-03', code: '03.351', name_ar: 'عمالة مكناس', name_fr: 'Préfecture de Meknès', is_prefecture: true },
  { id: 'prov-taza', region_id: 'reg-03', code: '03.561', name_ar: 'إقليم تازة', name_fr: 'Province de Taza', is_prefecture: false },
  { id: 'prov-sef', region_id: 'reg-03', code: '03.451', name_ar: 'إقليم صفرو', name_fr: 'Province de Séfrou', is_prefecture: false },
  { id: 'prov-ifr', region_id: 'reg-03', code: '03.271', name_ar: 'إقليم إفران', name_fr: 'Province d\'Ifrane', is_prefecture: false },
  { id: 'prov-toun', region_id: 'reg-03', code: '03.533', name_ar: 'إقليم تاونات', name_fr: 'Province de Taounate', is_prefecture: false },
  { id: 'prov-haj', region_id: 'reg-03', code: '03.211', name_ar: 'إقليم الحاجب', name_fr: 'Province d\'El Hajeb', is_prefecture: false },
  { id: 'prov-bou', region_id: 'reg-03', code: '03.131', name_ar: 'إقليم بولمان', name_fr: 'Province de Boulemane', is_prefecture: false },
  { id: 'prov-mya', region_id: 'reg-03', code: '03.371', name_ar: 'إقليم مولاي يعقوب', name_fr: 'Province de Moulay Yacoub', is_prefecture: false },

  // Région 04: Rabat-Salé-Kénitra
  { id: 'prov-rab', region_id: 'reg-04', code: '04.421', name_ar: 'عمالة الرباط', name_fr: 'Préfecture de Rabat', is_prefecture: true },
  { id: 'prov-sal', region_id: 'reg-04', code: '04.441', name_ar: 'عمالة سلا', name_fr: 'Préfecture de Salé', is_prefecture: true },
  { id: 'prov-skh', region_id: 'reg-04', code: '04.501', name_ar: 'عمالة الصخيرات - تمارة', name_fr: 'Préfecture de Skhirate-Témara', is_prefecture: true },
  { id: 'prov-ken', region_id: 'reg-04', code: '04.281', name_ar: 'إقليم القنيطرة', name_fr: 'Province de Kénitra', is_prefecture: false },
  { id: 'prov-khe', region_id: 'reg-04', code: '04.291', name_ar: 'إقليم الخميسات', name_fr: 'Province de Khémisset', is_prefecture: false },
  { id: 'prov-skac', region_id: 'reg-04', code: '04.481', name_ar: 'إقليم سيدي قاسم', name_fr: 'Province de Sidi Kacem', is_prefecture: false },
  { id: 'prov-ssli', region_id: 'reg-04', code: '04.491', name_ar: 'إقليم سيدي سليمان', name_fr: 'Province de Sidi Slimane', is_prefecture: false },

  // Région 05: Béni Mellal-Khénifra
  { id: 'prov-ben', region_id: 'reg-05', code: '05.091', name_ar: 'إقليم بني ملال', name_fr: 'Province de Béni Mellal', is_prefecture: false },
  { id: 'prov-khe-fr', region_id: 'reg-05', code: '05.301', name_ar: 'إقليم خنيفرة', name_fr: 'Province de Khénifra', is_prefecture: false },
  { id: 'prov-kho', region_id: 'reg-05', code: '05.311', name_ar: 'إقليم خريبكة', name_fr: 'Province de Khouribga', is_prefecture: false },
  { id: 'prov-azil', region_id: 'reg-05', code: '05.081', name_ar: 'إقليم أزيلال', name_fr: 'Province d\'Azilal', is_prefecture: false },
  { id: 'prov-fqi', region_id: 'reg-05', code: '05.255', name_ar: 'إقليم الفقيه بن صالح', name_fr: 'Province de Fquih Ben Salah', is_prefecture: false },

  // Région 06: Casablanca-Settat
  { id: 'prov-casa', region_id: 'reg-06', code: '06.141', name_ar: 'عمالة الدار البيضاء الكبرى', name_fr: 'Préfecture de Casablanca', is_prefecture: true },
  { id: 'prov-moham', region_id: 'reg-06', code: '06.361', name_ar: 'عمالة المحمدية', name_fr: 'Préfecture de Mohammedia', is_prefecture: true },
  { id: 'prov-nou', region_id: 'reg-06', code: '06.391', name_ar: 'إقليم النواصر', name_fr: 'Province de Nouaceur', is_prefecture: false },
  { id: 'prov-med', region_id: 'reg-06', code: '06.355', name_ar: 'إقليم مديونة', name_fr: 'Province de Médiouna', is_prefecture: false },
  { id: 'prov-jad', region_id: 'reg-06', code: '06.181', name_ar: 'إقليم الجديدة', name_fr: 'Province d\'El Jadida', is_prefecture: false },
  { id: 'prov-set', region_id: 'reg-06', code: '06.461', name_ar: 'إقليم سطات', name_fr: 'Province de Settat', is_prefecture: false },
  { id: 'prov-berr', region_id: 'reg-06', code: '06.115', name_ar: 'إقليم برشيد', name_fr: 'Province de Berrechid', is_prefecture: false },
  { id: 'prov-ben-sl', region_id: 'reg-06', code: '06.101', name_ar: 'إقليم بنسليمان', name_fr: 'Province de Benslimane', is_prefecture: false },
  { id: 'prov-sbenn', region_id: 'reg-06', code: '06.471', name_ar: 'إقليم سيدي بنور', name_fr: 'Province de Sidi Bennour', is_prefecture: false },

  // Région 07: Marrakech-Safi
  { id: 'prov-rak', region_id: 'reg-07', code: '07.351', name_ar: 'عمالة مراكش', name_fr: 'Préfecture de Marrakech', is_prefecture: true },
  { id: 'prov-safi', region_id: 'reg-07', code: '07.431', name_ar: 'إقليم آسفي', name_fr: 'Province de Safi', is_prefecture: false },
  { id: 'prov-essa', region_id: 'reg-07', code: '07.211', name_ar: 'إقليم الصويرة', name_fr: 'Province d\'Essaouira', is_prefecture: false },
  { id: 'prov-haouz', region_id: 'reg-07', code: '07.061', name_ar: 'إقليم الحوز', name_fr: 'Province d\'Al Haouz', is_prefecture: false },
  { id: 'prov-kalaa', region_id: 'reg-07', code: '07.191', name_ar: 'إقليم قلعة السراغنة', name_fr: 'Province d\'El Kelâa des Sraghna', is_prefecture: false },
  { id: 'prov-chich', region_id: 'reg-07', code: '07.161', name_ar: 'إقليم شيشاوة', name_fr: 'Province de Chichaoua', is_prefecture: false },
  { id: 'prov-reham', region_id: 'reg-07', code: '07.425', name_ar: 'إقليم الرحامنة', name_fr: 'Province de Rehamna', is_prefecture: false },
  { id: 'prov-youss', region_id: 'reg-07', code: '07.591', name_ar: 'إقليم اليوسفية', name_fr: 'Province de Youssoufia', is_prefecture: false },

  // Région 08: Drâa-Tafilalet
  { id: 'prov-erf', region_id: 'reg-08', code: '08.201', name_ar: 'إقليم الرشيدية', name_fr: 'Province d\'Errachidia', is_prefecture: false },
  { id: 'prov-ouarz', region_id: 'reg-08', code: '08.401', name_ar: 'إقليم ورزازات', name_fr: 'Province d\'Ouarzazate', is_prefecture: false },
  { id: 'prov-mid', region_id: 'reg-08', code: '08.365', name_ar: 'إقليم ميدلت', name_fr: 'Province de Midelt', is_prefecture: false },
  { id: 'prov-ting', region_id: 'reg-08', code: '08.575', name_ar: 'إقليم تنغير', name_fr: 'Province de Tinghir', is_prefecture: false },
  { id: 'prov-zag', region_id: 'reg-08', code: '08.581', name_ar: 'إقليم زاكورة', name_fr: 'Province de Zagora', is_prefecture: false },

  // Région 09: Souss-Massa
  { id: 'prov-agad', region_id: 'reg-09', code: '09.001', name_ar: 'عمالة أكادير إداوتنان', name_fr: 'Préfecture d\'Agadir-Ida-Ou-Tanane', is_prefecture: true },
  { id: 'prov-inz', region_id: 'reg-09', code: '09.273', name_ar: 'عمالة إنزكان - آيت ملول', name_fr: 'Préfecture d\'Inezgane-Aït Melloul', is_prefecture: true },
  { id: 'prov-tar', region_id: 'reg-09', code: '09.541', name_ar: 'إقليم تارودانت', name_fr: 'Province de Taroudant', is_prefecture: false },
  { id: 'prov-tiz', region_id: 'reg-09', code: '09.551', name_ar: 'إقليم تيزنيت', name_fr: 'Province de Tiznit', is_prefecture: false },
  { id: 'prov-chtou', region_id: 'reg-09', code: '09.163', name_ar: 'إقليم اشتوكة آيت باها', name_fr: 'Province de Chtouka-Aït Baha', is_prefecture: false },
  { id: 'prov-tata', region_id: 'reg-09', code: '09.553', name_ar: 'إقليم طاطا', name_fr: 'Province de Tata', is_prefecture: false },

  // Région 10: Guelmim-Oued Noun
  { id: 'prov-guel', region_id: 'reg-10', code: '10.261', name_ar: 'إقليم كلميم', name_fr: 'Province de Guelmim', is_prefecture: false },
  { id: 'prov-tant', region_id: 'reg-10', code: '10.521', name_ar: 'إقليم طانطان', name_fr: 'Province de Tan-Tan', is_prefecture: false },
  { id: 'prov-sbou', region_id: 'reg-10', code: '10.485', name_ar: 'إقليم سيدي إفني', name_fr: 'Province de Sidi Ifni', is_prefecture: false },
  { id: 'prov-assa', region_id: 'reg-10', code: '10.071', name_ar: 'إقليم آسا - الزاك', name_fr: 'Province d\'Assa-Zag', is_prefecture: false },

  // Région 11: Laâyoune-Sakia El Hamra
  { id: 'prov-lay', region_id: 'reg-11', code: '11.321', name_ar: 'إقليم العيون', name_fr: 'Province de Laâyoune', is_prefecture: false },
  { id: 'prov-bouj', region_id: 'reg-11', code: '11.121', name_ar: 'إقليم بوجدور', name_fr: 'Province de Boujdour', is_prefecture: false },
  { id: 'prov-tarf', region_id: 'reg-11', code: '11.535', name_ar: 'إقليم طرفاية', name_fr: 'Province de Tarfaya', is_prefecture: false },
  { id: 'prov-essem', region_id: 'reg-11', code: '11.221', name_ar: 'إقليم السمارة', name_fr: 'Province d\'Es-Semara', is_prefecture: false },

  // Région 12: Dakhla-Oued Ed-Dahab
  { id: 'prov-ouedd', region_id: 'reg-12', code: '12.395', name_ar: 'إقليم وادي الذهب', name_fr: 'Province d\'Oued Ed-Dahab', is_prefecture: false },
  { id: 'prov-aouss', region_id: 'reg-12', code: '12.065', name_ar: 'إقليم أوسرد', name_fr: 'Province d\'Aousserd', is_prefecture: false },
];

export const MOROCCAN_COMMUNES: Commune[] = [
  // Casablanca
  { id: 'com-casa-maar', province_id: 'prov-casa', code: '06.141.01', name_ar: 'جماعة المعاريف', name_fr: 'Commune Maârif', is_urban: true },
  { id: 'com-casa-anfa', province_id: 'prov-casa', code: '06.141.02', name_ar: 'جماعة أنفا', name_fr: 'Commune Anfa', is_urban: true },
  { id: 'com-casa-sidi-b', province_id: 'prov-casa', code: '06.141.03', name_ar: 'جماعة سيدي بليوط', name_fr: 'Commune Sidi Belyout', is_urban: true },
  { id: 'com-casa-gauth', province_id: 'prov-casa', code: '06.141.04', name_ar: 'جماعة بوركون - غوتييه', name_fr: 'Bourgogne - Gauthier', is_urban: true },
  { id: 'com-casa-ain-diab', province_id: 'prov-casa', code: '06.141.05', name_ar: 'جماعة عين الذئاب', name_fr: 'Aïn Diab', is_urban: true },
  { id: 'com-casa-hay-hass', province_id: 'prov-casa', code: '06.141.06', name_ar: 'جماعة الحي الحسني', name_fr: 'Hay Hassani', is_urban: true },
  { id: 'com-casa-calif', province_id: 'prov-casa', code: '06.141.07', name_ar: 'جماعة كاليفورنيا - عين الشق', name_fr: 'Aïn Chock - Californie', is_urban: true },
  { id: 'com-casa-sidi-maar', province_id: 'prov-casa', code: '06.141.08', name_ar: 'جماعة سيدي معروف', name_fr: 'Sidi Maârouf', is_urban: true },
  { id: 'com-casa-bernous', province_id: 'prov-casa', code: '06.141.09', name_ar: 'جماعة سيدي البرنوصي', name_fr: 'Sidi Bernoussi', is_urban: true },
  { id: 'com-casa-roches', province_id: 'prov-casa', code: '06.141.10', name_ar: 'جماعة الصخور السوداء', name_fr: 'Roches Noires', is_urban: true },

  // Mohammedia & Nouaceur
  { id: 'com-moh-ville', province_id: 'prov-moham', code: '06.361.01', name_ar: 'بلدية المحمدية', name_fr: 'Mohammedia Ville', is_urban: true },
  { id: 'com-moh-mansour', province_id: 'prov-moham', code: '06.361.02', name_ar: 'جماعة المنصورية', name_fr: 'Mansouria', is_urban: false },
  { id: 'com-nou-bousk', province_id: 'prov-nou', code: '06.391.01', name_ar: 'جماعة بوسكورة', name_fr: 'Bouskoura', is_urban: true },
  { id: 'com-nou-dar-bou', province_id: 'prov-nou', code: '06.391.02', name_ar: 'جماعة دار بوعزة', name_fr: 'Dar Bouazza', is_urban: true },

  // Rabat
  { id: 'com-rab-hassan', province_id: 'prov-rab', code: '04.421.01', name_ar: 'جماعة حسان', name_fr: 'Commune Hassan', is_urban: true },
  { id: 'com-rab-agdal', province_id: 'prov-rab', code: '04.421.02', name_ar: 'جماعة أكدال - الرياض', name_fr: 'Agdal-Ryad', is_urban: true },
  { id: 'com-rab-souissi', province_id: 'prov-rab', code: '04.421.03', name_ar: 'جماعة السويسي', name_fr: 'Souissi', is_urban: true },
  { id: 'com-rab-yacoub', province_id: 'prov-rab', code: '04.421.04', name_ar: 'جماعة يعقوب المنصور', name_fr: 'Yacoub El Mansour', is_urban: true },
  { id: 'com-rab-yous', province_id: 'prov-rab', code: '04.421.05', name_ar: 'جماعة اليوسفية', name_fr: 'El Youssoufia', is_urban: true },

  // Salé & Témara
  { id: 'com-sal-bab-mr', province_id: 'prov-sal', code: '04.441.01', name_ar: 'جماعة باب المريسة - تابريكت', name_fr: 'Bab Mrisa - Tabriquet', is_urban: true },
  { id: 'com-sal-bettana', province_id: 'prov-sal', code: '04.441.02', name_ar: 'جماعة بطانة - العيايدة', name_fr: 'Bettana - Layayda', is_urban: true },
  { id: 'com-skh-temara', province_id: 'prov-skh', code: '04.501.01', name_ar: 'جماعة تمارة المركز', name_fr: 'Témara Centre', is_urban: true },
  { id: 'com-skh-harhoura', province_id: 'prov-skh', code: '04.501.02', name_ar: 'جماعة الهرهورة', name_fr: 'Harhoura', is_urban: true },
  { id: 'com-skh-skhirate', province_id: 'prov-skh', code: '04.501.03', name_ar: 'جماعة الصخيرات الشاطئ', name_fr: 'Skhirate Plage', is_urban: true },

  // Kénitra
  { id: 'com-ken-centre', province_id: 'prov-ken', code: '04.281.01', name_ar: 'جماعة القنيطرة المركز', name_fr: 'Kénitra Centre', is_urban: true },
  { id: 'com-ken-mehdia', province_id: 'prov-ken', code: '04.281.02', name_ar: 'جماعة المهدية الشاطئ', name_fr: 'Mehdia Plage', is_urban: true },

  // Marrakech
  { id: 'com-rak-gueliz', province_id: 'prov-rak', code: '07.351.01', name_ar: 'جماعة جليز', name_fr: 'Guéliz', is_urban: true },
  { id: 'com-rak-medina', province_id: 'prov-rak', code: '07.351.02', name_ar: 'جماعة المدينة العتيقة', name_fr: 'Médina de Marrakech', is_urban: true },
  { id: 'com-rak-menara', province_id: 'prov-rak', code: '07.351.03', name_ar: 'جماعة المنارة', name_fr: 'Ménara', is_urban: true },
  { id: 'com-rak-palmeraie', province_id: 'prov-rak', code: '07.351.04', name_ar: 'جماعة النخيل - تاركة', name_fr: 'Ennakhil - Targa', is_urban: true },
  { id: 'com-rak-sidi-you', province_id: 'prov-rak', code: '07.351.05', name_ar: 'جماعة سيدي يوسف بن علي', name_fr: 'Sidi Youssef Ben Ali', is_urban: true },

  // Fès
  { id: 'com-fes-agdal', province_id: 'prov-fes', code: '03.231.01', name_ar: 'جماعة فاس أكدال', name_fr: 'Fès Agdal', is_urban: true },
  { id: 'com-fes-medina', province_id: 'prov-fes', code: '03.231.02', name_ar: 'جماعة فاس المدينة العتيقة', name_fr: 'Fès Médina', is_urban: true },
  { id: 'com-fes-saiss', province_id: 'prov-fes', code: '03.231.03', name_ar: 'جماعة سايس', name_fr: 'Saïss', is_urban: true },
  { id: 'com-fes-zouagha', province_id: 'prov-fes', code: '03.231.04', name_ar: 'جماعة زواغة - بنسودة', name_fr: 'Zouagha - Bensouda', is_urban: true },

  // Meknès
  { id: 'com-mek-hamria', province_id: 'prov-mek', code: '03.351.01', name_ar: 'جماعة حمرية', name_fr: 'Hamria', is_urban: true },
  { id: 'com-mek-ismailia', province_id: 'prov-mek', code: '03.351.02', name_ar: 'جماعة الإسماعيلية', name_fr: 'Ismaïlia', is_urban: true },
  { id: 'com-mek-zitouna', province_id: 'prov-mek', code: '03.351.03', name_ar: 'جماعة الزيتونة', name_fr: 'Zitouna', is_urban: true },

  // Tanger & Tétouan
  { id: 'com-tng-medina', province_id: 'prov-tng', code: '01.511.01', name_ar: 'جماعة طنجة المدينة', name_fr: 'Tanger Médina', is_urban: true },
  { id: 'com-tng-malabata', province_id: 'prov-tng', code: '01.511.02', name_ar: 'جماعة مالاباطا - مغوغة', name_fr: 'Malabata - Moghogha', is_urban: true },
  { id: 'com-tng-beni-mak', province_id: 'prov-tng', code: '01.511.03', name_ar: 'جماعة بني مكادة', name_fr: 'Béni Makada', is_urban: true },
  { id: 'com-tng-souani', province_id: 'prov-tng', code: '01.511.04', name_ar: 'جماعة السواني', name_fr: 'Souani', is_urban: true },
  { id: 'com-tng-assilah', province_id: 'prov-tng', code: '01.511.05', name_ar: 'باشوية أصيلة', name_fr: 'Assilah Ville', is_urban: true },
  { id: 'com-tet-centre', province_id: 'prov-tet', code: '01.571.01', name_ar: 'جماعة تطوان المركز', name_fr: 'Tétouan Centre', is_urban: true },
  { id: 'com-tet-martil', province_id: 'prov-mde', code: '01.573.01', name_ar: 'جماعة مرتيل الشاطئ', name_fr: 'Martil', is_urban: true },
  { id: 'com-mde-fnideq', province_id: 'prov-mde', code: '01.573.02', name_ar: 'جماعة الفنيدق', name_fr: 'Fnideq', is_urban: true },
  { id: 'com-mde-rincon', province_id: 'prov-mde', code: '01.573.03', name_ar: 'جماعة المضيق رينكون', name_fr: 'Mdiq', is_urban: true },

  // Agadir
  { id: 'com-agd-centre', province_id: 'prov-agad', code: '09.001.01', name_ar: 'جماعة أكادير المركز', name_fr: 'Agadir Centre', is_urban: true },
  { id: 'com-agd-founty', province_id: 'prov-agad', code: '09.001.02', name_ar: 'حي صونابا - فونتي - الشاطئ', name_fr: 'Sonaba - Founty - Plage', is_urban: true },
  { id: 'com-agd-dakhla', province_id: 'prov-agad', code: '09.001.03', name_ar: 'حي الداخلة - السلام', name_fr: 'Dakhla - Salam', is_urban: true },
  { id: 'com-inz-centre', province_id: 'prov-inz', code: '09.273.01', name_ar: 'جماعة إنزكان', name_fr: 'Inezgane', is_urban: true },
  { id: 'com-inz-ait-m', province_id: 'prov-inz', code: '09.273.02', name_ar: 'جماعة آيت ملول', name_fr: 'Aït Melloul', is_urban: true },

  // Oujda & Nador
  { id: 'com-ouj-centre', province_id: 'prov-ouj', code: '02.411.01', name_ar: 'جماعة وجدة المركز', name_fr: 'Oujda Centre', is_urban: true },
  { id: 'com-nad-centre', province_id: 'prov-nad', code: '02.381.01', name_ar: 'جماعة الناظور المركز', name_fr: 'Nador Centre', is_urban: true },

  // Laâyoune & Dakhla
  { id: 'com-lay-centre', province_id: 'prov-lay', code: '11.321.01', name_ar: 'جماعة العيون المركز', name_fr: 'Laâyoune Centre', is_urban: true },
  { id: 'com-dak-centre', province_id: 'prov-ouedd', code: '12.395.01', name_ar: 'جماعة الداخلة المركز', name_fr: 'Dakhla Centre', is_urban: true },
];

export const MOROCCAN_LOCALITIES: Locality[] = [
  // Casablanca Maârif
  { id: 'loc-001', commune_id: 'com-casa-maar', name_ar: 'حي المعاريف شارع المسيرة الخضراء', name_fr: 'Maârif Bd Al Massira Al Khadra', postal_code: '20330' },
  { id: 'loc-002', commune_id: 'com-casa-maar', name_ar: 'حي فال فلوري / غاندي', name_fr: 'Val Fleuri / Bd Ghandi', postal_code: '20370' },
  { id: 'loc-003', commune_id: 'com-casa-anfa', name_ar: 'حي أنفا العليا / بولفار أنفا', name_fr: 'Anfa Supérieur / Bd d\'Anfa', postal_code: '20050' },
  { id: 'loc-004', commune_id: 'com-casa-sidi-b', name_ar: 'ساحة الأمم المتحدة / شارع محمد الخامس', name_fr: 'Place des Nations Unies / Bd Mohammed V', postal_code: '20000' },
  { id: 'loc-005', commune_id: 'com-casa-calif', name_ar: 'حي كاليفورنيا الراقي', name_fr: 'Quartier Californie', postal_code: '20460' },
  { id: 'loc-006', commune_id: 'com-casa-sidi-maar', name_ar: 'كازانيرشور / سيدي معروف', name_fr: 'Casanearshore / Sidi Maârouf', postal_code: '20270' },

  // Rabat Agdal & Souissi
  { id: 'loc-007', commune_id: 'com-rab-agdal', name_ar: 'أكدال - شارع فال ولد عمير', name_fr: 'Agdal - Av. Fal Ould Oumeir', postal_code: '10080' },
  { id: 'loc-008', commune_id: 'com-rab-agdal', name_ar: 'حي الرياض - شارع النخيل', name_fr: 'Hay Riad - Av. Annakhil', postal_code: '10100' },
  { id: 'loc-009', commune_id: 'com-rab-souissi', name_ar: 'حي السويسي - طريق زعير', name_fr: 'Souissi - Route des Zaërs', postal_code: '10170' },
  { id: 'loc-010', commune_id: 'com-rab-hassan', name_ar: 'حي حسان - قرب صومعة حسان', name_fr: 'Hassan - Tour Hassan', postal_code: '10020' },

  // Marrakech
  { id: 'loc-011', commune_id: 'com-rak-gueliz', name_ar: 'جليز - شارع محمد الخامس', name_fr: 'Guéliz - Av. Mohammed V', postal_code: '40000' },
  { id: 'loc-012', commune_id: 'com-rak-palmeraie', name_ar: 'النخيل - طريق الدار البيضاء', name_fr: 'Palmeraie - Route de Casablanca', postal_code: '40060' },
  { id: 'loc-013', commune_id: 'com-rak-menara', name_ar: 'حي إيفرناج / شارع فرنسا', name_fr: 'Hivernage / Av. de France', postal_code: '40020' },

  // Fès
  { id: 'loc-014', commune_id: 'com-fes-agdal', name_ar: 'فاس الجديد - شارع الحسن الثاني', name_fr: 'Fès Ville Nouvelle - Av. Hassan II', postal_code: '30000' },
  { id: 'loc-015', commune_id: 'com-fes-medina', name_ar: 'فاس البالي - الطالعة الكبيرة / البطحاء', name_fr: 'Fès El Bali - Talaa Kebira / Batha', postal_code: '30110' },

  // Tanger
  { id: 'loc-016', commune_id: 'com-tng-malabata', name_ar: 'مالاباطا كورنيش طنجة', name_fr: 'Malabata Corniche Tanger', postal_code: '90040' },
  { id: 'loc-017', commune_id: 'com-tng-medina', name_ar: 'القصبة وسور المعكازين', name_fr: 'Kasbah et Grand Socco', postal_code: '90000' },

  // Agadir
  { id: 'loc-018', commune_id: 'com-agd-founty', name_ar: 'مارينا أكادير والمنطقة السياحية', name_fr: 'Marina Agadir & Zone Touristique', postal_code: '80000' },
];

/**
 * Comprehensive Moroccan Cities, Towns & Villages by Region (Jumia Morocco style: Region -> City/Village)
 * Covers all 12 official regions of the Kingdom of Morocco.
 */
export const MOROCCAN_CITIES: MoroccoCity[] = [
  // =========================================================================
  // 01. جهة طنجة - تطوان - الحسيمة (Tanger-Tétouan-Al Hoceïma)
  // =========================================================================
  { id: 'city-tanger', region_id: 'reg-01', province_id: 'prov-tng', name_ar: 'طنجة', name_fr: 'Tanger' },
  { id: 'city-tetouan', region_id: 'reg-01', province_id: 'prov-tet', name_ar: 'تطوان', name_fr: 'Tétouan' },
  { id: 'city-al-hoceima', region_id: 'reg-01', province_id: 'prov-hoc', name_ar: 'الحسيمة', name_fr: 'Al Hoceïma' },
  { id: 'city-larache', region_id: 'reg-01', province_id: 'prov-lar', name_ar: 'العرائش', name_fr: 'Larache' },
  { id: 'city-ksar-el-kebir', region_id: 'reg-01', province_id: 'prov-lar', name_ar: 'القصر الكبير', name_fr: 'Ksar El Kébir' },
  { id: 'city-chefchaouen', region_id: 'reg-01', province_id: 'prov-chf', name_ar: 'شفشاون', name_fr: 'Chefchaouen' },
  { id: 'city-ouezzane', region_id: 'reg-01', province_id: 'prov-ouez', name_ar: 'وزان', name_fr: 'Ouezzane' },
  { id: 'city-mdiq', region_id: 'reg-01', province_id: 'prov-mde', name_ar: 'المضيق', name_fr: "M'diq" },
  { id: 'city-fnideq', region_id: 'reg-01', province_id: 'prov-mde', name_ar: 'الفنيدق', name_fr: 'Fnideq' },
  { id: 'city-martil', region_id: 'reg-01', province_id: 'prov-mde', name_ar: 'مرتيل', name_fr: 'Martil' },
  { id: 'city-assilah', region_id: 'reg-01', province_id: 'prov-tng', name_ar: 'أصيلة', name_fr: 'Assilah' },
  { id: 'city-imzouren', region_id: 'reg-01', province_id: 'prov-hoc', name_ar: 'إمزورن', name_fr: 'Imzouren' },
  { id: 'city-beni-bouayach', region_id: 'reg-01', province_id: 'prov-hoc', name_ar: 'بني بوعياش', name_fr: 'Bni Bouayach' },
  { id: 'city-targuisst', region_id: 'reg-01', province_id: 'prov-hoc', name_ar: 'تارجيست', name_fr: 'Targuist' },
  { id: 'city-oued-laou', region_id: 'reg-01', province_id: 'prov-tet', name_ar: 'واد لاو', name_fr: 'Oued Laou' },
  { id: 'city-bab-berred', region_id: 'reg-01', province_id: 'prov-chf', name_ar: 'باب برد', name_fr: 'Bab Berred' },
  { id: 'city-bab-taza', region_id: 'reg-01', province_id: 'prov-chf', name_ar: 'باب تازة', name_fr: 'Bab Taza' },
  { id: 'city-el-jebha', region_id: 'reg-01', province_id: 'prov-chf', name_ar: 'الجبهة', name_fr: 'El Jebha' },
  { id: 'city-gueznaia', region_id: 'reg-01', province_id: 'prov-tng', name_ar: 'كزناية', name_fr: 'Gueznaïa' },
  { id: 'city-ksar-sghir', region_id: 'reg-01', province_id: 'prov-tng', name_ar: 'القصر الصغير', name_fr: 'Ksar Sghir' },
  { id: 'city-melloussa', region_id: 'reg-01', province_id: 'prov-tng', name_ar: 'ملوسة', name_fr: 'Melloussa' },
  { id: 'city-had-el-gharbia', region_id: 'reg-01', province_id: 'prov-tng', name_ar: 'أحد الغربية', name_fr: 'Had El Gharbia' },
  { id: 'city-khemis-anjra', region_id: 'reg-01', province_id: 'prov-tet', name_ar: 'خميس أنجرة', name_fr: 'Khemis Anjra' },
  { id: 'city-azla', region_id: 'reg-01', province_id: 'prov-tet', name_ar: 'أزلا', name_fr: 'Azla' },
  { id: 'city-ajdir-hoc', region_id: 'reg-01', province_id: 'prov-hoc', name_ar: 'أجدير', name_fr: 'Ajdir' },
  { id: 'city-issaguen', region_id: 'reg-01', province_id: 'prov-hoc', name_ar: 'إساكن', name_fr: 'Issaguen' },
  { id: 'city-ketama', region_id: 'reg-01', province_id: 'prov-hoc', name_ar: 'كتامة', name_fr: 'Ketama' },
  { id: 'city-beni-hadifa', region_id: 'reg-01', province_id: 'prov-hoc', name_ar: 'بني حذيفة', name_fr: 'Bni Hadifa' },
  { id: 'city-laouamra', region_id: 'reg-01', province_id: 'prov-lar', name_ar: 'العوامرة', name_fr: 'Laouamra' },
  { id: 'city-khemis-sahel', region_id: 'reg-01', province_id: 'prov-lar', name_ar: 'سوق خميس الساحل', name_fr: 'Khemis Sahel' },
  { id: 'city-zoumi', region_id: 'reg-01', province_id: 'prov-ouez', name_ar: 'زومي', name_fr: 'Zoumi' },
  { id: 'city-mokrisset', region_id: 'reg-01', province_id: 'prov-ouez', name_ar: 'مقريصات', name_fr: 'Mokrisset' },
  { id: 'city-brikcha', region_id: 'reg-01', province_id: 'prov-ouez', name_ar: 'بريكشة', name_fr: 'Brikcha' },
  { id: 'city-cabo-negro', region_id: 'reg-01', province_id: 'prov-mde', name_ar: 'كابو نيغرو', name_fr: 'Cabo Negro' },

  // =========================================================================
  // 02. جهة الشرق (L'Oriental)
  // =========================================================================
  { id: 'city-oujda', region_id: 'reg-02', province_id: 'prov-ouj', name_ar: 'وجدة', name_fr: 'Oujda' },
  { id: 'city-nador', region_id: 'reg-02', province_id: 'prov-nad', name_ar: 'الناظور', name_fr: 'Nador' },
  { id: 'city-berkane', region_id: 'reg-02', province_id: 'prov-ber', name_ar: 'بركان', name_fr: 'Berkane' },
  { id: 'city-taourirt', region_id: 'reg-02', province_id: 'prov-tau', name_ar: 'تاوريرت', name_fr: 'Taourirt' },
  { id: 'city-guercif', region_id: 'reg-02', province_id: 'prov-gue', name_ar: 'جرسيف', name_fr: 'Guercif' },
  { id: 'city-jerada', region_id: 'reg-02', province_id: 'prov-jra', name_ar: 'جرادة', name_fr: 'Jerada' },
  { id: 'city-driouch', region_id: 'reg-02', province_id: 'prov-drou', name_ar: 'الدريوش', name_fr: 'Driouch' },
  { id: 'city-figuig', region_id: 'reg-02', province_id: 'prov-fig', name_ar: 'فكيك', name_fr: 'Figuig' },
  { id: 'city-saidia', region_id: 'reg-02', province_id: 'prov-ber', name_ar: 'السعيدية', name_fr: 'Saïdia' },
  { id: 'city-ahfir', region_id: 'reg-02', province_id: 'prov-ber', name_ar: 'أحفير', name_fr: 'Ahfir' },
  { id: 'city-al-aaroui', region_id: 'reg-02', province_id: 'prov-nad', name_ar: 'العروي', name_fr: 'Al Aaroui' },
  { id: 'city-zaio', region_id: 'reg-02', province_id: 'prov-nad', name_ar: 'زايو', name_fr: 'Zaïo' },
  { id: 'city-selouane', region_id: 'reg-02', province_id: 'prov-nad', name_ar: 'سلوان', name_fr: 'Selouane' },
  { id: 'city-beni-ensar', region_id: 'reg-02', province_id: 'prov-nad', name_ar: 'بني أنصار', name_fr: 'Bni Ansar' },
  { id: 'city-zeghanghane', region_id: 'reg-02', province_id: 'prov-nad', name_ar: 'أزغنغان', name_fr: 'Zeghanghane' },
  { id: 'city-ras-el-ma', region_id: 'reg-02', province_id: 'prov-nad', name_ar: 'راس الماء', name_fr: 'Ras El Ma' },
  { id: 'city-kariat-arkmane', region_id: 'reg-02', province_id: 'prov-nad', name_ar: 'قرية أركمان', name_fr: 'Kariat Arkmane' },
  { id: 'city-farkhana', region_id: 'reg-02', province_id: 'prov-nad', name_ar: 'فرخانة', name_fr: 'Farkhana' },
  { id: 'city-midar', region_id: 'reg-02', province_id: 'prov-drou', name_ar: 'ميضار', name_fr: 'Midar' },
  { id: 'city-ben-taieb', region_id: 'reg-02', province_id: 'prov-drou', name_ar: 'بن الطيب', name_fr: 'Ben Taïeb' },
  { id: 'city-ain-beni-mathar', region_id: 'reg-02', province_id: 'prov-jra', name_ar: 'عين بني مطهر', name_fr: 'Aïn Bni Mathar' },
  { id: 'city-el-aioun-sidi-mellouk', region_id: 'reg-02', province_id: 'prov-tau', name_ar: 'العيون سيدي ملوك', name_fr: 'El Aïoun Sidi Mellouk' },
  { id: 'city-bouarfa', region_id: 'reg-02', province_id: 'prov-fig', name_ar: 'بوعرفة', name_fr: 'Bouarfa' },
  { id: 'city-tendrara', region_id: 'reg-02', province_id: 'prov-fig', name_ar: 'تندرارة', name_fr: 'Tendrara' },
  { id: 'city-touissit', region_id: 'reg-02', province_id: 'prov-jra', name_ar: 'تويسيت', name_fr: 'Touissit' },
  { id: 'city-debdou', region_id: 'reg-02', province_id: 'prov-tau', name_ar: 'دبدو', name_fr: 'Debdou' },
  { id: 'city-aklim', region_id: 'reg-02', province_id: 'prov-ber', name_ar: 'أكليم', name_fr: 'Aklim' },
  { id: 'city-sidi-slimane-echcharraa', region_id: 'reg-02', province_id: 'prov-ber', name_ar: 'سيدي سليمان شراعة', name_fr: 'Sidi Slimane Echcharraa' },

  // =========================================================================
  // 03. جهة فاس - مكناس (Fès-Meknès)
  // =========================================================================
  { id: 'city-fes', region_id: 'reg-03', province_id: 'prov-fes', name_ar: 'فاس', name_fr: 'Fès' },
  { id: 'city-meknes', region_id: 'reg-03', province_id: 'prov-mek', name_ar: 'مكناس', name_fr: 'Meknès' },
  { id: 'city-taza', region_id: 'reg-03', province_id: 'prov-taza', name_ar: 'تازة', name_fr: 'Taza' },
  { id: 'city-sefrou', region_id: 'reg-03', province_id: 'prov-sef', name_ar: 'صفرو', name_fr: 'Séfrou' },
  { id: 'city-ifrane', region_id: 'reg-03', province_id: 'prov-ifr', name_ar: 'إفران', name_fr: 'Ifrane' },
  { id: 'city-azrou', region_id: 'reg-03', province_id: 'prov-ifr', name_ar: 'أزرو', name_fr: 'Azrou' },
  { id: 'city-el-hajeb', region_id: 'reg-03', province_id: 'prov-haj', name_ar: 'الحاجب', name_fr: 'El Hajeb' },
  { id: 'city-taounate', region_id: 'reg-03', province_id: 'prov-toun', name_ar: 'تاونات', name_fr: 'Taounate' },
  { id: 'city-boulemane', region_id: 'reg-03', province_id: 'prov-bou', name_ar: 'بولمان', name_fr: 'Boulemane' },
  { id: 'city-missour', region_id: 'reg-03', province_id: 'prov-bou', name_ar: 'ميسور', name_fr: 'Missour' },
  { id: 'city-moulay-yacoub', region_id: 'reg-03', province_id: 'prov-mya', name_ar: 'مولاي يعقوب', name_fr: 'Moulay Yacoub' },
  { id: 'city-moulay-idriss-zerhoun', region_id: 'reg-03', province_id: 'prov-mek', name_ar: 'مولاي إدريس زرهون', name_fr: 'Moulay Idriss Zerhoun' },
  { id: 'city-imouzzer-kandar', region_id: 'reg-03', province_id: 'prov-sef', name_ar: 'إيموزار كندر', name_fr: 'Imouzzer Kandar' },
  { id: 'city-bhalil', region_id: 'reg-03', province_id: 'prov-sef', name_ar: 'البهاليل', name_fr: 'Bhalil' },
  { id: 'city-ribate-el-kheir', region_id: 'reg-03', province_id: 'prov-sef', name_ar: 'رباط الخير (أهرمومو)', name_fr: 'Ribate El Kheir' },
  { id: 'city-el-menzel', region_id: 'reg-03', province_id: 'prov-sef', name_ar: 'المنزل', name_fr: 'El Menzel' },
  { id: 'city-tahla', region_id: 'reg-03', province_id: 'prov-taza', name_ar: 'تاهلة', name_fr: 'Tahla' },
  { id: 'city-oued-amlil', region_id: 'reg-03', province_id: 'prov-taza', name_ar: 'واد أمليل', name_fr: 'Oued Amlil' },
  { id: 'city-aknoul', region_id: 'reg-03', province_id: 'prov-taza', name_ar: 'أكنول', name_fr: 'Aknoul' },
  { id: 'city-tissa', region_id: 'reg-03', province_id: 'prov-toun', name_ar: 'تيسة', name_fr: 'Tissa' },
  { id: 'city-karia-ba-mohamed', region_id: 'reg-03', province_id: 'prov-toun', name_ar: 'قرية با محمد', name_fr: 'Karia Ba Mohamed' },
  { id: 'city-ghafsai', region_id: 'reg-03', province_id: 'prov-toun', name_ar: 'غفساي', name_fr: 'Ghafsaï' },
  { id: 'city-ain-aicha', region_id: 'reg-03', province_id: 'prov-toun', name_ar: 'عين عائشة', name_fr: 'Aïn Aïcha' },
  { id: 'city-ain-taoujdate', region_id: 'reg-03', province_id: 'prov-haj', name_ar: 'عين تاوجطات', name_fr: 'Aïn Taoujdate' },
  { id: 'city-sabaa-aiyoun', region_id: 'reg-03', province_id: 'prov-haj', name_ar: 'سبع عيون', name_fr: 'Sabaa Aïyoun' },
  { id: 'city-agourai', region_id: 'reg-03', province_id: 'prov-haj', name_ar: 'أكوراي', name_fr: 'Agouraï' },
  { id: 'city-boufakrane', region_id: 'reg-03', province_id: 'prov-mek', name_ar: 'بوفكران', name_fr: 'Boufakrane' },
  { id: 'city-toulal', region_id: 'reg-03', province_id: 'prov-mek', name_ar: 'تولال', name_fr: 'Toulal' },
  { id: 'city-ouislane', region_id: 'reg-03', province_id: 'prov-mek', name_ar: 'ويسلان', name_fr: 'Ouislane' },
  { id: 'city-outat-el-haj', region_id: 'reg-03', province_id: 'prov-bou', name_ar: 'أوطاط الحاج', name_fr: 'Outat El Haj' },
  { id: 'city-imouzzer-marmoucha', region_id: 'reg-03', province_id: 'prov-bou', name_ar: 'إيموزار مرموشة', name_fr: 'Imouzzer Marmoucha' },
  { id: 'city-ain-chkeff', region_id: 'reg-03', province_id: 'prov-mya', name_ar: 'عين شقف', name_fr: 'Aïn Chkeff' },
  { id: 'city-sidi-harazem', region_id: 'reg-03', province_id: 'prov-fes', name_ar: 'سيدي حرازم', name_fr: 'Sidi Harazem' },
  { id: 'city-ain-leuh', region_id: 'reg-03', province_id: 'prov-ifr', name_ar: 'عين اللوح', name_fr: 'Aïn Leuh' },
  { id: 'city-timahdite', region_id: 'reg-03', province_id: 'prov-ifr', name_ar: 'تمحضيت', name_fr: 'Timahdite' },

  // =========================================================================
  // 04. جهة الرباط - سلا - القنيطرة (Rabat-Salé-Kénitra)
  // =========================================================================
  { id: 'city-rabat', region_id: 'reg-04', province_id: 'prov-rab', name_ar: 'الرباط', name_fr: 'Rabat' },
  { id: 'city-sale', region_id: 'reg-04', province_id: 'prov-sal', name_ar: 'سلا', name_fr: 'Salé' },
  { id: 'city-sala-el-jadida', region_id: 'reg-04', province_id: 'prov-sal', name_ar: 'سلا الجديدة', name_fr: 'Sala Al Jadida' },
  { id: 'city-temara', region_id: 'reg-04', province_id: 'prov-skh', name_ar: 'تمارة', name_fr: 'Témara' },
  { id: 'city-skhirate', region_id: 'reg-04', province_id: 'prov-skh', name_ar: 'الصخيرات', name_fr: 'Skhirate' },
  { id: 'city-harhoura', region_id: 'reg-04', province_id: 'prov-skh', name_ar: 'الهرهورة', name_fr: 'Harhoura' },
  { id: 'city-ain-el-aouda', region_id: 'reg-04', province_id: 'prov-skh', name_ar: 'عين العودة', name_fr: 'Aïn El Aouda' },
  { id: 'city-ain-atiq', region_id: 'reg-04', province_id: 'prov-skh', name_ar: 'عين عتيق', name_fr: 'Aïn Atiq' },
  { id: 'city-kenitra', region_id: 'reg-04', province_id: 'prov-ken', name_ar: 'القنيطرة', name_fr: 'Kénitra' },
  { id: 'city-mehdia', region_id: 'reg-04', province_id: 'prov-ken', name_ar: 'المهدية', name_fr: 'Mehdia' },
  { id: 'city-khemisset', region_id: 'reg-04', province_id: 'prov-khe', name_ar: 'الخميسات', name_fr: 'Khémisset' },
  { id: 'city-tiflet', region_id: 'reg-04', province_id: 'prov-khe', name_ar: 'تيفلت', name_fr: 'Tiflet' },
  { id: 'city-sidi-kacem', region_id: 'reg-04', province_id: 'prov-skac', name_ar: 'سيدي قاسم', name_fr: 'Sidi Kacem' },
  { id: 'city-sidi-slimane', region_id: 'reg-04', province_id: 'prov-ssli', name_ar: 'سيدي سليمان', name_fr: 'Sidi Slimane' },
  { id: 'city-sidi-yahya-el-gharb', region_id: 'reg-04', province_id: 'prov-ssli', name_ar: 'سيدي يحيى الغرب', name_fr: 'Sidi Yahya El Gharb' },
  { id: 'city-mechraa-bel-ksiri', region_id: 'reg-04', province_id: 'prov-skac', name_ar: 'مشرع بلقصيري', name_fr: 'Mechraâ Bel Ksiri' },
  { id: 'city-souk-el-arbaa', region_id: 'reg-04', province_id: 'prov-ken', name_ar: 'سوق الأربعاء الغرب', name_fr: 'Souk El Arbaâ' },
  { id: 'city-rommani', region_id: 'reg-04', province_id: 'prov-khe', name_ar: 'الرماني', name_fr: 'Rommani' },
  { id: 'city-oulmes', region_id: 'reg-04', province_id: 'prov-khe', name_ar: 'والماس', name_fr: 'Oulmès' },
  { id: 'city-sidi-allal-bahraoui', region_id: 'reg-04', province_id: 'prov-khe', name_ar: 'سيدي علال البحراوي', name_fr: 'Sidi Allal El Bahraoui' },
  { id: 'city-sidi-bouknadel', region_id: 'reg-04', province_id: 'prov-sal', name_ar: 'سيدي بوقنادل', name_fr: 'Sidi Bouknadel' },
  { id: 'city-sidi-taibi', region_id: 'reg-04', province_id: 'prov-ken', name_ar: 'سيدي الطيبي', name_fr: 'Sidi Taïbi' },
  { id: 'city-jorf-el-melha', region_id: 'reg-04', province_id: 'prov-skac', name_ar: 'جرف الملحة', name_fr: 'Jorf El Melha' },
  { id: 'city-dar-gueddari', region_id: 'reg-04', province_id: 'prov-skac', name_ar: 'دار الكداري', name_fr: 'Dar Gueddari' },
  { id: 'city-had-kourt', region_id: 'reg-04', province_id: 'prov-skac', name_ar: 'حد كورت', name_fr: 'Had Kourt' },
  { id: 'city-lalla-mimouna', region_id: 'reg-04', province_id: 'prov-ken', name_ar: 'لالة ميمونة', name_fr: 'Lalla Mimouna' },
  { id: 'city-moulay-bousselham', region_id: 'reg-04', province_id: 'prov-ken', name_ar: 'مولاي بوسلهام', name_fr: 'Moulay Bousselham' },
  { id: 'city-sidi-allal-tazi', region_id: 'reg-04', province_id: 'prov-ken', name_ar: 'سيدي علال التازي', name_fr: 'Sidi Allal Tazi' },
  { id: 'city-maaziz', region_id: 'reg-04', province_id: 'prov-khe', name_ar: 'معازيز', name_fr: 'Maâziz' },
  { id: 'city-tiddas', region_id: 'reg-04', province_id: 'prov-khe', name_ar: 'تيداس', name_fr: 'Tiddas' },

  // =========================================================================
  // 05. جهة بني ملال - خنيفرة (Béni Mellal-Khénifra)
  // =========================================================================
  { id: 'city-beni-mellal', region_id: 'reg-05', province_id: 'prov-ben', name_ar: 'بني ملال', name_fr: 'Béni Mellal' },
  { id: 'city-khouribga', region_id: 'reg-05', province_id: 'prov-kho', name_ar: 'خريبكة', name_fr: 'Khouribga' },
  { id: 'city-khenifra', region_id: 'reg-05', province_id: 'prov-khe-fr', name_ar: 'خنيفرة', name_fr: 'Khénifra' },
  { id: 'city-fquih-ben-salah', region_id: 'reg-05', province_id: 'prov-fqi', name_ar: 'الفقيه بن صالح', name_fr: 'Fquih Ben Salah' },
  { id: 'city-azilal', region_id: 'reg-05', province_id: 'prov-azil', name_ar: 'أزيلال', name_fr: 'Azilal' },
  { id: 'city-kasba-tadla', region_id: 'reg-05', province_id: 'prov-ben', name_ar: 'قصبة تادلة', name_fr: 'Kasba Tadla' },
  { id: 'city-oued-zem', region_id: 'reg-05', province_id: 'prov-kho', name_ar: 'وادي زم', name_fr: 'Oued Zem' },
  { id: 'city-bejaad', region_id: 'reg-05', province_id: 'prov-kho', name_ar: 'أبي الجعد', name_fr: 'Bejaâd' },
  { id: 'city-souk-sebt', region_id: 'reg-05', province_id: 'prov-fqi', name_ar: 'سوق السبت أولاد النمة', name_fr: 'Souk Sebt Oulad Nemma' },
  { id: 'city-mrirt', region_id: 'reg-05', province_id: 'prov-khe-fr', name_ar: 'مريرت', name_fr: "M'rirt" },
  { id: 'city-demnate', region_id: 'reg-05', province_id: 'prov-azil', name_ar: 'دمنات', name_fr: 'Demnate' },
  { id: 'city-zaouiat-cheikh', region_id: 'reg-05', province_id: 'prov-ben', name_ar: 'زاوية الشيخ', name_fr: 'Zaouïat Cheikh' },
  { id: 'city-el-ksiba', region_id: 'reg-05', province_id: 'prov-ben', name_ar: 'القصيبة', name_fr: 'El Ksiba' },
  { id: 'city-afourer', region_id: 'reg-05', province_id: 'prov-azil', name_ar: 'أفورار', name_fr: 'Afourer' },
  { id: 'city-oulad-ayad', region_id: 'reg-05', province_id: 'prov-fqi', name_ar: 'أولاد عياد', name_fr: 'Oulad Ayad' },
  { id: 'city-oulad-mbarek', region_id: 'reg-05', province_id: 'prov-ben', name_ar: 'أولاد مبارك', name_fr: 'Oulad Mbarek' },
  { id: 'city-foum-el-anser', region_id: 'reg-05', province_id: 'prov-ben', name_ar: 'فم العنصر', name_fr: 'Foum El Anser' },
  { id: 'city-tagzirt', region_id: 'reg-05', province_id: 'prov-ben', name_ar: 'تاكزيرت', name_fr: 'Tagzirt' },
  { id: 'city-boujniba', region_id: 'reg-05', province_id: 'prov-kho', name_ar: 'بوجنيبة', name_fr: 'Boujniba' },
  { id: 'city-hattane', region_id: 'reg-05', province_id: 'prov-kho', name_ar: 'حطان', name_fr: 'Hattane' },
  { id: 'city-boulanouare', region_id: 'reg-05', province_id: 'prov-kho', name_ar: 'بولنوار', name_fr: 'Boulanouare' },
  { id: 'city-ouaouizeght', region_id: 'reg-05', province_id: 'prov-azil', name_ar: 'واويزغت', name_fr: 'Ouaouizeght' },
  { id: 'city-ouzoud', region_id: 'reg-05', province_id: 'prov-azil', name_ar: 'أوزود', name_fr: 'Ouzoud' },
  { id: 'city-bin-el-ouidane', region_id: 'reg-05', province_id: 'prov-azil', name_ar: 'بين الويدان', name_fr: 'Bin El Ouidane' },
  { id: 'city-aguelmous', region_id: 'reg-05', province_id: 'prov-khe-fr', name_ar: 'أجلموس', name_fr: 'Aguelmous' },
  { id: 'city-el-kbab', region_id: 'reg-05', province_id: 'prov-khe-fr', name_ar: 'القباب', name_fr: 'El Kbab' },
  { id: 'city-tighassaline', region_id: 'reg-05', province_id: 'prov-khe-fr', name_ar: 'تيغسالين', name_fr: 'Tighassaline' },

  // =========================================================================
  // 06. جهة الدار البيضاء - سطات (Casablanca-Settat)
  // =========================================================================
  { id: 'city-casablanca', region_id: 'reg-06', province_id: 'prov-casa', name_ar: 'الدار البيضاء', name_fr: 'Casablanca' },
  { id: 'city-mohammedia', region_id: 'reg-06', province_id: 'prov-moham', name_ar: 'المحمدية', name_fr: 'Mohammedia' },
  { id: 'city-el-jadida', region_id: 'reg-06', province_id: 'prov-jad', name_ar: 'الجديدة', name_fr: 'El Jadida' },
  { id: 'city-settat', region_id: 'reg-06', province_id: 'prov-set', name_ar: 'سطات', name_fr: 'Settat' },
  { id: 'city-berrechid', region_id: 'reg-06', province_id: 'prov-berr', name_ar: 'برشيد', name_fr: 'Berrechid' },
  { id: 'city-benslimane', region_id: 'reg-06', province_id: 'prov-ben-sl', name_ar: 'بنسليمان', name_fr: 'Benslimane' },
  { id: 'city-bouskoura', region_id: 'reg-06', province_id: 'prov-nou', name_ar: 'بوسكورة', name_fr: 'Bouskoura' },
  { id: 'city-dar-bouazza', region_id: 'reg-06', province_id: 'prov-nou', name_ar: 'دار بوعزة', name_fr: 'Dar Bouazza' },
  { id: 'city-nouaceur', region_id: 'reg-06', province_id: 'prov-nou', name_ar: 'النواصر', name_fr: 'Nouaceur' },
  { id: 'city-mediouna', region_id: 'reg-06', province_id: 'prov-med', name_ar: 'مديونة', name_fr: 'Médiouna' },
  { id: 'city-tit-mellil', region_id: 'reg-06', province_id: 'prov-med', name_ar: 'تيط مليل', name_fr: 'Tit Mellil' },
  { id: 'city-sidi-bennour', region_id: 'reg-06', province_id: 'prov-sbenn', name_ar: 'سيدي بنور', name_fr: 'Sidi Bennour' },
  { id: 'city-azemmour', region_id: 'reg-06', province_id: 'prov-jad', name_ar: 'أزمور', name_fr: 'Azemmour' },
  { id: 'city-bir-jdid', region_id: 'reg-06', province_id: 'prov-jad', name_ar: 'البئر الجديد', name_fr: 'Bir Jdid' },
  { id: 'city-bouznika', region_id: 'reg-06', province_id: 'prov-ben-sl', name_ar: 'بوزنيقة', name_fr: 'Bouznika' },
  { id: 'city-mansouria', region_id: 'reg-06', province_id: 'prov-ben-sl', name_ar: 'المنصورية', name_fr: 'Mansouria' },
  { id: 'city-lahraouyine', region_id: 'reg-06', province_id: 'prov-med', name_ar: 'الهراويين', name_fr: 'Lahraouyine' },
  { id: 'city-sidi-rahal-chatai', region_id: 'reg-06', province_id: 'prov-berr', name_ar: 'سيدي رحال الشاطئ', name_fr: 'Sidi Rahal Chataï' },
  { id: 'city-had-soualem', region_id: 'reg-06', province_id: 'prov-berr', name_ar: 'حد السوالم', name_fr: 'Had Soualem' },
  { id: 'city-deroua', region_id: 'reg-06', province_id: 'prov-berr', name_ar: 'الدروة', name_fr: 'Deroua' },
  { id: 'city-oulad-abbou', region_id: 'reg-06', province_id: 'prov-berr', name_ar: 'أولاد عبو', name_fr: 'Oulad Abbou' },
  { id: 'city-el-gara', region_id: 'reg-06', province_id: 'prov-berr', name_ar: 'الكارة', name_fr: 'El Gara' },
  { id: 'city-ben-ahmed', region_id: 'reg-06', province_id: 'prov-set', name_ar: 'بن أحمد', name_fr: 'Ben Ahmed' },
  { id: 'city-el-borouj', region_id: 'reg-06', province_id: 'prov-set', name_ar: 'البروج', name_fr: 'El Borouj' },
  { id: 'city-oulad-mrah', region_id: 'reg-06', province_id: 'prov-set', name_ar: 'أولاد امراح', name_fr: "Oulad M'rah" },
  { id: 'city-oulad-frej', region_id: 'reg-06', province_id: 'prov-jad', name_ar: 'أولاد فرج', name_fr: 'Oulad Frej' },
  { id: 'city-sidi-smail', region_id: 'reg-06', province_id: 'prov-jad', name_ar: 'سيدي اسماعيل', name_fr: 'Sidi Smaïl' },
  { id: 'city-moulay-abdellah', region_id: 'reg-06', province_id: 'prov-jad', name_ar: 'مولاي عبد الله', name_fr: 'Moulay Abdellah' },
  { id: 'city-zemamra', region_id: 'reg-06', province_id: 'prov-sbenn', name_ar: 'الزمامرة', name_fr: 'Zemamra' },
  { id: 'city-oualidia', region_id: 'reg-06', province_id: 'prov-sbenn', name_ar: 'الوليدية', name_fr: 'Oualidia' },
  { id: 'city-laounate', region_id: 'reg-06', province_id: 'prov-sbenn', name_ar: 'العونات', name_fr: 'Laounate' },
  { id: 'city-sidi-hajjaj', region_id: 'reg-06', province_id: 'prov-med', name_ar: 'سيدي حجاج واد حصار', name_fr: 'Sidi Hajjaj Oued Hassar' },
  { id: 'city-mejjatia', region_id: 'reg-06', province_id: 'prov-med', name_ar: 'المجاطية أولاد الطالب', name_fr: 'Mejjatia Oulad Taleb' },
  { id: 'city-ain-harrouda', region_id: 'reg-06', province_id: 'prov-moham', name_ar: 'عين حرودة', name_fr: 'Aïn Harrouda' },
  { id: 'city-ech-challalate', region_id: 'reg-06', province_id: 'prov-moham', name_ar: 'الشلالات', name_fr: 'Ech-Challalate' },
  { id: 'city-sidi-moussa-ben-ali', region_id: 'reg-06', province_id: 'prov-moham', name_ar: 'سيدي موسى بن علي', name_fr: 'Sidi Moussa Ben Ali' },

  // =========================================================================
  // 07. جهة مراكش - آسفي (Marrakech-Safi)
  // =========================================================================
  { id: 'city-marrakech', region_id: 'reg-07', province_id: 'prov-rak', name_ar: 'مراكش', name_fr: 'Marrakech' },
  { id: 'city-safi', region_id: 'reg-07', province_id: 'prov-safi', name_ar: 'آسفي', name_fr: 'Safi' },
  { id: 'city-essaouira', region_id: 'reg-07', province_id: 'prov-essa', name_ar: 'الصويرة', name_fr: 'Essaouira' },
  { id: 'city-kelaa-sraghna', region_id: 'reg-07', province_id: 'prov-kalaa', name_ar: 'قلعة السراغنة', name_fr: 'El Kelâa des Sraghna' },
  { id: 'city-benguerir', region_id: 'reg-07', province_id: 'prov-reham', name_ar: 'ابن جرير', name_fr: 'Ben Guerir' },
  { id: 'city-youssoufia', region_id: 'reg-07', province_id: 'prov-youss', name_ar: 'اليوسفية', name_fr: 'Youssoufia' },
  { id: 'city-chichaoua', region_id: 'reg-07', province_id: 'prov-chich', name_ar: 'شيشاوة', name_fr: 'Chichaoua' },
  { id: 'city-tahanaout', region_id: 'reg-07', province_id: 'prov-haouz', name_ar: 'تحناوت', name_fr: 'Tahannaout' },
  { id: 'city-ait-ourir', region_id: 'reg-07', province_id: 'prov-haouz', name_ar: 'آيت أورير', name_fr: 'Aït Ourir' },
  { id: 'city-amizmiz', region_id: 'reg-07', province_id: 'prov-haouz', name_ar: 'أمزميز', name_fr: 'Amizmiz' },
  { id: 'city-ourika', region_id: 'reg-07', province_id: 'prov-haouz', name_ar: 'أوريكا', name_fr: 'Ourika' },
  { id: 'city-asni', region_id: 'reg-07', province_id: 'prov-haouz', name_ar: 'أسني', name_fr: 'Asni' },
  { id: 'city-tameslohte', region_id: 'reg-07', province_id: 'prov-haouz', name_ar: 'تمصلوحت', name_fr: 'Tameslohte' },
  { id: 'city-sidi-rahal-haouz', region_id: 'reg-07', province_id: 'prov-kalaa', name_ar: 'سيدي رحال', name_fr: 'Sidi Rahhal' },
  { id: 'city-tamansourt', region_id: 'reg-07', province_id: 'prov-rak', name_ar: 'تامنصورت', name_fr: 'Tamansourt' },
  { id: 'city-laattaouia', region_id: 'reg-07', province_id: 'prov-kalaa', name_ar: 'العطاوية', name_fr: 'Laâttaouia' },
  { id: 'city-tamellalt', region_id: 'reg-07', province_id: 'prov-kalaa', name_ar: 'تملالت', name_fr: 'Tamellalt' },
  { id: 'city-imintanoute', region_id: 'reg-07', province_id: 'prov-chich', name_ar: 'إمنتانوت', name_fr: 'Imintanoute' },
  { id: 'city-sidi-mokhtar', region_id: 'reg-07', province_id: 'prov-chich', name_ar: 'سيدي المختار', name_fr: 'Sidi Mokhtar' },
  { id: 'city-jemaa-shaim', region_id: 'reg-07', province_id: 'prov-safi', name_ar: 'جمعة سحيم', name_fr: 'Jemaâ Shaim' },
  { id: 'city-sebt-gzoula', region_id: 'reg-07', province_id: 'prov-safi', name_ar: 'سبت جزولة', name_fr: 'Sebt Gzoula' },
  { id: 'city-souiria-kdima', region_id: 'reg-07', province_id: 'prov-safi', name_ar: 'الصويرية القديمة', name_fr: 'Souiria Lakdima' },
  { id: 'city-echmmaia', region_id: 'reg-07', province_id: 'prov-youss', name_ar: 'الشماعية', name_fr: 'Echemmaia' },
  { id: 'city-skhour-rehamna', region_id: 'reg-07', province_id: 'prov-reham', name_ar: 'صخور الرحامنة', name_fr: 'Skhour Rehamna' },
  { id: 'city-sidi-bou-othmane', region_id: 'reg-07', province_id: 'prov-reham', name_ar: 'سيدي بوعثمان', name_fr: 'Sidi Bou Othmane' },
  { id: 'city-tamanar', region_id: 'reg-07', province_id: 'prov-essa', name_ar: 'تمنار', name_fr: 'Tamanar' },
  { id: 'city-sidi-kaouki', region_id: 'reg-07', province_id: 'prov-essa', name_ar: 'سيدي كاوكي', name_fr: 'Sidi Kaouki' },
  { id: 'city-el-hanchane', region_id: 'reg-07', province_id: 'prov-essa', name_ar: 'الحنشان', name_fr: 'El Hanchane' },
  { id: 'city-ounagha', region_id: 'reg-07', province_id: 'prov-essa', name_ar: 'أوناغة', name_fr: 'Ounagha' },

  // =========================================================================
  // 08. جهة درعة - تافيلالت (Drâa-Tafilalet)
  // =========================================================================
  { id: 'city-errachidia', region_id: 'reg-08', province_id: 'prov-erf', name_ar: 'الرشيدية', name_fr: 'Errachidia' },
  { id: 'city-ouarzazate', region_id: 'reg-08', province_id: 'prov-ouarz', name_ar: 'ورزازات', name_fr: 'Ouarzazate' },
  { id: 'city-midelt', region_id: 'reg-08', province_id: 'prov-mid', name_ar: 'ميدلت', name_fr: 'Midelt' },
  { id: 'city-tinghir', region_id: 'reg-08', province_id: 'prov-ting', name_ar: 'تنغير', name_fr: 'Tinghir' },
  { id: 'city-zagora', region_id: 'reg-08', province_id: 'prov-zag', name_ar: 'زاكورة', name_fr: 'Zagora' },
  { id: 'city-erfoud', region_id: 'reg-08', province_id: 'prov-erf', name_ar: 'أرفود', name_fr: 'Erfoud' },
  { id: 'city-rissani', region_id: 'reg-08', province_id: 'prov-erf', name_ar: 'الريصاني', name_fr: 'Rissani' },
  { id: 'city-goulmima', region_id: 'reg-08', province_id: 'prov-erf', name_ar: 'كلميمة', name_fr: 'Goulmima' },
  { id: 'city-tinejdad', region_id: 'reg-08', province_id: 'prov-erf', name_ar: 'تنجداد', name_fr: 'Tinejdad' },
  { id: 'city-boumalne-dades', region_id: 'reg-08', province_id: 'prov-ting', name_ar: 'بومالن دادس', name_fr: 'Boumalne Dadès' },
  { id: 'city-kelaat-mgouna', region_id: 'reg-08', province_id: 'prov-ting', name_ar: 'قلعة مكونة', name_fr: "Kelaât M'Gouna" },
  { id: 'city-taznakht', region_id: 'reg-08', province_id: 'prov-ouarz', name_ar: 'تازناخت', name_fr: 'Taznakht' },
  { id: 'city-skoura', region_id: 'reg-08', province_id: 'prov-ouarz', name_ar: 'سكورة', name_fr: 'Skoura' },
  { id: 'city-tabounte', region_id: 'reg-08', province_id: 'prov-ouarz', name_ar: 'تابونت', name_fr: 'Tabounte' },
  { id: 'city-errich', region_id: 'reg-08', province_id: 'prov-mid', name_ar: 'الريش', name_fr: 'Er-Rich' },
  { id: 'city-zaida', region_id: 'reg-08', province_id: 'prov-mid', name_ar: 'زايدة', name_fr: 'Zaïda' },
  { id: 'city-boumia', region_id: 'reg-08', province_id: 'prov-mid', name_ar: 'بومية', name_fr: 'Boumia' },
  { id: 'city-imilchil', region_id: 'reg-08', province_id: 'prov-mid', name_ar: 'إملشيل', name_fr: 'Imilchil' },
  { id: 'city-agdz', region_id: 'reg-08', province_id: 'prov-zag', name_ar: 'أكدز', name_fr: 'Agdz' },
  { id: 'city-tamegroute', region_id: 'reg-08', province_id: 'prov-zag', name_ar: 'تامكروت', name_fr: 'Tamegroute' },
  { id: 'city-mhamid-el-ghizlane', region_id: 'reg-08', province_id: 'prov-zag', name_ar: 'محاميد الغزلان', name_fr: "M'Hamid El Ghizlane" },
  { id: 'city-tagounite', region_id: 'reg-08', province_id: 'prov-zag', name_ar: 'تاكونيت', name_fr: 'Tagounite' },
  { id: 'city-alnif', region_id: 'reg-08', province_id: 'prov-ting', name_ar: 'ألنيف', name_fr: 'Alnif' },
  { id: 'city-merzouga', region_id: 'reg-08', province_id: 'prov-erf', name_ar: 'مرزوكة', name_fr: 'Merzouga' },
  { id: 'city-jorf', region_id: 'reg-08', province_id: 'prov-erf', name_ar: 'الجرف', name_fr: 'Jorf' },

  // =========================================================================
  // 09. جهة سوس - ماسة (Souss-Massa)
  // =========================================================================
  { id: 'city-agadir', region_id: 'reg-09', province_id: 'prov-agad', name_ar: 'أكادير', name_fr: 'Agadir' },
  { id: 'city-inezgane', region_id: 'reg-09', province_id: 'prov-inz', name_ar: 'إنزكان', name_fr: 'Inezgane' },
  { id: 'city-ait-melloul', region_id: 'reg-09', province_id: 'prov-inz', name_ar: 'آيت ملول', name_fr: 'Aït Melloul' },
  { id: 'city-dcheira-el-jihadia', region_id: 'reg-09', province_id: 'prov-inz', name_ar: 'الدشيرة الجهادية', name_fr: 'Dcheira El Jihadia' },
  { id: 'city-lqliaa', region_id: 'reg-09', province_id: 'prov-inz', name_ar: 'القليعة', name_fr: 'Lqliaâ' },
  { id: 'city-taroudant', region_id: 'reg-09', province_id: 'prov-tar', name_ar: 'تارودانت', name_fr: 'Taroudant' },
  { id: 'city-oulad-teima', region_id: 'reg-09', province_id: 'prov-tar', name_ar: 'أولاد تايمة', name_fr: 'Oulad Teïma' },
  { id: 'city-tiznit', region_id: 'reg-09', province_id: 'prov-tiz', name_ar: 'تيزنيت', name_fr: 'Tiznit' },
  { id: 'city-biougra', region_id: 'reg-09', province_id: 'prov-chtou', name_ar: 'بيوكرى', name_fr: 'Biougra' },
  { id: 'city-ait-baha', region_id: 'reg-09', province_id: 'prov-chtou', name_ar: 'آيت باها', name_fr: 'Aït Baha' },
  { id: 'city-tata', region_id: 'reg-09', province_id: 'prov-tata', name_ar: 'طاطا', name_fr: 'Tata' },
  { id: 'city-tafraoute', region_id: 'reg-09', province_id: 'prov-tiz', name_ar: 'تافراوت', name_fr: 'Tafraoute' },
  { id: 'city-aoulouz', region_id: 'reg-09', province_id: 'prov-tar', name_ar: 'أولوز', name_fr: 'Aoulouz' },
  { id: 'city-taliouine', region_id: 'reg-09', province_id: 'prov-tar', name_ar: 'تاليوين', name_fr: 'Taliouine' },
  { id: 'city-sebt-guerdane', region_id: 'reg-09', province_id: 'prov-tar', name_ar: 'سبت الكردان', name_fr: 'El Guerdane' },
  { id: 'city-igherm', region_id: 'reg-09', province_id: 'prov-tar', name_ar: 'إغرم', name_fr: 'Igherm' },
  { id: 'city-oulad-berhil', region_id: 'reg-09', province_id: 'prov-tar', name_ar: 'أولاد برحيل', name_fr: 'Oulad Berhil' },
  { id: 'city-ait-iaaza', region_id: 'reg-09', province_id: 'prov-tar', name_ar: 'آيت إيعزة', name_fr: 'Aït Iaâza' },
  { id: 'city-tamri', region_id: 'reg-09', province_id: 'prov-agad', name_ar: 'تامري', name_fr: 'Tamri' },
  { id: 'city-taghazout', region_id: 'reg-09', province_id: 'prov-agad', name_ar: 'تغازوت', name_fr: 'Taghazout' },
  { id: 'city-aourir', region_id: 'reg-09', province_id: 'prov-agad', name_ar: 'أورير', name_fr: 'Aourir' },
  { id: 'city-drarga', region_id: 'reg-09', province_id: 'prov-agad', name_ar: 'الدراركة', name_fr: 'Drarga' },
  { id: 'city-amskroud', region_id: 'reg-09', province_id: 'prov-agad', name_ar: 'أمسكرود', name_fr: 'Amskroud' },
  { id: 'city-belfaa', region_id: 'reg-09', province_id: 'prov-chtou', name_ar: 'بلفاع', name_fr: 'Belfaâ' },
  { id: 'city-massa', region_id: 'reg-09', province_id: 'prov-chtou', name_ar: 'ماسة', name_fr: 'Massa' },
  { id: 'city-sidi-bibi', region_id: 'reg-09', province_id: 'prov-chtou', name_ar: 'سيدي بيبي', name_fr: 'Sidi Bibi' },
  { id: 'city-akka', region_id: 'reg-09', province_id: 'prov-tata', name_ar: 'أقا', name_fr: 'Akka' },
  { id: 'city-foum-zguid', region_id: 'reg-09', province_id: 'prov-tata', name_ar: 'فم زكيد', name_fr: 'Foum Zguid' },

  // =========================================================================
  // 10. جهة كلميم - واد نون (Guelmim-Oued Noun)
  // =========================================================================
  { id: 'city-guelmim', region_id: 'reg-10', province_id: 'prov-guel', name_ar: 'كلميم', name_fr: 'Guelmim' },
  { id: 'city-tan-tan', region_id: 'reg-10', province_id: 'prov-tant', name_ar: 'طانطان', name_fr: 'Tan-Tan' },
  { id: 'city-sidi-ifni', region_id: 'reg-10', province_id: 'prov-sbou', name_ar: 'سيدي إفني', name_fr: 'Sidi Ifni' },
  { id: 'city-assa', region_id: 'reg-10', province_id: 'prov-assa', name_ar: 'آسا', name_fr: 'Assa' },
  { id: 'city-zag', region_id: 'reg-10', province_id: 'prov-assa', name_ar: 'الزاك', name_fr: 'Zag' },
  { id: 'city-el-ouatia', region_id: 'reg-10', province_id: 'prov-tant', name_ar: 'الوطية (ميناء طانطان)', name_fr: 'El Ouatia' },
  { id: 'city-bouizakarne', region_id: 'reg-10', province_id: 'prov-guel', name_ar: 'بويزكارن', name_fr: 'Bouizakarne' },
  { id: 'city-lakhsas', region_id: 'reg-10', province_id: 'prov-sbou', name_ar: 'الأخصاص', name_fr: 'Lakhsas' },
  { id: 'city-mirleft', region_id: 'reg-10', province_id: 'prov-sbou', name_ar: 'ميراللفت', name_fr: 'Mirleft' },
  { id: 'city-taghjijt', region_id: 'reg-10', province_id: 'prov-guel', name_ar: 'تغجيجت', name_fr: 'Taghjijt' },
  { id: 'city-asrir', region_id: 'reg-10', province_id: 'prov-guel', name_ar: 'أسرير', name_fr: 'Asrir' },
  { id: 'city-timoulay', region_id: 'reg-10', province_id: 'prov-guel', name_ar: 'تيمولاي', name_fr: 'Timoulay' },
  { id: 'city-abainou', region_id: 'reg-10', province_id: 'prov-guel', name_ar: 'أباينو', name_fr: 'Abainou' },

  // =========================================================================
  // 11. جهة العيون - الساقية الحمراء (Laâyoune-Sakia El Hamra)
  // =========================================================================
  { id: 'city-laayoune', region_id: 'reg-11', province_id: 'prov-lay', name_ar: 'العيون', name_fr: 'Laâyoune' },
  { id: 'city-boujdour', region_id: 'reg-11', province_id: 'prov-bouj', name_ar: 'بوجدور', name_fr: 'Boujdour' },
  { id: 'city-es-semara', region_id: 'reg-11', province_id: 'prov-essem', name_ar: 'السمارة', name_fr: 'Es-Semara' },
  { id: 'city-tarfaya', region_id: 'reg-11', province_id: 'prov-tarf', name_ar: 'طرفاية', name_fr: 'Tarfaya' },
  { id: 'city-el-marsa', region_id: 'reg-11', province_id: 'prov-lay', name_ar: 'المرسى (العيون الشاطئ)', name_fr: 'El Marsa' },
  { id: 'city-foum-el-oued', region_id: 'reg-11', province_id: 'prov-lay', name_ar: 'فم الواد', name_fr: 'Foum El Oued' },
  { id: 'city-dcheira-laayoune', region_id: 'reg-11', province_id: 'prov-lay', name_ar: 'الدشيرة', name_fr: 'Dcheira' },
  { id: 'city-akhfenir', region_id: 'reg-11', province_id: 'prov-tarf', name_ar: 'أخفنير', name_fr: 'Akhfenir' },
  { id: 'city-tah', region_id: 'reg-11', province_id: 'prov-tarf', name_ar: 'تاح', name_fr: 'Tah' },

  // =========================================================================
  // 12. جهة الداخلة - وادي الذهب (Dakhla-Oued Ed-Dahab)
  // =========================================================================
  { id: 'city-dakhla', region_id: 'reg-12', province_id: 'prov-ouedd', name_ar: 'الداخلة', name_fr: 'Dakhla' },
  { id: 'city-bir-gandouz', region_id: 'reg-12', province_id: 'prov-aouss', name_ar: 'بئر كندوز', name_fr: 'Bir Gandouz' },
  { id: 'city-el-argoub', region_id: 'reg-12', province_id: 'prov-ouedd', name_ar: 'العركوب', name_fr: 'El Argoub' },
  { id: 'city-guerguerat', region_id: 'reg-12', province_id: 'prov-aouss', name_ar: 'الكركرات', name_fr: 'Guerguerat' },
  { id: 'city-aousserd', region_id: 'reg-12', province_id: 'prov-aouss', name_ar: 'أوسرد', name_fr: 'Aousserd' },
  { id: 'city-tichla', region_id: 'reg-12', province_id: 'prov-aouss', name_ar: 'تشلا', name_fr: 'Tichla' },
];

/**
 * Geographic Query & Validation Functions
 */

export function getAllRegions(): Region[] {
  return MOROCCAN_REGIONS;
}

export function getCitiesByRegion(regionId: string): MoroccoCity[] {
  return MOROCCAN_CITIES.filter(c => c.region_id === regionId);
}

export function getCityById(cityId: string): MoroccoCity | undefined {
  return MOROCCAN_CITIES.find(c => c.id === cityId);
}

export function validateMoroccoRegionCity(
  regionId: string,
  cityId: string
): { isValid: boolean; error?: string; region?: Region; city?: MoroccoCity } {
  const region = MOROCCAN_REGIONS.find(r => r.id === regionId);
  if (!region) {
    return { isValid: false, error: 'الجهة الإدارية المحددة غير صحيحة' };
  }

  const city = MOROCCAN_CITIES.find(c => c.id === cityId);
  if (!city) {
    return { isValid: false, error: 'يرجى اختيار مدينة أو قرية صحيحة من القائمة' };
  }

  if (city.region_id !== regionId) {
    return { isValid: false, error: 'المدينة المحددة لا تنتمي إلى هذه الجهة الإدارية' };
  }

  return { isValid: true, region, city };
}

export function getProvincesByRegion(regionId: string): Province[] {
  return MOROCCAN_PROVINCES.filter(p => p.region_id === regionId);
}

export function getCommunesByProvince(provinceId: string): Commune[] {
  return MOROCCAN_COMMUNES.filter(c => c.province_id === provinceId);
}

export function getLocalitiesByCommune(communeId: string): Locality[] {
  return MOROCCAN_LOCALITIES.filter(l => l.commune_id === communeId);
}

export function validateMoroccoAddressHierarchy(
  regionId: string,
  provinceId: string,
  communeId: string
): { isValid: boolean; error?: string } {
  const region = MOROCCAN_REGIONS.find(r => r.id === regionId);
  if (!region) {
    return { isValid: false, error: 'الجهة الإدارية المحددة غير صحيحة' };
  }

  const province = MOROCCAN_PROVINCES.find(p => p.id === provinceId);
  if (!province) {
    return { isValid: false, error: 'الإقليم أو العمالة المحددة غير صحيحة' };
  }

  if (province.region_id !== regionId) {
    return { isValid: false, error: 'الإقليم المحدد لا ينتمي إلى هذه الجهة الإدارية' };
  }

  const commune = MOROCCAN_COMMUNES.find(c => c.id === communeId);
  if (!commune) {
    // If commune is not pre-populated in sample list, we still allow custom commune with province match
    return { isValid: true };
  }

  if (commune.province_id !== provinceId) {
    return { isValid: false, error: 'الجماعة المحددة لا تنتمي إلى هذا الإقليم' };
  }

  return { isValid: true };
}

/**
 * Search locations in both Arabic and French
 */
export function searchLocations(query: string): {
  regions: Region[];
  provinces: Province[];
  communes: Commune[];
} {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { regions: [], provinces: [], communes: [] };
  }

  const matchedRegions = MOROCCAN_REGIONS.filter(
    r => r.name_ar.toLowerCase().includes(q) || r.name_fr.toLowerCase().includes(q)
  );
  const matchedProvinces = MOROCCAN_PROVINCES.filter(
    p => p.name_ar.toLowerCase().includes(q) || p.name_fr.toLowerCase().includes(q)
  );
  const matchedCommunes = MOROCCAN_COMMUNES.filter(
    c => c.name_ar.toLowerCase().includes(q) || c.name_fr.toLowerCase().includes(q)
  );

  return {
    regions: matchedRegions,
    provinces: matchedProvinces,
    communes: matchedCommunes,
  };
}
