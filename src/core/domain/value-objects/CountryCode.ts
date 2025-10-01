// src/core/domain/value-objects/CountryCode.ts

export class CountryCode {
  private static readonly VALID_CODES = [
    // América del Norte
    'US',
    'CA',
    'MX',
    'GL',

    // América Central y Caribe
    'GT',
    'BZ',
    'SV',
    'HN',
    'NI',
    'CR',
    'PA',
    'CU',
    'JM',
    'HT',
    'DO',
    'PR',
    'TT',
    'BB',
    'BS',
    'BM',

    // América del Sur
    'CO',
    'VE',
    'GY',
    'SR',
    'GF',
    'BR',
    'EC',
    'PE',
    'BO',
    'PY',
    'UY',
    'AR',
    'CL',
    'FK',

    // Europa Occidental
    'ES',
    'PT',
    'FR',
    'IT',
    'DE',
    'GB',
    'IE',
    'NL',
    'BE',
    'LU',
    'CH',
    'AT',
    'MC',
    'AD',
    'MT',
    'SM',
    'VA',

    // Europa Nórdica
    'SE',
    'NO',
    'DK',
    'FI',
    'IS',

    // Europa Oriental
    'PL',
    'CZ',
    'SK',
    'HU',
    'RO',
    'BG',
    'SI',
    'HR',
    'BA',
    'RS',
    'ME',
    'MK',
    'AL',
    'XK',

    // Europa del Este (ex-URSS)
    'RU',
    'UA',
    'BY',
    'LT',
    'LV',
    'EE',
    'MD',
    'GE',
    'AM',
    'AZ',

    // Asia Oriental
    'JP',
    'KR',
    'KP',
    'CN',
    'TW',
    'HK',
    'MO',
    'MN',

    // Asia Sudoriental
    'TH',
    'VN',
    'PH',
    'ID',
    'MY',
    'SG',
    'BN',
    'LA',
    'KH',
    'MM',
    'TL',

    // Asia Meridional
    'IN',
    'PK',
    'BD',
    'LK',
    'NP',
    'BT',
    'MV',
    'AF',

    // Asia Occidental (Medio Oriente)
    'TR',
    'IR',
    'IQ',
    'SY',
    'LB',
    'JO',
    'IL',
    'PS',
    'SA',
    'YE',
    'OM',
    'AE',
    'QA',
    'BH',
    'KW',
    'CY',

    // Asia Central
    'KZ',
    'UZ',
    'TM',
    'TJ',
    'KG',

    // África del Norte
    'EG',
    'LY',
    'TN',
    'DZ',
    'MA',
    'SD',
    'SS',

    // África Occidental
    'NG',
    'GH',
    'CI',
    'SN',
    'ML',
    'BF',
    'NE',
    'GN',
    'SL',
    'LR',
    'GM',
    'GW',
    'CV',
    'MR',
    'TG',
    'BJ',

    // África Oriental
    'KE',
    'ET',
    'UG',
    'TZ',
    'RW',
    'BI',
    'SO',
    'DJ',
    'ER',
    'MG',
    'MU',
    'SC',
    'KM',

    // África Central
    'CD',
    'CF',
    'CM',
    'TD',
    'CG',
    'GA',
    'GQ',
    'ST',
    'AO',

    // África Austral
    'ZA',
    'ZW',
    'BW',
    'NA',
    'ZM',
    'MW',
    'MZ',
    'SZ',
    'LS',

    // Oceanía
    'AU',
    'NZ',
    'PG',
    'FJ',
    'SB',
    'VU',
    'NC',
    'PF',
    'WS',
    'TO',
    'KI',
    'NR',
    'PW',
    'FM',
    'MH',
    'TV',
  ] as const;

  constructor(public readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('El código de país no puede estar vacío');
    }

    if (this.value.length !== 2) {
      throw new Error('El código de país debe tener exactamente 2 caracteres');
    }

    if (
      !CountryCode.VALID_CODES.includes(
        this.value as (typeof CountryCode.VALID_CODES)[number]
      )
    ) {
      throw new Error(
        `Código de país inválido: ${this.value}. Debe ser un código ISO 3166-1 válido`
      );
    }
  }

  /**
   * Retorna el nombre del país en su idioma nativo o más comúnmente usado
   */
  getDisplayName(): string {
    const nativeNames: Record<string, string> = {
      // América del Norte
      US: 'United States',
      CA: 'Canada',
      MX: 'México',
      GL: 'Kalaallit Nunaat', // Groenlandia en groenlandés

      // América Central y Caribe
      GT: 'Guatemala',
      BZ: 'Belize',
      SV: 'El Salvador',
      HN: 'Honduras',
      NI: 'Nicaragua',
      CR: 'Costa Rica',
      PA: 'Panamá',
      CU: 'Cuba',
      JM: 'Jamaica',
      HT: 'Haïti',
      DO: 'República Dominicana',
      PR: 'Puerto Rico',
      TT: 'Trinidad and Tobago',
      BB: 'Barbados',
      BS: 'Bahamas',
      BM: 'Bermuda',

      // América del Sur
      CO: 'Colombia',
      VE: 'Venezuela',
      GY: 'Guyana',
      SR: 'Suriname',
      GF: 'Guyane française',
      BR: 'Brasil',
      EC: 'Ecuador',
      PE: 'Perú',
      BO: 'Bolivia',
      PY: 'Paraguay',
      UY: 'Uruguay',
      AR: 'Argentina',
      CL: 'Chile',
      FK: 'Islas Malvinas', // Clasificación política argentina 🇦🇷

      // Europa Occidental
      ES: 'España',
      PT: 'Portugal',
      FR: 'France',
      IT: 'Italia',
      DE: 'Deutschland',
      GB: 'United Kingdom',
      IE: 'Éire',
      NL: 'Nederland',
      BE: 'België',
      LU: 'Luxembourg',
      CH: 'Schweiz',
      AT: 'Österreich',
      MC: 'Monaco',
      AD: 'Andorra',
      MT: 'Malta',
      SM: 'San Marino',
      VA: 'Vaticano',

      // Europa Nórdica
      SE: 'Sverige',
      NO: 'Norge',
      DK: 'Danmark',
      FI: 'Suomi',
      IS: 'Ísland',

      // Europa Oriental
      PL: 'Polska',
      CZ: 'Česká republika',
      SK: 'Slovensko',
      HU: 'Magyarország',
      RO: 'România',
      BG: 'България',
      SI: 'Slovenija',
      HR: 'Hrvatska',
      BA: 'Bosna i Hercegovina',
      RS: 'Србија',
      ME: 'Crna Gora',
      MK: 'Македонија',
      AL: 'Shqipëria',
      XK: 'Kosova',

      // Europa del Este (ex-URSS)
      RU: 'Россия',
      UA: 'Україна',
      BY: 'Беларусь',
      LT: 'Lietuva',
      LV: 'Latvija',
      EE: 'Eesti',
      MD: 'Moldova',
      GE: 'საქართველო',
      AM: 'Հայաստան',
      AZ: 'Azərbaycan',

      // Asia Oriental
      JP: '日本',
      KR: '대한민국',
      KP: '조선민주주의인민공화국',
      CN: '中国',
      TW: '台灣',
      HK: '香港',
      MO: '澳門',
      MN: 'Монгол улс',

      // Asia Sudoriental
      TH: 'ประเทศไทย',
      VN: 'Việt Nam',
      PH: 'Pilipinas',
      ID: 'Indonesia',
      MY: 'Malaysia',
      SG: 'Singapore',
      BN: 'Brunei',
      LA: 'ລາວ',
      KH: 'កម្ពុជា',
      MM: 'မြန်မာ',
      TL: 'Timor-Leste',

      // Asia Meridional
      IN: 'भारत',
      PK: 'پاکستان',
      BD: 'বাংলাদেশ',
      LK: 'ශ්‍රී ලංකා',
      NP: 'नेपाल',
      BT: 'འབྲུག་ཡུལ',
      MV: 'ދިވެހިރާއްޖެ',
      AF: 'افغانستان',

      // Asia Occidental (Medio Oriente)
      TR: 'Türkiye',
      IR: 'ایران',
      IQ: 'العراق',
      SY: 'سوريا',
      LB: 'لبنان',
      JO: 'الأردن',
      IL: 'ישראל',
      PS: 'فلسطين',
      SA: 'السعودية',
      YE: 'اليمن',
      OM: 'عُمان',
      AE: 'الإمارات',
      QA: 'قطر',
      BH: 'البحرين',
      KW: 'الكويت',
      CY: 'Κύπρος',

      // Asia Central
      KZ: 'Қазақстан',
      UZ: 'Oʻzbekiston',
      TM: 'Türkmenistan',
      TJ: 'Тоҷикистон',
      KG: 'Кыргызстан',

      // África del Norte
      EG: 'مصر',
      LY: 'ليبيا',
      TN: 'تونس',
      DZ: 'الجزائر',
      MA: 'المغرب',
      SD: 'السودان',
      SS: 'South Sudan',

      // África Occidental
      NG: 'Nigeria',
      GH: 'Ghana',
      CI: "Côte d'Ivoire",
      SN: 'Sénégal',
      ML: 'Mali',
      BF: 'Burkina Faso',
      NE: 'Niger',
      GN: 'Guinée',
      SL: 'Sierra Leone',
      LR: 'Liberia',
      GM: 'Gambia',
      GW: 'Guiné-Bissau',
      CV: 'Cabo Verde',
      MR: 'موريتانيا',
      TG: 'Togo',
      BJ: 'Bénin',

      // África Oriental
      KE: 'Kenya',
      ET: 'ኢትዮጵያ',
      UG: 'Uganda',
      TZ: 'Tanzania',
      RW: 'Rwanda',
      BI: 'Burundi',
      SO: 'Soomaaliya',
      DJ: 'Djibouti',
      ER: 'ኤርትራ',
      MG: 'Madagasikara',
      MU: 'Maurice',
      SC: 'Seychelles',
      KM: 'Comores',

      // África Central
      CD: 'République démocratique du Congo',
      CF: 'République centrafricaine',
      CM: 'Cameroun',
      TD: 'Tchad',
      CG: 'Congo',
      GA: 'Gabon',
      GQ: 'Guinea Ecuatorial',
      ST: 'São Tomé e Príncipe',
      AO: 'Angola',

      // África Austral
      ZA: 'South Africa',
      ZW: 'Zimbabwe',
      BW: 'Botswana',
      NA: 'Namibia',
      ZM: 'Zambia',
      MW: 'Malawi',
      MZ: 'Moçambique',
      SZ: 'eSwatini',
      LS: 'Lesotho',

      // Oceanía
      AU: 'Australia',
      NZ: 'New Zealand',
      PG: 'Papua New Guinea',
      FJ: 'Fiji',
      SB: 'Solomon Islands',
      VU: 'Vanuatu',
      NC: 'Nouvelle-Calédonie',
      PF: 'Polynésie française',
      WS: 'Samoa',
      TO: 'Tonga',
      KI: 'Kiribati',
      NR: 'Nauru',
      PW: 'Palau',
      FM: 'Micronesia',
      MH: 'Marshall Islands',
      TV: 'Tuvalu',
    };

    return nativeNames[this.value] || this.value;
  }

  // Métodos de clasificación geográfica por continentes

  isNorthAmerica(): boolean {
    const northAmericaCodes = ['US', 'CA', 'MX', 'GL'];
    return northAmericaCodes.includes(this.value);
  }

  isCentralAmericaAndCaribbean(): boolean {
    const centralAmericaAndCaribbeanCodes = [
      'GT',
      'BZ',
      'SV',
      'HN',
      'NI',
      'CR',
      'PA',
      'CU',
      'JM',
      'HT',
      'DO',
      'PR',
      'TT',
      'BB',
      'BS',
      'BM',
    ];
    return centralAmericaAndCaribbeanCodes.includes(this.value);
  }

  isSouthAmerica(): boolean {
    const southAmericaCodes = [
      'CO',
      'VE',
      'GY',
      'SR',
      'GF',
      'BR',
      'EC',
      'PE',
      'BO',
      'PY',
      'UY',
      'AR',
      'CL',
      'FK', // Islas Malvinas - clasificación política argentina 🇦🇷
    ];
    return southAmericaCodes.includes(this.value);
  }

  isEurope(): boolean {
    const europeCodes = [
      // Europa Occidental
      'ES',
      'PT',
      'FR',
      'IT',
      'DE',
      'GB',
      'IE',
      'NL',
      'BE',
      'LU',
      'CH',
      'AT',
      'MC',
      'AD',
      'MT',
      'SM',
      'VA',
      // Europa Nórdica
      'SE',
      'NO',
      'DK',
      'FI',
      'IS',
      // Europa Oriental
      'PL',
      'CZ',
      'SK',
      'HU',
      'RO',
      'BG',
      'SI',
      'HR',
      'BA',
      'RS',
      'ME',
      'MK',
      'AL',
      'XK',
      // Europa del Este (ex-URSS) - solo los geográficamente europeos
      'UA',
      'BY',
      'LT',
      'LV',
      'EE',
      'MD',
      // Países transcontinentales (parte europea)
      'RU',
      'TR',
      'CY', // Incluidos por su parte europea significativa
    ];
    return europeCodes.includes(this.value);
  }

  isAsia(): boolean {
    const asiaCodes = [
      // Asia Oriental
      'JP',
      'KR',
      'KP',
      'CN',
      'TW',
      'HK',
      'MO',
      'MN',
      // Asia Sudoriental
      'TH',
      'VN',
      'PH',
      'ID',
      'MY',
      'SG',
      'BN',
      'LA',
      'KH',
      'MM',
      'TL',
      // Asia Meridional
      'IN',
      'PK',
      'BD',
      'LK',
      'NP',
      'BT',
      'MV',
      'AF',
      // Asia Occidental (Medio Oriente)
      'IR',
      'IQ',
      'SY',
      'LB',
      'JO',
      'IL',
      'PS',
      'SA',
      'YE',
      'OM',
      'AE',
      'QA',
      'BH',
      'KW',
      // Asia Central
      'KZ',
      'UZ',
      'TM',
      'TJ',
      'KG',
      // Cáucaso (geográficamente asiático)
      'GE',
      'AM',
      'AZ',
      // Países transcontinentales (parte asiática)
      'RU',
      'TR',
      'CY', // Incluidos por su parte asiática
    ];
    return asiaCodes.includes(this.value);
  }

  isAfrica(): boolean {
    const africaCodes = [
      // África del Norte
      'EG',
      'LY',
      'TN',
      'DZ',
      'MA',
      'SD',
      'SS',
      // África Occidental
      'NG',
      'GH',
      'CI',
      'SN',
      'ML',
      'BF',
      'NE',
      'GN',
      'SL',
      'LR',
      'GM',
      'GW',
      'CV',
      'MR',
      'TG',
      'BJ',
      // África Oriental
      'KE',
      'ET',
      'UG',
      'TZ',
      'RW',
      'BI',
      'SO',
      'DJ',
      'ER',
      'MG',
      'MU',
      'SC',
      'KM',
      // África Central
      'CD',
      'CF',
      'CM',
      'TD',
      'CG',
      'GA',
      'GQ',
      'ST',
      'AO',
      // África Austral
      'ZA',
      'ZW',
      'BW',
      'NA',
      'ZM',
      'MW',
      'MZ',
      'SZ',
      'LS',
    ];
    return africaCodes.includes(this.value);
  }

  isOceania(): boolean {
    const oceaniaCodes = [
      'AU',
      'NZ',
      'PG',
      'FJ',
      'SB',
      'VU',
      'NC',
      'PF',
      'WS',
      'TO',
      'KI',
      'NR',
      'PW',
      'FM',
      'MH',
      'TV',
    ];
    return oceaniaCodes.includes(this.value);
  }

  // Métodos de subregiones más específicas
  isWesternEurope(): boolean {
    const westernEuropeCodes = [
      'ES',
      'PT',
      'FR',
      'IT',
      'DE',
      'GB',
      'IE',
      'NL',
      'BE',
      'LU',
      'CH',
      'AT',
      'MC',
      'AD',
      'MT',
      'SM',
      'VA',
    ];
    return westernEuropeCodes.includes(this.value);
  }

  isNordicCountries(): boolean {
    const nordicCodes = ['SE', 'NO', 'DK', 'FI', 'IS'];
    return nordicCodes.includes(this.value);
  }

  isEasternEurope(): boolean {
    const easternEuropeCodes = [
      'PL',
      'CZ',
      'SK',
      'HU',
      'RO',
      'BG',
      'SI',
      'HR',
      'BA',
      'RS',
      'ME',
      'MK',
      'AL',
      'XK',
      'RU',
      'UA',
      'BY',
      'LT',
      'LV',
      'EE',
      'MD',
      'GE',
      'AM',
      'AZ',
    ];
    return easternEuropeCodes.includes(this.value);
  }

  isMiddleEast(): boolean {
    const middleEastCodes = [
      'TR',
      'IR',
      'IQ',
      'SY',
      'LB',
      'JO',
      'IL',
      'PS',
      'SA',
      'YE',
      'OM',
      'AE',
      'QA',
      'BH',
      'KW',
      'CY',
    ];
    return middleEastCodes.includes(this.value);
  }

  isEastAsia(): boolean {
    const eastAsiaCodes = ['JP', 'KR', 'KP', 'CN', 'TW', 'HK', 'MO', 'MN'];
    return eastAsiaCodes.includes(this.value);
  }

  isSoutheastAsia(): boolean {
    const southeastAsiaCodes = [
      'TH',
      'VN',
      'PH',
      'ID',
      'MY',
      'SG',
      'BN',
      'LA',
      'KH',
      'MM',
      'TL',
    ];
    return southeastAsiaCodes.includes(this.value);
  }

  isSouthAsia(): boolean {
    const southAsiaCodes = ['IN', 'PK', 'BD', 'LK', 'NP', 'BT', 'MV', 'AF'];
    return southAsiaCodes.includes(this.value);
  }

  isCentralAsia(): boolean {
    const centralAsiaCodes = ['KZ', 'UZ', 'TM', 'TJ', 'KG'];
    return centralAsiaCodes.includes(this.value);
  }

  // Métodos de utilidad
  getFlag(): string {
    // Retorna el emoji de la bandera usando códigos regionales Unicode
    const codePoints = this.value
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  getTimezoneHint(): string {
    const timezoneHints: Record<string, string> = {
      US: 'UTC-5 to UTC-10',
      CA: 'UTC-3.5 to UTC-8',
      MX: 'UTC-6 to UTC-8',
      BR: 'UTC-2 to UTC-5',
      AR: 'UTC-3',
      CL: 'UTC-3 to UTC-6',
      CO: 'UTC-5',
      PE: 'UTC-5',
      ES: 'UTC+1',
      FR: 'UTC+1',
      DE: 'UTC+1',
      GB: 'UTC+0',
      JP: 'UTC+9',
      KR: 'UTC+9',
      CN: 'UTC+8',
      AU: 'UTC+8 to UTC+11',
      // Agregar más según necesidad
    };

    return timezoneHints[this.value] || 'UTC';
  }

  // Métodos específicos para países transcontinentales
  isTranscontinental(): boolean {
    const transcontinentalCodes = ['RU', 'TR', 'CY', 'KZ', 'AZ', 'GE'];
    return transcontinentalCodes.includes(this.value);
  }

  isCaucasus(): boolean {
    const caucasusCodes = ['GE', 'AM', 'AZ'];
    return caucasusCodes.includes(this.value);
  }

  // Método para obtener el continente principal (para estadísticas)
  getPrimaryContinent(): string {
    // Para países transcontinentales, retorna el continente donde está la mayor parte del territorio/población
    const primaryContinentMap: Record<string, string> = {
      RU: 'Asia', // 77% del territorio está en Asia
      TR: 'Asia', // 97% del territorio está en Asia (Anatolia)
      CY: 'Asia', // Geográficamente más cerca de Asia Menor
      KZ: 'Asia', // Mayor parte del territorio en Asia
      AZ: 'Asia', // Geográficamente en el Cáucaso (Asia)
      GE: 'Asia', // Geográficamente en el Cáucaso (Asia)
      AM: 'Asia', // Geográficamente en el Cáucaso (Asia)
    };

    if (primaryContinentMap[this.value]) {
      return primaryContinentMap[this.value];
    }

    // Para países no transcontinentales, determinar por clasificación estándar
    if (this.isNorthAmerica()) return 'North America';
    if (this.isCentralAmericaAndCaribbean())
      return 'Central America and Caribbean';
    if (this.isSouthAmerica()) return 'South America';
    if (this.isEurope() && !this.isTranscontinental()) return 'Europe';
    if (this.isAsia() && !this.isTranscontinental()) return 'Asia';
    if (this.isAfrica()) return 'Africa';
    if (this.isOceania()) return 'Oceania';

    return 'Unknown';
  }

  isValid(): boolean {
    return true; // Si llegó hasta aquí, es válido
  }
}
