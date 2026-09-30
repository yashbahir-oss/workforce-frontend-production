import { twClass } from "../../lib/tw";
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  Download,
  X,
} from "lucide-react";
import { useTranslation } from "../../../node_modules/react-i18next";
import { adminApi, fileUrl } from "../../lib/api";
import { toast } from "sonner";

const empty = {
  title: "",
  description: "",
  category: "Other",
  documentType: "",
  language: "mr",
  status: "draft",
};
export default function AdminDocuments() {
  const { t } = useTranslation();
  const [docs, setDocs] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const load = async () => {
    setLoading(true);
    try {
      const r = await adminApi.documents({ q, status, limit: 20 });
      setDocs(r.documents);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [status]);
  const open = (d: any = null) => {
    setEdit(d);
    setModal(true);
  };
  const openFile = async (url?: string) => {
    if (!url) return toast.error("Document file is unavailable");
    try {
      const token = localStorage.getItem("workforce_token");
      const r = await fetch(fileUrl(url), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!r.ok) throw new Error("Document unavailable");
      const blob = await r.blob();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to open document");
    }
  };
  const del = async (id: string) => {
    if (!window.confirm(t("admin.documents.confirmDelete"))) return;
    await adminApi.deleteDocument(id);
    void load();
  };
  return (
    <div>
      <div className={twClass("gls-admin-page-title")}>
        <div>
          <p>{t("admin.nav.documents")}</p>
          <h1>{t("admin.documents.title")}</h1>
          <span>{t("admin.documents.subtitle")}</span>
        </div>
        <button className={twClass("gls-admin-primary")} onClick={() => open()}>
          <Plus size={17} />
          {t("admin.documents.add")}
        </button>
      </div>
      <section className={twClass("gls-admin-card-v2")}>
        <div className={twClass("gls-admin-toolbar")}>
          <div className={twClass("gls-admin-searchbox")}>
            <Search size={17} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void load()}
              placeholder={t("admin.documents.search")}
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t("admin.common.allStatus")}</option>
            <option value="published">{t("admin.documents.published")}</option>
            <option value="draft">{t("admin.documents.draft")}</option>
            <option value="archived">{t("admin.documents.archived")}</option>
          </select>
          <button
            className={twClass("gls-admin-primary secondary")}
            onClick={() => void load()}
          >
            <Search size={16} />
            {t("admin.common.search")}
          </button>
        </div>
        {loading ? (
          <div className={twClass("gls-admin-loading")}>
            {t("admin.common.loading")}
          </div>
        ) : docs.length === 0 ? (
          <div className={twClass("gls-admin-empty-v2")}>
            {t("admin.documents.empty")}
          </div>
        ) : (
          <div className={twClass("gls-admin-table-scroll")}>
            <table className={twClass("gls-admin-data-table")}>
              <thead>
                <tr>
                  <th>{t("admin.documents.titleCol")}</th>
                  <th>{t("admin.documents.category")}</th>
                  <th>{t("admin.documents.language")}</th>
                  <th>{t("admin.documents.status")}</th>
                  <th>{t("admin.documents.file")}</th>
                  <th>{t("admin.documents.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <div className={twClass("gls-doc-cell")}>
                        <FileText size={18} />
                        <span>
                          <b>{d.title}</b>
                          <small>{d.description}</small>
                        </span>
                      </div>
                    </td>
                    <td>{d.category}</td>
                    <td>{d.language}</td>
                    <td>
                      <span className={twClass(`gls-pill ${d.status}`)}>
                        {d.status}
                      </span>
                    </td>
                    <td>{d.fileName || "—"}</td>
                    <td>
                      <div className={twClass("gls-row-actions")}>
                        <button
                          type="button"
                          onClick={() => void openFile(d.fileUrl)}
                          title={t("admin.documents.download")}
                        >
                          <Download size={15} />
                        </button>
                        <button onClick={() => open(d)}>
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => void del(d._id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {modal && (
        <DocumentModal
          t={t}
          edit={edit}
          onClose={() => setModal(false)}
          onSaved={() => {
            setModal(false);
            void load();
          }}
        />
      )}
    </div>
  );
}
function DocumentModal({
  t,
  edit,
  onClose,
  onSaved,
}: {
  t: any;
  edit: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ ...empty, ...edit });
  const [file, setFile] = useState<File | null>(null);
  const [thumb, setThumb] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const save = async () => {
    if (!form.title.trim() || (!edit && !file)) {
      alert(t("admin.documents.fileRequired"));
      return;
    }
    if (file && file.size > 15 * 1024 * 1024) {
      alert(t("admin.documents.fileTooLarge"));
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (
          [
            "_id",
            "createdAt",
            "updatedAt",
            "uploadedBy",
            "fileUrl",
            "fileName",
            "gridFsId",
          ].includes(k)
        )
          return;
        fd.append(k, String(v ?? ""));
      });
      if (file) fd.append("file", file);
      if (thumb) fd.append("thumbnail", thumb);
      if (edit) await adminApi.updateDocument(edit._id, fd);
      else await adminApi.createDocument(fd);
      onSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={twClass("gls-admin-modal-backdrop")}>
      <div className={twClass("gls-admin-modal")}>
        <div className={twClass("gls-admin-modal-head")}>
          <h2>{edit ? t("admin.documents.edit") : t("admin.documents.add")}</h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className={twClass("gls-admin-form-grid")}>
          {[
            ["title", t("admin.documents.form.title")],
            ["description", t("admin.documents.form.description")],
            ["category", t("admin.documents.form.category")],
            ["documentType", t("admin.documents.form.type")],
          ].map(([k, l]) => (
            <label key={k}>
              <span>{l}</span>
              <input
                value={form[k] || ""}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </label>
          ))}
          <label>
            <span>{t("admin.documents.form.language")}</span>
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            >
              <option value="mr">मराठी</option>
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </label>
          <label>
            <span>{t("admin.documents.form.status")}</span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="published">
                {t("admin.documents.published")}
              </option>
              <option value="draft">{t("admin.documents.draft")}</option>
              <option value="archived">{t("admin.documents.archived")}</option>
            </select>
          </label>
          <label className={twClass("file-label")}>
            <span>{t("admin.documents.form.file")}</span>
            <input
              ref={ref}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <label className={twClass("file-label")}>
            <span>{t("admin.documents.form.thumbnail")}</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => setThumb(e.target.files?.[0] || null)}
            />
          </label>
        </div>
        <div className={twClass("gls-admin-modal-actions")}>
          <button onClick={onClose}>{t("admin.common.cancel")}</button>
          <button
            className={twClass("gls-admin-primary")}
            disabled={busy}
            onClick={() => void save()}
          >
            {busy ? t("admin.common.saving") : t("admin.common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
