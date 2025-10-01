// src/core/domain/value-objects/__tests__/CountryCode.test.ts

import { CountryCode } from '@/core/domain/value-objects/CountryCode';

describe('CountryCode Value Object', () => {
  describe('constructor', () => {
    it('debería crear un country code válido con códigos ISO estándar', () => {
      const validCodes = [
        'US',
        'CA',
        'MX',
        'BR',
        'AR',
        'ES',
        'FR',
        'DE',
        'GB',
        'JP',
        'KR',
        'CN',
      ];

      validCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.value).toBe(code);
        expect(countryCode.isValid()).toBe(true);
      });
    });

    it('debería crear country codes para todos los continentes', () => {
      const continentTests = [
        // América
        { codes: ['US', 'CA', 'MX'], method: 'isNorthAmerica' },
        {
          codes: ['GT', 'CR', 'CU', 'JM'],
          method: 'isCentralAmericaAndCaribbean',
        },
        { codes: ['BR', 'AR', 'CO', 'CL'], method: 'isSouthAmerica' },
        // Europa
        { codes: ['ES', 'FR', 'DE', 'RU'], method: 'isEurope' },
        // Asia
        { codes: ['JP', 'CN', 'IN', 'SA'], method: 'isAsia' },
        // África
        { codes: ['EG', 'NG', 'ZA', 'KE'], method: 'isAfrica' },
        // Oceanía
        { codes: ['AU', 'NZ', 'FJ'], method: 'isOceania' },
      ];

      continentTests.forEach(({ codes, method }) => {
        codes.forEach((code) => {
          const countryCode = new CountryCode(code);
          expect(countryCode.value).toBe(code);
          expect((countryCode as Record<string, () => boolean>)[method]()).toBe(
            true
          );
        });
      });
    });
  });

  describe('validaciones de error', () => {
    it('debería lanzar error con código vacío', () => {
      expect(() => new CountryCode('')).toThrow(
        'El código de país no puede estar vacío'
      );
    });

    it('debería lanzar error con código solo espacios', () => {
      expect(() => new CountryCode('   ')).toThrow(
        'El código de país no puede estar vacío'
      );
    });

    it('debería lanzar error con código null o undefined', () => {
      expect(() => new CountryCode(null as unknown as string)).toThrow(
        'El código de país no puede estar vacío'
      );
      expect(() => new CountryCode(undefined as unknown as string)).toThrow(
        'El código de país no puede estar vacío'
      );
    });

    it('debería lanzar error con código de longitud incorrecta', () => {
      const invalidLengthCodes = ['U', 'USA', 'MEXICO', 'A'];

      invalidLengthCodes.forEach((code) => {
        expect(() => new CountryCode(code)).toThrow(
          'El código de país debe tener exactamente 2 caracteres'
        );
      });
    });

    it('debería lanzar error con códigos no válidos', () => {
      const invalidCodes = ['XX', 'ZZ', 'AA', '12', '@@', 'ab'];

      invalidCodes.forEach((code) => {
        expect(() => new CountryCode(code)).toThrow(
          `Código de país inválido: ${code}. Debe ser un código ISO 3166-1 válido`
        );
      });
    });
  });

  describe('getDisplayName - nombres nativos', () => {
    it('debería retornar nombres en idioma nativo para países principales', () => {
      const nativeNameTests = [
        // América
        { code: 'BR', expected: 'Brasil' }, // En portugués con 's'
        { code: 'MX', expected: 'México' },
        { code: 'AR', expected: 'Argentina' },

        // Europa
        { code: 'DE', expected: 'Deutschland' }, // En alemán
        { code: 'NL', expected: 'Nederland' }, // En holandés
        { code: 'SE', expected: 'Sverige' }, // En sueco
        { code: 'NO', expected: 'Norge' }, // En noruego
        { code: 'DK', expected: 'Danmark' }, // En danés
        { code: 'FI', expected: 'Suomi' }, // En finlandés
        { code: 'PL', expected: 'Polska' }, // En polaco
        { code: 'RU', expected: 'Россия' }, // En ruso

        // Asia
        { code: 'JP', expected: '日本' }, // En japonés
        { code: 'KR', expected: '대한민국' }, // En coreano
        { code: 'CN', expected: '中国' }, // En chino
        { code: 'IN', expected: 'भारत' }, // En hindi
        { code: 'TH', expected: 'ประเทศไทย' }, // En tailandés
        { code: 'VN', expected: 'Việt Nam' }, // En vietnamita
        { code: 'TR', expected: 'Türkiye' }, // En turco

        // África y Medio Oriente
        { code: 'EG', expected: 'مصر' }, // En árabe
        { code: 'SA', expected: 'السعودية' }, // En árabe
        { code: 'MA', expected: 'المغرب' }, // En árabe
      ];

      nativeNameTests.forEach(({ code, expected }) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.getDisplayName()).toBe(expected);
      });
    });

    it('debería retornar nombres correctos para países de América Latina', () => {
      const latinAmericaTests = [
        { code: 'MX', expected: 'México' },
        { code: 'AR', expected: 'Argentina' },
        { code: 'CO', expected: 'Colombia' },
        { code: 'PE', expected: 'Perú' },
        { code: 'CL', expected: 'Chile' },
        { code: 'EC', expected: 'Ecuador' },
        { code: 'VE', expected: 'Venezuela' },
        { code: 'UY', expected: 'Uruguay' },
        { code: 'PY', expected: 'Paraguay' },
        { code: 'BO', expected: 'Bolivia' },
      ];

      latinAmericaTests.forEach(({ code, expected }) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.getDisplayName()).toBe(expected);
      });
    });
  });

  describe('clasificaciones geográficas por continentes', () => {
    it('debería identificar correctamente América del Norte', () => {
      const northAmericaCodes = ['US', 'CA', 'MX', 'GL'];
      const nonNorthAmericaCodes = ['BR', 'AR', 'ES', 'JP', 'GT', 'CR'];

      northAmericaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isNorthAmerica()).toBe(true);
      });

      nonNorthAmericaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isNorthAmerica()).toBe(false);
      });
    });

    it('debería identificar correctamente América Central y Caribe', () => {
      const centralAmericaAndCaribbeanCodes = [
        'GT',
        'CR',
        'PA',
        'CU',
        'JM',
        'DO',
        'TT',
      ];
      const nonCentralAmericaAndCaribbeanCodes = [
        'US',
        'MX',
        'BR',
        'AR',
        'ES',
        'JP',
      ];

      centralAmericaAndCaribbeanCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isCentralAmericaAndCaribbean()).toBe(true);
      });

      nonCentralAmericaAndCaribbeanCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isCentralAmericaAndCaribbean()).toBe(false);
      });
    });

    it('debería identificar correctamente América del Sur', () => {
      const southAmericaCodes = [
        'BR',
        'AR',
        'CO',
        'PE',
        'CL',
        'VE',
        'UY',
        'EC',
        'BO',
      ];
      const nonSouthAmericaCodes = ['US', 'MX', 'GT', 'ES', 'JP', 'AU'];

      southAmericaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isSouthAmerica()).toBe(true);
      });

      nonSouthAmericaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isSouthAmerica()).toBe(false);
      });
    });

    it('debería identificar correctamente países europeos', () => {
      const europeCodes = [
        'ES',
        'FR',
        'DE',
        'IT',
        'GB',
        'NL',
        'PL',
        'RU',
        'SE',
        'NO',
      ];
      const nonEuropeCodes = ['US', 'BR', 'JP', 'AU', 'EG', 'NG'];

      europeCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isEurope()).toBe(true);
      });

      nonEuropeCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isEurope()).toBe(false);
      });
    });

    it('debería identificar correctamente países asiáticos', () => {
      const asiaCodes = ['JP', 'KR', 'CN', 'IN', 'TH', 'SA', 'TR', 'KZ', 'AF'];
      const nonAsiaCodes = ['US', 'BR', 'ES', 'AU', 'EG', 'NG'];

      asiaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isAsia()).toBe(true);
      });

      nonAsiaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isAsia()).toBe(false);
      });
    });

    it('debería identificar correctamente países africanos', () => {
      const africaCodes = ['EG', 'NG', 'ZA', 'KE', 'MA', 'ET', 'GH', 'TN'];
      const nonAfricaCodes = ['US', 'BR', 'ES', 'JP', 'AU', 'IN'];

      africaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isAfrica()).toBe(true);
      });

      nonAfricaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isAfrica()).toBe(false);
      });
    });

    it('debería identificar correctamente países de Oceanía', () => {
      const oceaniaCodes = ['AU', 'NZ', 'FJ', 'PG', 'WS', 'TO'];
      const nonOceaniaCodes = ['US', 'BR', 'ES', 'JP', 'EG', 'NG'];

      oceaniaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isOceania()).toBe(true);
      });

      nonOceaniaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isOceania()).toBe(false);
      });
    });
  });

  describe('clasificaciones por subregiones', () => {
    it('debería identificar correctamente Europa Occidental', () => {
      const westernEuropeCodes = ['ES', 'FR', 'DE', 'IT', 'GB', 'NL', 'CH'];
      const nonWesternEuropeCodes = ['PL', 'RU', 'SE', 'US', 'JP'];

      westernEuropeCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isWesternEurope()).toBe(true);
      });

      nonWesternEuropeCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isWesternEurope()).toBe(false);
      });
    });

    it('debería identificar correctamente países nórdicos', () => {
      const nordicCodes = ['SE', 'NO', 'DK', 'FI', 'IS'];
      const nonNordicCodes = ['DE', 'FR', 'PL', 'RU', 'US'];

      nordicCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isNordicCountries()).toBe(true);
      });

      nonNordicCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isNordicCountries()).toBe(false);
      });
    });

    it('debería identificar correctamente Europa Oriental', () => {
      const easternEuropeCodes = ['PL', 'RU', 'UA', 'CZ', 'HU', 'RO'];
      const nonEasternEuropeCodes = ['ES', 'FR', 'SE', 'US', 'JP'];

      easternEuropeCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isEasternEurope()).toBe(true);
      });

      nonEasternEuropeCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isEasternEurope()).toBe(false);
      });
    });

    it('debería identificar correctamente Medio Oriente (parte de Asia Occidental)', () => {
      const middleEastCodes = ['SA', 'AE', 'IR', 'IL', 'JO', 'SY']; // TR y CY son transcontinentales
      const nonMiddleEastCodes = ['JP', 'IN', 'US', 'ES', 'EG'];

      middleEastCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isMiddleEast()).toBe(true); // Medio Oriente es parte de Asia
      });

      nonMiddleEastCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isMiddleEast()).toBe(false);
      });
    });

    it('debería identificar correctamente Asia Oriental', () => {
      const eastAsiaCodes = ['JP', 'KR', 'CN', 'TW', 'MN'];
      const nonEastAsiaCodes = ['IN', 'TH', 'SA', 'US', 'ES'];

      eastAsiaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isEastAsia()).toBe(true);
      });

      nonEastAsiaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isEastAsia()).toBe(false);
      });
    });

    it('debería identificar correctamente Sudeste Asiático', () => {
      const southeastAsiaCodes = ['TH', 'VN', 'PH', 'ID', 'MY', 'SG'];
      const nonSoutheastAsiaCodes = ['JP', 'IN', 'SA', 'US', 'ES'];

      southeastAsiaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isSoutheastAsia()).toBe(true);
      });

      nonSoutheastAsiaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isSoutheastAsia()).toBe(false);
      });
    });

    it('debería identificar correctamente Asia Meridional', () => {
      const southAsiaCodes = ['IN', 'PK', 'BD', 'LK', 'NP', 'AF'];
      const nonSouthAsiaCodes = ['JP', 'TH', 'SA', 'US', 'ES'];

      southAsiaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isSouthAsia()).toBe(true);
      });

      nonSouthAsiaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isSouthAsia()).toBe(false);
      });
    });

    it('debería identificar correctamente Asia Central', () => {
      const centralAsiaCodes = ['KZ', 'UZ', 'TM', 'TJ', 'KG'];
      const nonCentralAsiaCodes = ['RU', 'CN', 'IN', 'US', 'ES'];

      centralAsiaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isCentralAsia()).toBe(true);
      });

      nonCentralAsiaCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isCentralAsia()).toBe(false);
      });
    });
  });

  describe('métodos de utilidad', () => {
    it('debería generar emojis de banderas correctamente', () => {
      const flagTests = [
        { code: 'US', expectedLength: 4 }, // Los emojis de banderas tienen 4 code units
        { code: 'BR', expectedLength: 4 },
        { code: 'JP', expectedLength: 4 },
        { code: 'ES', expectedLength: 4 },
      ];

      flagTests.forEach(({ code, expectedLength }) => {
        const countryCode = new CountryCode(code);
        const flag = countryCode.getFlag();
        expect(flag.length).toBe(expectedLength);
        expect(typeof flag).toBe('string');
      });
    });

    it('debería proporcionar hints de timezone', () => {
      const timezoneTests = [
        { code: 'US', expected: 'UTC-5 to UTC-10' },
        { code: 'BR', expected: 'UTC-2 to UTC-5' },
        { code: 'JP', expected: 'UTC+9' },
        { code: 'ES', expected: 'UTC+1' },
        { code: 'AR', expected: 'UTC-3' },
      ];

      timezoneTests.forEach(({ code, expected }) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.getTimezoneHint()).toBe(expected);
      });
    });

    it('debería retornar UTC para países sin timezone específico', () => {
      const countryCode = new CountryCode('GH'); // Ghana
      expect(countryCode.getTimezoneHint()).toBe('UTC');
    });

    it('debería retornar true en isValid() para códigos válidos', () => {
      const validCodes = ['US', 'BR', 'JP', 'ES', 'DE'];

      validCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isValid()).toBe(true);
      });
    });
  });

  describe('países transcontinentales y casos especiales', () => {
    it('debería manejar correctamente países transcontinentales', () => {
      // Rusia: Transcontinental (Europa Y Asia)
      const russia = new CountryCode('RU');
      expect(russia.isTranscontinental()).toBe(true);
      expect(russia.isEurope()).toBe(true);
      expect(russia.isAsia()).toBe(true);
      expect(russia.getPrimaryContinent()).toBe('Asia');

      // Turquía: Transcontinental (Europa Y Asia)
      const turkey = new CountryCode('TR');
      expect(turkey.isTranscontinental()).toBe(true);
      expect(turkey.isEurope()).toBe(true);
      expect(turkey.isAsia()).toBe(true);
      expect(turkey.getPrimaryContinent()).toBe('Asia');

      // Chipre: Transcontinental (Europa Y Asia)
      const cyprus = new CountryCode('CY');
      expect(cyprus.isTranscontinental()).toBe(true);
      expect(cyprus.isEurope()).toBe(true);
      expect(cyprus.isAsia()).toBe(true);
      expect(cyprus.getPrimaryContinent()).toBe('Asia');
    });

    it('debería identificar correctamente países del Cáucaso', () => {
      const caucasusCodes = ['GE', 'AM', 'AZ'];
      const nonCaucasusCodes = ['RU', 'TR', 'IR', 'US', 'ES'];

      caucasusCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isCaucasus()).toBe(true);
        expect(countryCode.isAsia()).toBe(true);
        expect(countryCode.isEurope()).toBe(false); // Geográficamente en Asia
        expect(countryCode.getPrimaryContinent()).toBe('Asia');
      });

      nonCaucasusCodes.forEach((code) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.isCaucasus()).toBe(false);
      });
    });

    it('debería manejar correctamente las Islas Malvinas con nombre en español', () => {
      const falklands = new CountryCode('FK');
      expect(falklands.getDisplayName()).toBe('Islas Malvinas'); // En español 🇦🇷
      expect(falklands.isSouthAmerica()).toBe(true); // Clasificación política argentina
      expect(falklands.getPrimaryContinent()).toBe('South America');
    });

    it('debería retornar continente primario correcto para países no transcontinentales', () => {
      const testCases = [
        { code: 'US', expected: 'North America' },
        { code: 'GT', expected: 'Central America and Caribbean' },
        { code: 'BR', expected: 'South America' },
        { code: 'ES', expected: 'Europe' },
        { code: 'JP', expected: 'Asia' },
        { code: 'NG', expected: 'Africa' },
        { code: 'AU', expected: 'Oceania' },
      ];

      testCases.forEach(({ code, expected }) => {
        const countryCode = new CountryCode(code);
        expect(countryCode.getPrimaryContinent()).toBe(expected);
        expect(countryCode.isTranscontinental()).toBe(false);
      });
    });
  });

  describe('comparación y igualdad', () => {
    it('debería considerar country codes iguales si tienen el mismo valor', () => {
      const code1 = new CountryCode('BR');
      const code2 = new CountryCode('BR');

      expect(code1.value).toBe(code2.value);
      expect(code1.getDisplayName()).toBe(code2.getDisplayName());
    });

    it('debería considerar country codes diferentes si tienen valores diferentes', () => {
      const code1 = new CountryCode('BR');
      const code2 = new CountryCode('AR');

      expect(code1.value).not.toBe(code2.value);
      expect(code1.getDisplayName()).not.toBe(code2.getDisplayName());
    });
  });
});
