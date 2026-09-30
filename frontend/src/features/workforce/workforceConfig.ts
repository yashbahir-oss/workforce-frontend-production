/** Public, non-secret frontend configuration. Business metrics always come from APIs. */
export const workforceConfig = {
  support: {
    phone: import.meta.env.VITE_SUPPORT_PHONE || "",
    email: import.meta.env.VITE_SUPPORT_EMAIL || "",
  },
  social: {
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK || "",
    instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM || "",
    youtube: import.meta.env.VITE_SOCIAL_YOUTUBE || "",
    x: import.meta.env.VITE_SOCIAL_X || "",
  },
} as const;
