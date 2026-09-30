import { twClass } from "../../lib/tw";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Globe2,
  Home,
  Menu,
  MessageCircle,
  X,
  Bot,
  UserCircle,
  FileText,
  LifeBuoy,
} from "lucide-react";
import { NavLink, Outlet, Link } from "react-router";
import { useTranslation } from "../../../node_modules/react-i18next";
import { useAuthStore } from "../auth/auth.store";
import { useLanguageStore, type Language } from "../../store/language.store";
import { authApi, fileUrl, notificationApi } from "../../lib/api";
import WorkforceFooter from "../../components/layout/WorkforceFooter";
import ThemeToggle from "../../components/ui/ThemeToggle";
{
  /* key'profile */
}
const links = [
  ["/worker", "home", Home],
  ["/worker/find-jobs", "findWork", BriefcaseBusiness],
  ["/worker/bookings", "bookings", CalendarDays],
  ["/worker/workguide", "workguide", Bot],
  ["/worker/support", "helpSupport", LifeBuoy],
  //  ["/worker/profile","profile",UserCircle],
] as const;

export default function WorkerLayout() {
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  useEffect(() => {
    void notificationApi
      .list()
      .then((r) => setUnread(r.unreadCount || 0))
      .catch(() => {});
    const f = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setLanguageOpen(false);
    };
    document.addEventListener("mousedown", f);
    return () => document.removeEventListener("mousedown", f);
  }, []);
  const changeLanguage = async (l: Language) => {
    await i18n.changeLanguage(l);
    setLanguage(l);
    setLanguageOpen(false);
    setOpen(false);
  };
  const logout = async () => {
    try {
      await authApi.logout();
    } catch {}
    useAuthStore.getState().logout();
    window.location.assign("/login");
  };
  return (
    <div className={twClass("wf-worker-shell")}>
      <header className={twClass("wf-customer-header")}>
        <div className={twClass("wf-wide wf-customer-header-inner")}>
          <Link
            to="/worker"
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
                end={path === "/worker"}
                className={({ isActive }) =>
                  twClass(`wf-nav-link ${isActive ? "is-active" : ""}`)
                }
              >
                <Icon size={16} />
                <span>{t(`${key}`, key)}</span>
              </NavLink>
            ))}
          </nav>
          <div className={twClass("wf-header-actions")}>
            <Link
              className={twClass("wf-head-icon")}
              to="/worker/notifications"
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unread > 0 && (
                <span className={twClass("wf-bell-dot")}>
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <ThemeToggle compact />
            <div className={twClass("wf-lang-wrap")} ref={ref}>
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
                  {(["en", "mr", "hi"] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => void changeLanguage(l)}
                      type="button"
                    >
                      {l === "en" ? "English" : l === "mr" ? "मराठी" : "हिंदी"}
                      {language === l && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={twClass("wf-profile-menu-wrap")}>
              <button
                type="button"
                className={twClass("wf-user-chip flex! sm:flex")}
                onClick={() => setProfileOpen((v) => !v)}
              >
                <span className={twClass("wf-user-avatar")}>
                  <img
                    src={fileUrl(user?.profileImage) || "/workforce-logo.png"}
                    onError={(e) => {
                      e.currentTarget.src = "/workforce-logo.png";
                    }}
                    alt="Profile"
                  />
                </span>
                <span className={twClass("wf-user-copy hidden sm:grid")}>
                  <b>{user?.name || t("profile", "Worker")}</b>
                  <small>{t("customer.footer.forWorkers", "Worker")}</small>
                </span>
                <ChevronDown className={twClass("hidden sm:block")} size={14} />
              </button>
              {profileOpen && (
                <div className={twClass("wf-profile-menu")}>
                  <Link
                    to="/worker/profile"
                    onClick={() => setProfileOpen(false)}
                  >
                    <UserCircle size={15} /> My Profile
                  </Link>
                  <button type="button" onClick={() => void logout()}>
                    <span>↪</span> Logout
                  </button>
                </div>
              )}
            </div>
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
                  end={path === "/worker"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    twClass(`wf-mobile-link ${isActive ? "active" : ""}`)
                  }
                >
                  <Icon size={18} />
                  {t(`${key}`, key)}
                </NavLink>
              ))}
              <Link
                to="/worker/applications"
                onClick={() => setOpen(false)}
                className={twClass("wf-mobile-link")}
              >
                <FileText size={18} />
                Applications
              </Link>
              <Link
                to="/worker/messages"
                onClick={() => setOpen(false)}
                className={twClass("wf-mobile-link")}
              >
                <MessageCircle size={18} />
                Messages
              </Link>
              <Link
                to="/worker/notifications"
                onClick={() => setOpen(false)}
                className={twClass("wf-mobile-link")}
              >
                <Bell size={18} />
                Notifications
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className={twClass("wf-mobile-link wf-mobile-logout")}
              >
                <span>↪</span>Logout
              </button>
            </div>
          </nav>
        )}
      </header>
      <main className={twClass("pb-15.5 sm:pb-0")}>
        <Outlet />
      </main>
      <WorkforceFooter mode="worker" />
      <nav
        className={twClass(
          "fixed inset-x-0 bottom-0 z-95 grid h-14.5 grid-cols-5 border-t border-slate-200 bg-white/95 px-1.5 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgba(9,55,87,.12)] backdrop-blur md:hidden",
        )}
        aria-label="Worker mobile navigation"
      >
        <NavLink
          to="/worker"
          end
          className={({ isActive }) =>
            twClass(
              `flex min-w-0 flex-col items-center justify-center gap-0.5 text-[7px] font-black ${isActive ? "text-emerald-600" : "text-slate-500"}`,
            )
          }
        >
          <Home size={18} />
          <span className={twClass("max-w-full truncate")}>{t("home")}</span>
        </NavLink>
        <NavLink
          to="/worker/find-jobs"
          className={({ isActive }) =>
            twClass(
              `flex min-w-0 flex-col items-center justify-center gap-0.5 text-[7px] font-black ${isActive ? "text-emerald-600" : "text-slate-500"}`,
            )
          }
        >
          <BriefcaseBusiness size={18} />
          <span className={twClass("max-w-full truncate")}>
            {t("findWork")}
          </span>
        </NavLink>
        <NavLink
          to="/worker/bookings"
          className={({ isActive }) =>
            twClass(
              `flex min-w-0 flex-col items-center justify-center gap-0.5 text-[7px] font-black ${isActive ? "text-emerald-600" : "text-slate-500"}`,
            )
          }
        >
          <CalendarDays size={18} />
          <span className={twClass("max-w-full truncate")}>
            {t("bookings")}
          </span>
        </NavLink>
        <NavLink
          to="/worker/profile"
          className={({ isActive }) =>
            twClass(
              `flex min-w-0 flex-col items-center justify-center gap-0.5 text-[7px] font-black ${isActive ? "text-emerald-600" : "text-slate-500"}`,
            )
          }
        >
          <UserCircle size={18} />
          <span className={twClass("max-w-full truncate")}>{"profile"}</span>
        </NavLink>
        <NavLink
          to="/worker/messages"
          className={({ isActive }) =>
            twClass(
              `flex min-w-0 flex-col items-center justify-center gap-0.5 text-[7px] font-black ${isActive ? "text-emerald-600" : "text-slate-500"}`,
            )
          }
        >
          <MessageCircle size={18} />
          <span className={twClass("max-w-full truncate")}>
            {t("messages")}
          </span>
        </NavLink>
      </nav>
    </div>
  );
}
