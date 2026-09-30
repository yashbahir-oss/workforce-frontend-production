import { twClass } from "../../lib/tw";
import { CheckCircle2, ImagePlus, MapPin, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "../../../node_modules/react-i18next";
import {
  catalogApi,
  fileUrl,
  jobsApi,
  type Category,
  type PublicWorker,
  workersApi,
} from "../../lib/api";
import { toast } from "sonner";

export default function PostRequirementPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const workerId = params.get("worker");
  const [worker, setWorker] = useState<PublicWorker | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const initialForm = {
    title: "",
    description: "",
    category: "",
    workersNeeded: "1",
    date: "",
    startTime: "",
    endTime: "",
    district: "",
    taluka: "",
    locality: "",
    address: "",
    budget: "",
    specialRequirements: "",
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    Promise.all([catalogApi.categories(), catalogApi.locations()])
      .then(([c, l]) => {
        setCategories(c.categories || []);
        setDistricts(l.districts || []);
      })
      .catch((e) => toast.error(e.message));
    if (workerId)
      workersApi
        .get(workerId)
        .then((r) => setWorker(r.worker))
        .catch(() => undefined);
  }, [workerId]);
  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.category)
      return toast.error(
        t("customer.post.categoryRequired", "Please select a category"),
      );
    setBusy(true);
    try {
      await jobsApi.create({
        ...form,
        workersNeeded: Number(form.workersNeeded) || 1,
        budget: form.budget ? Number(form.budget) : null,
        category: form.category,
        image,
      });
      setForm(initialForm);
      setImage(null);
      setImagePreview("");
      setSaved(true);
      toast.success(t("customer.post.success"));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={twClass("wf-page")}>
      <div className={twClass("wf-shell")}>
        <div className={twClass("wf-page-title")}>
          <h1>{t("customer.post.title")}</h1>
          <p>{t("customer.post.subtitle")}</p>
        </div>
        {worker && (
          <div className={twClass("wf-selected-worker")}>
            <img
              src={fileUrl(worker.profileImage) || "/worker-carpenter.jpg"}
              onError={(e) => {
                e.currentTarget.src = "/worker-carpenter.jpg";
              }}
              alt=""
            />
            <div>
              <b>{worker.name}</b>
              <span>
                {worker.profession || worker.headline} ·{" "}
                {[worker.taluka, worker.district].filter(Boolean).join(", ")}
              </span>
            </div>
            <span className={twClass("wf-verified")}>
              ✓ {t("customer.findWorkers.verified")}
            </span>
          </div>
        )}
        <form className={twClass("wf-panel")} onSubmit={submit}>
          <div className={twClass("wf-form-grid")}>
            <div className={twClass("wf-form-field")}>
              <label>
                {t("customer.post.titleField", "Requirement title")}
              </label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
              />
            </div>
            <div className={twClass("wf-form-field")}>
              <label>{t("customer.post.category")}</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                required
              >
                <option value="">{t("customer.post.category")}</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={twClass("wf-form-field")}>
              <label>{t("customer.post.workers")}</label>
              <input
                type="number"
                min="1"
                value={form.workersNeeded}
                onChange={(e) => set("workersNeeded", e.target.value)}
                required
              />
            </div>
            <div className={twClass("wf-form-field")}>
              <label>{t("customer.post.startDate")}</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                required
              />
            </div>
            <div className={twClass("wf-form-field")}>
              <label>{t("customer.post.startTime")}</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
              />
            </div>
            <div className={twClass("wf-form-field")}>
              <label>{t("customer.post.endTime")}</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
              />
            </div>
            <div className={twClass("wf-form-field")}>
              <label>{t("customer.post.district")}</label>
              <input
                list="post-district-list"
                value={form.district}
                onChange={(e) => {
                  set("district", e.target.value);
                  set("taluka", "");
                }}
                placeholder={t("customer.post.district")}
                required
              />
              <datalist id="post-district-list">
                {districts.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
            <div className={twClass("wf-form-field")}>
              <label>{t("customer.post.taluka")}</label>
              <input
                value={form.taluka}
                onChange={(e) => set("taluka", e.target.value)}
                placeholder={t("customer.post.taluka")}
              />
            </div>
            <div className={twClass("wf-form-field")}>
              <label>{t("customer.post.location")}</label>
              <div className={twClass("wf-search-input")}>
                <MapPin size={14} />
                <input
                  value={form.locality}
                  onChange={(e) => set("locality", e.target.value)}
                  placeholder={t("customer.post.locationPlaceholder")}
                />
              </div>
            </div>
            <div className={twClass("wf-form-field")}>
              <label>{t("customer.post.budget", "Budget")}</label>
              <input
                type="number"
                min="0"
                value={form.budget}
                onChange={(e) => set("budget", e.target.value)}
                placeholder={t("customer.post.budgetOptional", "Optional")}
              />
            </div>
            <div className={twClass("wf-form-field wf-form-full")}>
              <label>{t("customer.post.description")}</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder={t("customer.post.descriptionPlaceholder")}
                required
              />
            </div>
            <div className={twClass("wf-form-field wf-form-full")}>
              <label>{t("customer.post.special")}</label>
              <textarea
                value={form.specialRequirements}
                onChange={(e) => set("specialRequirements", e.target.value)}
                placeholder={t("customer.post.specialPlaceholder")}
              />
            </div>
            <div className={twClass("wf-form-field wf-form-full")}>
              <label>{t("customer.post.address", "Address")}</label>
              <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
            <div className={twClass("wf-form-field wf-form-full")}>
              <label>
                Work requirement image{" "}
                <span
                  className={twClass("text-[10px] font-normal text-slate-400")}
                >
                  (optional)
                </span>
              </label>
              <div
                className={twClass(
                  "rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3",
                )}
              >
                <label
                  className={twClass(
                    "inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm",
                  )}
                >
                  <ImagePlus size={15} /> Add work image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setImage(f);
                      setImagePreview(f ? URL.createObjectURL(f) : "");
                    }}
                  />
                </label>
                {imagePreview && (
                  <div
                    className={twClass(
                      "relative mt-3 w-full max-w-sm overflow-hidden rounded-xl border border-slate-200",
                    )}
                  >
                    <img
                      src={imagePreview}
                      alt="Work requirement preview"
                      className={twClass("h-40 w-full object-cover")}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview("");
                      }}
                      className={twClass(
                        "absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-slate-700 shadow",
                      )}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={twClass("wf-form-actions")}>
            <button
              className={twClass("wf-primary")}
              type="submit"
              disabled={busy}
            >
              {busy ? (
                t("common.loading")
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  {t("customer.post.submit")}
                </>
              )}
            </button>
          </div>
          {saved && (
            <div className={twClass("wf-success")}>
              {t("customer.post.success")}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
