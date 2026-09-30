import { create } from "zustand";

export type Language = "mr" | "hi" | "en";
interface LanguageState { language: Language; setLanguage: (language: Language) => void; }
export const useLanguageStore = create<LanguageState>((set) => ({
  language: (localStorage.getItem("workforce_language") as Language) || "mr",
  setLanguage: (language) => { localStorage.setItem("workforce_language", language); set({ language }); },
}));
