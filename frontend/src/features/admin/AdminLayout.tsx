import { twClass } from "../../lib/tw";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareWarning,
  Search,
  Settings,
  Users,
  BriefcaseBusiness,
  X,
  UserRound,
  ChevronRight,
  Globe2,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../auth/auth.store";
import { adminApi, fileUrl, authApi, notificationApi } from "../../lib/api";
import { toast } from "sonner";
import ThemeToggle from "../../components/ui/ThemeToggle";

const links = [
  ["Dashboard", "/admin/dashboard", LayoutDashboard],
  ["Users", "/admin/users", Users],
  ["Workers", "/admin/verification?view=workers", BriefcaseBusiness],
  ["Bookings", "/admin/bookings", CalendarDays],
  ["Complaints", "/admin/complaints", MessageSquareWarning],
  ["Analytics", "/admin/analytics", BarChart3],
  ["Settings", "/admin/settings", Settings],
] as const;
export default function AdminLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const { token, user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationUnread, setNotificationUnread] = useState(0);
  useEffect(() => {
    if (!token || user?.role !== "admin") {
      nav("/login", { replace: true });
      return;
    }
    void adminApi
      .stats()
       .then(() => undefined)
      .catch(() => undefined);
    void notificationApi.list()
      .then((r) => { setNotifications(r.notifications || []); setNotificationUnread(r.unreadCount || 0); })
      .catch(() => { setNotifications([]); setNotificationUnread(0); });
  }, [token, user?.role, nav]);
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12
      ? "Good morning"
      : h < 17
        ? "Good afternoon"
        : h < 21
          ? "Good evening"
          : "Good night";
  }, []);
  const isActiveLink = (path: string) => {
    const [pathname, query] = path.split("?");
    if (location.pathname !== pathname) return false;
    const current = new URLSearchParams(location.search);
    if (!query) return true;
    const expected = new URLSearchParams(query);
    let matches = true;
    expected.forEach((value, key) => { if (current.get(key) !== value) matches = false; });
    return matches;
  };
  const openNotifications = async () => {
    setNotificationOpen((value) => !value);
    if (!notificationOpen) {
      try {
        const result = await notificationApi.list();
        setNotifications(result.notifications || []);
        setNotificationUnread(result.unreadCount || 0);
      } catch {}
    }
  };
  const handleNotification = async (notification: any) => {
    try { if (!notification.read && notification.id) await notificationApi.markRead(String(notification.id)); } catch {}
    setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read: true } : item));
    setNotificationUnread((count) => Math.max(0, count - (notification.read ? 0 : 1)));
    setNotificationOpen(false);
    if (notification.path) nav(notification.path);
  };

  const logoutAdmin = async () => {
    try {
      await authApi.logout();
    } catch {}
    logout();
    toast.success("Admin logged out");
    nav("/login", { replace: true });
  };
  if (!token || user?.role !== "admin") return null;
  return (
    <div className={twClass('wf-admin-shell')}>
      <div
        className={twClass(`wf-admin-overlay ${open ? "show" : ""}`)}
        onClick={() => setOpen(false)}
      />
      <aside className={twClass(`wf-admin-sidebar ${open ? "open" : ""}`)}>
        <div className={twClass('wf-admin-brand')}>
          <img src="/workforce-logo.png" alt="WORKFORCE" />
          <div>
            <b>
              WORK<span>FORCE</span>
            </b>
            <small>Admin Panel</small>
          </div>
          <button onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav>
          {links.map(([label, path, Icon]) => {
            const selected = isActiveLink(path);
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                aria-current={selected ? "page" : undefined}
                className={twClass(`wf-admin-link ${selected ? "active" : ""}`)}
              >
                <Icon size={17} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className={twClass('wf-admin-bottom')}>
          <div className={twClass('wf-admin-lang')}>
            <Globe2 size={15} />
            <span>English</span>
            <ChevronRight size={14} />
          </div>
          <button onClick={logoutAdmin}>
            <LogOut size={17} /> Logout
          </button>
          <small>v1.0.0</small>
        </div>
      </aside>
      <section className={twClass('wf-admin-main')}>
        <header className={twClass('wf-admin-header')}>
          <button className={twClass('wf-admin-menu')} onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <div className={twClass('wf-admin-search')}>
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) {
                  nav(`/admin/users?q=${encodeURIComponent(search.trim())}`);
                  setSearch("");
                }
              }}
              placeholder="Search users, workers, bookings..."
            />
          </div>
          <div className={twClass('wf-admin-head-actions')}>
            <button className={twClass('wf-admin-lang-top')}>
              <Globe2 size={15} /> English <ChevronRight size={13} />
            </button>
            <div className={twClass('wf-admin-notify-wrap')}>
              <button type="button" className={twClass('wf-admin-notify')} onClick={() => void openNotifications()} aria-label="Notifications">
                <Bell size={18} />
                {notificationUnread > 0 && <span>{notificationUnread > 9 ? "9+" : notificationUnread}</span>}
              </button>
              {notificationOpen && <div className={twClass('wf-admin-notification-panel')}>
                <div className={twClass('wf-admin-notification-head')}><b>Notifications</b><button type="button" onClick={() => void notificationApi.markAllRead().then(() => { setNotifications((items) => items.map((item) => ({ ...item, read: true }))); setNotificationUnread(0); })}>Mark all read</button></div>
                <div className={twClass('wf-admin-notification-list')}>
                  {notifications.length ? notifications.slice(0, 12).map((item) => <button key={String(item.id || item._id)} type="button" className={twClass(`wf-admin-notification-item ${item.read ? "" : "unread"}`)} onClick={() => void handleNotification(item)}><span className={twClass('wf-admin-notification-dot')}/><span><b>{item.title || "Notification"}</b><small>{item.message || ""}</small></span></button>) : <p className={twClass('wf-admin-notification-empty')}>No notifications</p>}
                </div>
              </div>}
            </div>
            <ThemeToggle compact />
            <Link to="/admin/settings" className={twClass('wf-admin-user')}>
              <span>
                {user.profileImage ? (
                  <img src={fileUrl(user.profileImage)} alt="Admin" />
                ) : (
                  <UserRound size={20} />
                )}
              </span>
              <div>
                <b>{user.name}</b>
                <small>Super Admin</small>
              </div>
              <ChevronRight size={13} />
            </Link>
          </div>
        </header>
        <main className={twClass('wf-admin-content')}>
          <div className={twClass('wf-admin-pagebar')}>
            <div>
              <span>ADMINISTRATION PANEL</span>
              <h1>{greeting}, Admin!</h1>
              <p>Here’s what’s happening with your platform today.</p>
            </div>
            <div className={twClass('wf-admin-date')}>
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              <small>Live MongoDB data</small>
            </div>
          </div>
          <Outlet />
        </main>
      </section>
    </div>
  );
}
