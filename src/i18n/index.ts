import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import zhTW from './locales/zh-TW';
import zhCN from './locales/zh-CN';
import en from './locales/en';
import vi from './locales/vi';
import id from './locales/id';

export const LANGUAGES = [
  {code: 'zh-TW', label: '繁體中文'},
  {code: 'zh-CN', label: '简体中文'},
  {code: 'en', label: 'English'},
  {code: 'vi', label: 'Tiếng Việt'},
  {code: 'id', label: 'Bahasa Indonesia'},
];

const SUPPORTED_LANGUAGES = LANGUAGES.map(l => l.code);

const getDeviceLanguage = (): string => {
  try {
    const deviceLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    const normalized = deviceLocale.replace('_', '-');

    if (SUPPORTED_LANGUAGES.includes(normalized)) {
      return normalized;
    }

    const prefix = normalized.split('-')[0];
    const matched = SUPPORTED_LANGUAGES.find(lang => lang.startsWith(prefix));
    return matched ?? 'zh-TW';
  } catch (e) {
    return 'zh-TW';
  }
};

i18n.use(initReactI18next).init({
  resources: {
    'zh-TW': {translation: zhTW},
    'zh-CN': {translation: zhCN},
    en: {translation: en},
    vi: {translation: vi},
    id: {translation: id},
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'zh-TW',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;