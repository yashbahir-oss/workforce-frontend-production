import { twClass } from "../../lib/tw";
import { useEffect, useState } from "react";
import { Search, RefreshCw, Save, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "../../../node_modules/react-i18next";
import { adminApi } from "../../lib/api";

export default function AdminComplaints() {
  const { t } = useTranslation();

  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const r = await adminApi.complaints({ q, status });
      setItems(r.complaints);
    } catch (err: any) {
      setError(err?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [status]);

  const update = async (id: string, next: string, notes: string) => {
    setSavingId(id);
    setError("");

    try {
      await adminApi.updateComplaint(id, {
        status: next,
        notes,
      });

      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to update complaint");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className={twClass("gls-admin-page-title")}>
        <div>
          <p>{t("admin.nav.complaints")}</p>
          <h1>{t("admin.complaints.title")}</h1>
          <span>{t("admin.complaints.subtitle")}</span>
        </div>

        <button
          onClick={() => void load()}
          className={twClass("gls-admin-refresh")}
          disabled={loading}
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
              onKeyDown={(e) => {
                if (e.key === "Enter") void load();
              }}
              placeholder={t("admin.complaints.search")}
            />
          </div>

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t("admin.common.allStatus")}</option>
            <option value="Submitted">Submitted</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            className={twClass("gls-admin-primary")}
            onClick={() => void load()}
            disabled={loading}
          >
            <Search size={16} />
            {t("admin.common.search")}
          </button>
        </div>

        {error && (
          <div
            className={twClass("gls-admin-empty-v2")}
            style={{ marginTop: 12 }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className={twClass("gls-admin-loading")}>
            {t("admin.common.loading")}
          </div>
        ) : items.length === 0 ? (
          <div className={twClass("gls-admin-empty-v2")}>
            {t("admin.common.noComplaints")}
          </div>
        ) : (
          <div className={twClass("gls-admin-table-scroll")}>
            <table className={twClass("gls-admin-data-table")}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t("admin.complaints.subject")}</th>
                  <th>{t("admin.complaints.citizen")}</th>
                  <th>{t("admin.complaints.status")}</th>
                  <th>{t("admin.complaints.remark")}</th>
                  <th>{t("admin.complaints.action")}</th>
                </tr>
              </thead>

              <tbody>
                {items.map((c) => (
                  <ComplaintRow
                    key={c._id}
                    c={c}
                    onSave={update}
                    saving={savingId === c._id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function ComplaintRow({
  c,
  onSave,
  saving,
}: {
  c: any;
  onSave: (id: string, s: string, n: string) => Promise<void>;
  saving: boolean;
}) {
  const { t } = useTranslation();

  const [s, setS] = useState(c.status || "Submitted");
  const [n, setN] = useState(c.notes || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setS(c.status || "Submitted");
    setN(c.notes || "");
  }, [c.status, c.notes]);

  return (
    <>
      <tr>
        <td>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: 0,
              padding: 0,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            {c.complaintId || c._id}
          </button>
        </td>

        <td>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            style={{
              background: "transparent",
              border: 0,
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              fontWeight: 600,
            }}
          >
            {c.subject || "—"}
          </button>
        </td>

        <td>{c.user?.name || "—"}</td>

        <td>
          <select
            value={s}
            onChange={(e) => setS(e.target.value)}
            disabled={saving}
          >
            <option value="Submitted">Submitted</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </td>

        <td>
          <input
            value={n}
            onChange={(e) => setN(e.target.value)}
            placeholder={t("admin.complaints.remark")}
            disabled={saving}
          />
        </td>

        <td>
          <button
            type="button"
            className={twClass("gls-admin-primary")}
            onClick={() => void onSave(c._id, s, n)}
            disabled={saving}
            title="Save complaint"
          >
            <Save size={15} />
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>
        </td>
      </tr>

      {open && (
        <tr>
          <td colSpan={6}>
            <div
              style={{
                padding: "16px",
                margin: "4px 0",
                borderRadius: "12px",
                background: "var(--gls-admin-soft, #f8fafc)",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <strong>Complaint ID</strong>
                  <div>{c.complaintId || c._id}</div>
                </div>

                <div>
                  <strong>Citizen</strong>
                  <div>{c.user?.name || "—"}</div>
                </div>

                <div>
                  <strong>Email</strong>
                  <div>{c.user?.email || c.email || "—"}</div>
                </div>

                <div>
                  <strong>Mobile</strong>
                  <div>{c.user?.mobile || c.mobile || "—"}</div>
                </div>

                <div>
                  <strong>Category</strong>
                  <div>{c.category || "—"}</div>
                </div>

                <div>
                  <strong>Date</strong>
                  <div>
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <strong>Description</strong>
                <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
                  {c.description ||
                    c.details ||
                    c.message ||
                    "No description provided."}
                </div>
              </div>

              <div>
                <strong>Admin Reply / Remark</strong>

                <textarea
                  value={n}
                  onChange={(e) => setN(e.target.value)}
                  placeholder="Write your reply or remark..."
                  disabled={saving}
                  rows={4}
                  style={{
                    width: "100%",
                    marginTop: 8,
                    resize: "vertical",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    boxSizing: "border-box",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 10,
                  }}
                >
                  <button
                    type="button"
                    className={twClass("gls-admin-primary")}
                    onClick={() => void onSave(c._id, s, n)}
                    disabled={saving}
                  >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save Reply & Status"}
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
