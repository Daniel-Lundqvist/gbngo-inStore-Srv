import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import sv from './locales/sv.json';
import en from './locales/en.json';
import da from './locales/da.json';
import de from './locales/de.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      sv: { translation: sv },
      en: { translation: en },
      da: { translation: da },
      de: { translation: de }
    },
    lng: 'sv',
    fallbackLng: 'sv',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
