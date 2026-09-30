import { twClass } from "../../lib/tw";
import { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  RefreshCw,
  ShieldCheck,
  X,
  Camera,
} from "lucide-react";
import { useTranslation } from "../../../node_modules/react-i18next";
import { adminApi, type User } from "../../lib/api";
import WorkerSelfieCamera from "../auth/WorkerSelfieCamera";
import { toast } from "sonner";
//role
type RoleFilter = "" | "customer" | "worker";
const userId = (u: any) => String(u?._id || u?.id || "");

export default function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState<RoleFilter>("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [targetRole, setTargetRole] = useState<"customer" | "worker">("worker");
  const [experienceYears, setExperienceYears] = useState("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [roleBusy, setRoleBusy] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const r = await adminApi.users({
        q,
        status,
        role: role || undefined,
        page,
        limit: 12,
      });
      setUsers(r.users);
      setPages(r.pages);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to load users");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [page, status, role]);
  const change = async (id: string, s: string) => {
    if (!window.confirm(t("admin.users.confirmStatus"))) return;
    try {
      await adminApi.userStatus(id, s);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to update status");
    }
  };
  const del = async (id: string) => {
    if (!window.confirm(t("admin.users.confirmDelete"))) return;
    try {
      await adminApi.deleteUser(id);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to delete user");
    }
  };
  const openRole = (u: User) => {
    setRoleUser(u);
    setTargetRole(u.role === "worker" ? "customer" : "worker");
    setExperienceYears("");
    setIdDocument(null);
    setSelfie(null);
  };
  const submitRole = async () => {
    if (!roleUser) return;
    if (
      targetRole === "worker" &&
      (!idDocument || !selfie || experienceYears === "")
    ) {
      toast.error(
        "Aadhaar / ID, camera selfie and work experience are mandatory.",
      );
      return;
    }
    setRoleBusy(true);
    try {
      await adminApi.changeRole(userId(roleUser), targetRole, {
        experienceYears: Number(experienceYears) || 0,
        idDocument: idDocument || undefined,
        selfie: selfie || undefined,
      });
      toast.success(`Role changed to ${targetRole}`);
      setRoleUser(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Role change failed");
    } finally {
      setRoleBusy(false);
    }
  };
  return (
    <div>
      <div className={twClass("gls-admin-page-title")}>
        <div>
          <p>{t("admin.nav.users")}</p>
          <h1>{t("admin.users.title")}</h1>
          <span>{t("admin.users.subtitle")}</span>
        </div>
        <button
          onClick={() => void load()}
          className={twClass("gls-admin-refresh")}
        >
          <RefreshCw size={16} />
          {t("admin.common.refresh")}
        </button>
      </div>
      <section className={twClass("gls-admin-card-v2")}>
        <div className={twClass("gls-admin-toolbar")}>
          <div className={twClass("gls-admin-searchbox")}>
            <Search size={17} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setPage(1)}
              placeholder={t("admin.users.search")}
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">{t("admin.common.allStatus")}</option>
            <option value="active">{t("admin.status.active")}</option>
            <option value="inactive">{t("admin.status.inactive")}</option>
            <option value="blocked">{t("admin.status.blocked")}</option>
          </select>
          <button
            className={twClass("gls-admin-primary")}
            onClick={() => {
              setPage(1);
              void load();
            }}
          >
            <Search size={16} />
            {t("admin.common.search")}
          </button>
        </div>
        <div
          className={twClass("wf-admin-user-role-tabs")}
          role="tablist"
          aria-label="User category"
        >
          <button
            className={!role ? "active" : ""}
            onClick={() => {
              setRole("");
              setPage(1);
            }}
          >
            All Users
          </button>
          <button
            className={role === "customer" ? "active" : ""}
            onClick={() => {
              setRole("customer");
              setPage(1);
            }}
          >
            Customers
          </button>
          <button
            className={role === "worker" ? "active" : ""}
            onClick={() => {
              setRole("worker");
              setPage(1);
            }}
          >
            Workers
          </button>
        </div>
        {loading ? (
          <div className={twClass("gls-admin-loading")}>
            {t("admin.common.loading")}
          </div>
        ) : users.length === 0 ? (
          <div className={twClass("gls-admin-empty-v2")}>
            {t("admin.users.empty")}
          </div>
        ) : (
          <div className={twClass("gls-admin-table-scroll")}>
            <table className={twClass("gls-admin-data-table")}>
              <thead>
                <tr>
                  <th>{t("admin.users.profile")}</th>
                  <th>{t("admin.users.mobile")}</th>
                  <th>{t("admin.users.email")}</th>
                  <th>{t("admin.users.role")}</th>
                  <th>{t("admin.users.status")}</th>
                  <th>{t("admin.users.registered")}</th>
                  <th>{t("admin.users.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={userId(u)}>
                    <td>
                      <div className={twClass("gls-user-cell")}>
                        <div>{String(u.name || "?").slice(0, 1)}</div>
                        <b>{u.name}</b>
                      </div>
                    </td>
                    <td>{u.mobile || "—"}</td>
                    <td>{u.email || "—"}</td>
                    <td>
                      <span className={twClass(`gls-role-pill ${u.role}`)}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={twClass(`gls-pill ${u.status || "active"}`)}
                      >
                        {u.status || "active"}
                      </span>
                    </td>
                    <td>
                      {(u as any).createdAt
                        ? new Date((u as any).createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <div className={twClass("gls-row-actions")}>
                        {u.role !== "admin" && (
                          <>
                            <button
                              className={twClass("gls-role-change-btn,w-24")}
                              onClick={() => openRole(u)}
                              title="Change role"
                            >
                              <ShieldCheck size={14} /> Role
                            </button>
                            <select
                              className={twClass("gls-status-select")}
                              value={u.status || "active"}
                              onChange={(e) =>
                                void change(userId(u), e.target.value)
                              }
                            >
                              <option value="active">
                                {t("admin.status.active")}
                              </option>
                              <option value="inactive">
                                {t("admin.status.inactive")}
                              </option>
                              <option value="blocked">
                                {t("admin.status.blocked")}
                              </option>
                            </select>
                            <button
                              title={t("admin.users.delete")}
                              onClick={() => void del(userId(u))}
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className={twClass("gls-admin-pagination")}>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ‹
          </button>
          <span>
            {page} / {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </button>
        </div>
      </section>
      {roleUser && (
        <div
          className={twClass(
            "fixed inset-0 z-120 grid place-items-center bg-slate-950/60 p-4",
          )}
        >
          <section
            className={twClass(
              "w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl",
            )}
          >
            <header
              className={twClass(
                "flex items-start justify-between gap-3 border-b border-slate-100 p-5",
              )}
            >
              <div>
                <p
                  className={twClass(
                    "text-[10px] font-black uppercase tracking-[.16em] text-emerald-600",
                  )}
                >
                  Admin role change
                </p>
                <h2
                  className={twClass("mt-1 text-lg font-black text-slate-900")}
                >
                  {roleUser.name}
                </h2>
                <p className={twClass("mt-1 text-xs text-slate-500")}>
                  Current role: {roleUser.role}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRoleUser(null)}
                className={twClass(
                  "grid h-9 w-9 place-items-center rounded-lg bg-slate-100",
                )}
              >
                <X size={17} />
              </button>
            </header>
            <div className={twClass("grid gap-4 p-5")}>
              <label
                className={twClass(
                  "grid gap-1.5 text-xs font-bold text-slate-600",
                )}
              >
                New role
                <select
                  className={twClass(
                    "h-11 rounded-xl border border-slate-200 px-3 text-sm",
                  )}
                  value={targetRole}
                  onChange={(e) =>
                    setTargetRole(e.target.value as "customer" | "worker")
                  }
                >
                  <option value="customer">Customer</option>
                  <option value="worker">Worker</option>
                </select>
              </label>
              {targetRole === "worker" && (
                <>
                  <label
                    className={twClass(
                      "grid gap-1.5 text-xs font-bold text-slate-600",
                    )}
                  >
                    Work experience (years) *
                    <input
                      className={twClass(
                        "h-11 rounded-xl border border-slate-200 px-3 text-sm",
                      )}
                      type="number"
                      min="0"
                      max="70"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="e.g. 5"
                    />
                  </label>
                  <div className={twClass("grid gap-3 sm:grid-cols-2")}>
                    <label
                      className={twClass(
                        "grid gap-1.5 text-xs font-bold text-slate-600",
                      )}
                    >
                      Aadhaar / ID *
                      <span
                        className={twClass(
                          "flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-xs font-semibold text-slate-600",
                        )}
                      >
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className={twClass("sr-only")}
                          onChange={(e) =>
                            setIdDocument(e.target.files?.[0] || null)
                          }
                        />
                        {idDocument?.name || "Choose ID document"}
                      </span>
                    </label>
                    <div
                      className={twClass(
                        "grid gap-1.5 text-xs font-bold text-slate-600",
                      )}
                    >
                      Camera selfie *
                      <button
                        type="button"
                        onClick={() => setCameraOpen(true)}
                        className={twClass(
                          "flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-3 text-xs font-black text-emerald-700",
                        )}
                      >
                        <Camera size={16} />
                        {selfie ? "Retake selfie" : "Open camera"}
                      </button>
                      {selfie && (
                        <span
                          className={twClass("text-[10px] text-emerald-700")}
                        >
                          Selfie captured: {selfie.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={twClass(
                      "rounded-xl border border-amber-100 bg-amber-50 p-3 text-[10px] leading-4 text-amber-800",
                    )}
                  >
                    The role changes to Worker, but the worker stays pending
                    until Admin verifies the Aadhaar / ID and selfie.
                  </div>
                </>
              )}
              <div className={twClass("flex justify-end gap-2")}>
                <button
                  type="button"
                  onClick={() => setRoleUser(null)}
                  className={twClass(
                    "rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-600",
                  )}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={roleBusy}
                  onClick={() => void submitRole()}
                  className={twClass(
                    "rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white disabled:opacity-50",
                  )}
                >
                  {roleBusy ? "Saving…" : "Change Role"}
                </button>
              </div>
            </div>
          </section>
          <WorkerSelfieCamera
            open={cameraOpen}
            onClose={() => setCameraOpen(false)}
            onCapture={(file) => {
              setSelfie(file);
              setCameraOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
