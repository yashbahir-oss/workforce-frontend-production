import i18n from "i18next";
import { initReactI18next } from "../../node_modules/react-i18next";

import mr from "./locales/mr.json";
import hi from "./locales/hi.json";
import en from "./locales/en.json";

i18n.use(initReactI18next).init({
  resources: {
    mr: {
      translation: mr,
    },
    hi: {
      translation: hi,
    },
    en: {
      translation: en,
    },
  },

  lng:
    (localStorage.getItem("workforce_language") as "mr" | "hi" | "en" | null) ||
    "mr",

  fallbackLng: "en",

  supportedLngs: ["mr", "hi", "en"],

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },
});

export default i18n;
