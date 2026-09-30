import { twClass } from "../../lib/tw";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Globe2,
  Home,
  Menu,
  Users,
  X,
  Bot,
  UserCircle,
  PlusCircle,
  LifeBuoy,
} from "lucide-react";
import { NavLink, Outlet, Link } from "react-router";
import { useTranslation } from "../../../node_modules/react-i18next";
import { useAuthStore } from "../auth/auth.store";
import { useLanguageStore, type Language } from "../../store/language.store";
import { fileUrl, notificationApi } from "../../lib/api";
import WorkforceFooter from "../../components/layout/WorkforceFooter";
import ThemeToggle from "../../components/ui/ThemeToggle";

const links = [
  ["/", "home", Home],
  ["/find-workers", "findWorkers", Users],
  ["/post-requirement", "postRequirement", PlusCircle],
  ["/bookings", "bookings", CalendarDays],
  ["/workguide", "workguide", Bot],
  ["/requests", "workerRequests", Users],
  ["/support", "helpSupport", LifeBuoy],
] as const;

export default function WorkforceLayout() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [languageOpen, setLanguageOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  const { user, token } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  useEffect(() => {
    void notificationApi
      .list()
      .then((r) => setUnread(r.unreadCount || 0))
      .catch(() => {});
    const fn = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setLanguageOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);
  const changeLanguage = async (lang: Language) => {
    await i18n.changeLanguage(lang);
    setLanguage(lang);
    document.documentElement.lang = lang;
    setLanguageOpen(false);
    setOpen(false);
  };
  return (
    <div className={twClass("wf-customer-shell")}>
      <header className={twClass("wf-customer-header")}>
        <div className={twClass("wf-wide wf-customer-header-inner")}>
          <Link
            to="/"
            className={twClass("flex min-w-0 shrink-0 items-center gap-2")}
            onClick={() => setOpen(false)}
          >
            <img
              src="/workforce-mark.png"
              alt="WORKFORCE"
              className={twClass("h-11 w-11 shrink-0 object-contain")}
            />
            <span className={twClass("block min-w-0")}>
              <b
                className={twClass(
                  "block text-[15px] font-black tracking-tight text-[#123d64]",
                )}
              >
                WORK<span className={twClass("text-emerald-600")}>FORCE</span>
              </b>
              <small
                className={twClass(
                  "block text-[8px] font-semibold text-slate-500",
                )}
              >
                {t("brand.tagline")}
              </small>
            </span>
          </Link>
          <nav className={twClass("wf-customer-nav")}>
            {links.map(([path, key, Icon]) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                className={({ isActive }) =>
                  twClass(`wf-nav-link ${isActive ? "is-active" : ""}`)
                }
              >
                <Icon size={16} />
                <span>{t(`customer.nav.${key}`)}</span>
              </NavLink>
            ))}
          </nav>
          <div className={twClass("wf-header-actions")}>
            <Link
              className={twClass("wf-head-icon")}
              to="/notifications"
              aria-label={t("customer.notifications", "Notifications")}
            >
              <Bell size={17} />
              {unread > 0 && (
                <span className={twClass("wf-bell-dot")}>
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <ThemeToggle compact />
            <div className={twClass("wf-lang-wrap")} ref={langRef}>
              <button
                className={twClass("wf-lang")}
                type="button"
                onClick={() => setLanguageOpen((v) => !v)}
              >
                <Globe2 size={15} />
                <span>
                  {language === "mr"
                    ? "मराठी"
                    : language === "hi"
                      ? "हिंदी"
                      : "EN"}
                </span>
                <ChevronDown size={13} />
              </button>
              {languageOpen && (
                <div className={twClass("wf-lang-menu")}>
                  {(["en", "mr", "hi"] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => changeLanguage(lang)}
                    >
                      {lang === "en"
                        ? "English"
                        : lang === "mr"
                          ? "मराठी"
                          : "हिंदी"}
                      {language === lang && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link
              to={token ? "/profile" : "/login"}
              className={twClass("wf-user-chip !flex sm:flex")}
            >
              <span className={twClass("wf-user-avatar")}>
                {token && user?.profileImage ? (
                  <img src={fileUrl(user.profileImage)} alt="Profile" />
                ) : (
                  <UserCircle size={25} />
                )}
              </span>
              <span className={twClass("wf-user-copy hidden sm:grid")}>
                <b>{token ? user?.name || "Customer" : "Login"}</b>
                <small>{token ? "Customer" : "WORKFORCE"}</small>
              </span>
              <ChevronDown className={twClass("hidden sm:block")} size={14} />
            </Link>
            <button
              className={twClass("wf-menu-toggle")}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
        {open && (
          <nav className={twClass("wf-mobile-nav")}>
            <div className={twClass("wf-wide wf-mobile-nav-grid")}>
              {links.map(([path, key, Icon]) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    twClass(`wf-mobile-link ${isActive ? "active" : ""}`)
                  }
                >
                  <Icon size={18} />
                  {t(`customer.nav.${key}`)}
                </NavLink>
              ))}
              <Link
                to={token ? "/profile" : "/login"}
                onClick={() => setOpen(false)}
                className={twClass("wf-mobile-link")}
              >
                <UserCircle size={18} />
                {token
                  ? t("customer.profile", "Profile")
                  : t("customer.login", "Login")}
              </Link>
            </div>
          </nav>
        )}
      </header>
      <main className={twClass("pb-[62px] sm:pb-0")}>
        <Outlet />
      </main>
      <WorkforceFooter />
      <nav
        className={twClass(
          "fixed inset-x-0 bottom-0 z-[95] grid h-[58px] grid-cols-5 border-t border-slate-200 bg-white/95 px-1.5 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgba(9,55,87,.12)] backdrop-blur md:hidden",
        )}
        aria-label="Customer mobile navigation"
      >
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            twClass(
              `flex min-w-0 flex-col items-center justify-center gap-0.5 text-[7px] font-black ${isActive ? "text-emerald-600" : "text-slate-500"}`,
            )
          }
        >
          <Home size={18} />
          <span className={twClass("max-w-full truncate")}>
            {t("customer.nav.home")}
          </span>
        </NavLink>
        <NavLink
          to="/find-workers"
          className={({ isActive }) =>
            twClass(
              `flex min-w-0 flex-col items-center justify-center gap-0.5 text-[7px] font-black ${isActive ? "text-emerald-600" : "text-slate-500"}`,
            )
          }
        >
          <Users size={18} />
          <span className={twClass("max-w-full truncate")}>
            {t("customer.nav.findWorkers")}
          </span>
        </NavLink>
        <NavLink
          to="/bookings"
          className={({ isActive }) =>
            twClass(
              `flex min-w-0 flex-col items-center justify-center gap-0.5 text-[7px] font-black ${isActive ? "text-emerald-600" : "text-slate-500"}`,
            )
          }
        >
          <CalendarDays size={18} />
          <span className={twClass("max-w-full truncate")}>
            {t("customer.nav.bookings")}
          </span>
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            twClass(
              `flex min-w-0 flex-col items-center justify-center gap-0.5 text-[7px] font-black ${isActive ? "text-emerald-600" : "text-slate-500"}`,
            )
          }
        >
          <UserCircle size={18} />
          <span className={twClass("max-w-full truncate")}>
            {t("customer.profile", "Profile")}
          </span>
        </NavLink>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={twClass(
            "flex min-w-0 flex-col items-center justify-center gap-0.5 border-0 bg-transparent text-[7px] font-black text-slate-500",
          )}
        >
          <Menu size={18} />
          <span className={twClass("max-w-full truncate")}>
            {t("customer.menu", "More")}
          </span>
        </button>
      </nav>
    </div>
  );
}
