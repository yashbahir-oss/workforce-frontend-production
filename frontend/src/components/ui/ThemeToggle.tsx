import { twClass } from "../../lib/tw";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const KEY = "workforce_theme";

export default function ThemeToggle({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem(KEY, next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={twClass(`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 ${compact ? "h-10 w-10" : "px-3 py-2 text-xs font-bold"}`)}
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
      {!compact && <span>{dark ? "Light" : "Dark"}</span>}
    </button>
  );
}
