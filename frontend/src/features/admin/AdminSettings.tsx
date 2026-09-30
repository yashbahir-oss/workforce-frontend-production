import { twClass } from "../../lib/tw";
import { useState } from "react";
import { LogOut, UserCircle } from "lucide-react";
import { useTranslation } from "../../../node_modules/react-i18next";
import { useAuthStore } from "../auth/auth.store";
import { authApi } from "../../lib/api";
import { useNavigate } from "react-router";
export default function AdminSettings() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const out = async () => {
    setBusy(true);
    try {
      await authApi.logout();
    } catch {}
    logout();
    nav("/login", { replace: true });
    setBusy(false);
  };
  return (
    <div>
      <div className={twClass("gls-admin-page-title")}>
        <div>
          <p>{t("admin.nav.settings")}</p>
          <h1>{t("admin.settings.title")}</h1>
          <span>{t("admin.settings.subtitle")}</span>
        </div>
      </div>
      <section className={twClass("gls-admin-card-v2 gls-admin-settings-card")}>
        <div className={twClass("gls-admin-settings-avatar")}>
          <UserCircle size={52} />
        </div>
        <div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <span>
            {t("admin.settings.role")}: {user?.role}
          </span>
        </div>
        <button
          className={twClass("gls-admin-danger")}
          disabled={busy}
          onClick={() => void out()}
        >
          <LogOut size={16} />
          {t("admin.profile.logout")}
        </button>
      </section>
    </div>
  );
}
