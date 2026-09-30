import { create } from "zustand";
import type { User } from "../../lib/api";

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
};

const tokenKey = "workforce_token";
const userKey = "workforce_user";

let savedUser: User | null = null;
try {
  savedUser = JSON.parse(localStorage.getItem(userKey) || "null");
} catch {
  savedUser = null;
}

export const useAuthStore = create<AuthState>((set) => {
  if (typeof window !== "undefined") {
    window.addEventListener("workforce-auth-refreshed", (event: Event) => {
      const data = (event as CustomEvent<{ token: string; user: User }>).detail;
      if (data?.token && data?.user)
        set({ token: data.token, user: data.user });
    });
    window.addEventListener("workforce-auth-expired", () => {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
      set({ token: null, user: null });
    });
  }
  return {
    token: localStorage.getItem(tokenKey),
    user: savedUser,
    setAuth: (token, user) => {
      localStorage.setItem(tokenKey, token);
      localStorage.setItem(userKey, JSON.stringify(user));
      set({ token, user });
    },
    logout: () => {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
      set({ token: null, user: null });
    },
  };
});
